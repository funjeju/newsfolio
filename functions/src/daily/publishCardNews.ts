import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";

const db = admin.firestore();

const TONE_INSTRUCTIONS: Record<number, string> = {
  1: "초등학교 1~2학년 어린이가 이해할 수 있도록, 매우 쉬운 단어만 사용하고 친근하게 설명해주세요.",
  2: "초등학교 3~4학년 어린이 수준으로, 쉬운 예시를 들어 설명해주세요.",
  3: "초등학교 5~6학년 학생 수준으로, 경제 기본 개념을 활용해서 설명해주세요.",
  4: "중학교 학생 수준으로, 약간의 경제 용어를 사용하되 핵심을 명확하게 설명해주세요.",
};

function buildCardNewsPrompt(
  sectorId: string,
  sectorName: string,
  impactScore: number,
  rationale: string,
  newsItems: any[],
  toneLevel: number
): string {
  const toneInstr = TONE_INSTRUCTIONS[toneLevel] ?? TONE_INSTRUCTIONS[3];
  const newsText = newsItems.slice(0, 3).map((n, i) =>
    `${i + 1}. ${n.title}\n   출처: ${n.source} | 요약: ${n.summary}`
  ).join("\n");

  return `당신은 학생을 위한 경제 뉴스 카드 작성자입니다.
아래 섹터의 오늘 영향도를 바탕으로 교육용 카드뉴스를 작성해주세요.

## 톤 지침
${toneInstr}

## 섹터 정보
- 섹터: ${sectorName} (${sectorId})
- 오늘 영향도 점수: ${impactScore > 0 ? "+" : ""}${impactScore}
- AI 분석 근거: ${rationale}

## 관련 뉴스
${newsText}

## 출력 형식 (JSON)
{
  "headline": "10~20자 핵심 헤드라인",
  "summary": "2~3문장 쉬운 요약 (이모지 1개 포함)",
  "keyTakeaway": "학생이 기억해야 할 핵심 포인트 1문장",
  "glossaryTerms": ["경제 용어1", "경제 용어2"],
  "discussionQuestion": "오늘 브리핑과 관련된 생각해볼 질문"
}

JSON만 출력하세요.`;
}

// 07:00 KST (22:00 UTC previous day) — after briefing confirmed
export const publishCardNews = onSchedule(
  { schedule: "0 22 * * *", timeZone: "Asia/Seoul", region: "asia-northeast3" },
  async () => {
    const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const todayKST = new Date().toLocaleDateString("ko-KR", {
      timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
    }).replace(/\. /g, "-").replace(".", "").trim();

    // Get approved/auto_approved briefings for today
    const briefingsSnap = await db.collection("briefings")
      .where("briefingDateRef", "==", todayKST)
      .where("status", "in", ["approved", "auto_approved"])
      .get();

    if (briefingsSnap.empty) {
      console.log("No approved briefings found for today:", todayKST);
      return;
    }

    // Get today's public scores for context
    const scoresSnap = await db.collection("publicScores")
      .where("date", "==", todayKST)
      .limit(1)
      .get();

    const sectorScores: Record<string, any> = {};
    if (!scoresSnap.empty) {
      const scores = scoresSnap.docs[0].data();
      for (const s of (scores.sectorScores ?? [])) {
        sectorScores[s.sectorId] = s;
      }
    }

    // Get today's newsItems grouped by sector
    const newsSnap = await db.collection("newsItems")
      .where("briefingDateRef", "==", todayKST)
      .get();

    const newsBySector: Record<string, any[]> = {};
    for (const doc of newsSnap.docs) {
      const data = doc.data();
      for (const tag of (data.sectorTags ?? [])) {
        if (!newsBySector[tag]) newsBySector[tag] = [];
        newsBySector[tag].push(data);
      }
    }

    const batch = db.batch();
    let published = 0;

    for (const briefingDoc of briefingsSnap.docs) {
      const briefing = briefingDoc.data();
      const classId = briefing.classId;
      const toneLevel: number = briefing.toneLevel ?? 3;

      // Get top 3 sectors by absolute impact
      const topSectors = Object.values(sectorScores)
        .sort((a: any, b: any) => Math.abs(b.impactScore) - Math.abs(a.impactScore))
        .slice(0, 3);

      for (const sector of topSectors) {
        const newsItems = newsBySector[sector.sectorId] ?? [];

        const prompt = buildCardNewsPrompt(
          sector.sectorId,
          sector.sectorName,
          sector.impactScore,
          sector.rationale ?? "",
          newsItems,
          toneLevel
        );

        try {
          const response = await genai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            config: { responseMimeType: "application/json" },
          });

          const raw = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
          const cardData = JSON.parse(raw);

          const reportRef = db.collection("reports").doc();
          batch.set(reportRef, {
            type: "card_news",
            classId,
            briefingDateRef: todayKST,
            sectorId: sector.sectorId,
            content: JSON.stringify(cardData),
            publishedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          published++;
        } catch (err) {
          console.error(`Card news generation failed for ${sector.sectorId}:`, err);
        }
      }

      // Mark briefing as card news published
      batch.update(briefingDoc.ref, {
        cardNewsPublished: true,
        cardNewsPublishedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
    console.log(`Published ${published} card news items for ${todayKST}`);
  }
);
