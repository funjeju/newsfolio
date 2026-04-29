import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";

const db = admin.firestore();

const SECTORS = [
  { id: "semiconductor", name: "반도체", keywords: ["반도체", "삼성전자", "SK하이닉스", "TSMC", "HBM", "메모리"] },
  { id: "automotive", name: "자동차", keywords: ["자동차", "현대차", "기아", "전기차", "배터리"] },
  { id: "game", name: "게임", keywords: ["게임", "넥슨", "엔씨소프트", "크래프톤", "모바일게임"] },
  { id: "content", name: "콘텐츠·연예", keywords: ["엔터테인먼트", "OTT", "K팝", "웹툰", "콘텐츠"] },
  { id: "travel", name: "여행·관광", keywords: ["항공", "여행", "관광", "호텔", "코로나"] },
  { id: "green_energy", name: "친환경에너지", keywords: ["친환경", "재생에너지", "태양광", "풍력", "수소"] },
  { id: "food", name: "식품", keywords: ["식품", "농산물", "식료품", "물가", "외식"] },
  { id: "construction", name: "건설", keywords: ["건설", "부동산", "아파트", "금리", "주택"] },
  { id: "geopolitics", name: "국제정세", keywords: ["지정학", "미중", "북한", "외교", "전쟁", "제재"] },
  { id: "global_trade", name: "글로벌무역", keywords: ["수출", "관세", "무역", "환율", "FTA"] },
];

function buildSectorPrompt(sectorName: string, keywords: string[], articles: any[]): string {
  const articleSummaries = articles
    .filter(a => a.sectorTags?.includes(sectorName) || keywords.some((k: string) => a.title?.includes(k)))
    .slice(0, 5)
    .map((a: any, i: number) => `[${i}] ${a.title}\n${a.summary}`)
    .join("\n\n");

  return `당신은 초등학교~중학교 학생 경제 교육 플랫폼의 AI 분석가입니다.
오늘의 뉴스를 바탕으로 "${sectorName}" 섹터의 영향도를 분석해주세요.

## 오늘의 관련 뉴스
${articleSummaries || "(관련 뉴스 없음)"}

## 분석 기준
- impactScore: -5(강한 악재) ~ +5(강한 호재), 0은 중립
- duration: "short"(1~3일) / "medium"(1~2주) / "long"(한 달 이상)
- risk: "low" / "mid" / "high"
- rationale: 학생이 이해할 수 있는 3문장 이내 설명

## 응답 형식 (JSON)
{
  "impactScore": <정수>,
  "duration": "<short|medium|long>",
  "risk": "<low|mid|high>",
  "rationale": "<한글 설명>",
  "keyNewsIndices": [<관련 기사 번호>]
}

JSON만 반환하세요.`;
}

// Runs daily at 06:00 KST (= 21:00 UTC)
export const calcImpactScores = onSchedule(
  { schedule: "0 21 * * *", timeZone: "UTC", region: "asia-northeast3" },
  async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) { console.error("GEMINI_API_KEY not set"); return; }

    const genai = new GoogleGenAI({ apiKey });
    const today = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);

    // Fetch today's articles
    const newsSnap = await db.collection("newsItems")
      .where("briefingDateRef", "==", today)
      .get();
    const articles = newsSnap.docs.map(d => d.data());

    const results: { sectorId: string; data: any }[] = [];

    for (const sector of SECTORS) {
      const prompt = buildSectorPrompt(sector.name, sector.keywords, articles);
      try {
        const response = await genai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: { temperature: 0.2 },
        });

        const text = response.text ?? "{}";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) continue;

        const parsed = JSON.parse(jsonMatch[0]);
        results.push({ sectorId: sector.id, data: parsed });
      } catch (err) {
        console.error(`calcImpactScores error for ${sector.id}:`, err);
      }
    }

    // Sort by impactScore to get ranks
    const sorted = [...results].sort((a, b) => (b.data.impactScore ?? 0) - (a.data.impactScore ?? 0));

    const batch = db.batch();

    // Fetch yesterday's scores for rankChange
    const yesterdaySnap = await db.collection("publicScores")
      .where("date", "<", today)
      .orderBy("date", "desc")
      .limit(1)
      .get();
    const yesterdayScores: Record<string, number> = {};
    if (!yesterdaySnap.empty) {
      const yData = yesterdaySnap.docs[0].data();
      (yData.sectorScores ?? []).forEach((s: any) => { yesterdayScores[s.sectorId] = s.rank; });
    }

    const sectorScores = sorted.map((r, i) => ({
      sectorId: r.sectorId,
      sectorName: SECTORS.find(s => s.id === r.sectorId)?.name ?? r.sectorId,
      impactScore: r.data.impactScore ?? 0,
      duration: r.data.duration ?? "short",
      risk: r.data.risk ?? "mid",
      dailyReturn: (r.data.impactScore ?? 0) * 0.005,
      rank: i + 1,
      rankChange: (yesterdayScores[r.sectorId] ?? i + 1) - (i + 1),
      rationale: r.data.rationale ?? "",
      keyNewsIds: [],
    }));

    // Write publicScores doc
    const publicRef = db.collection("publicScores").doc(today);
    batch.set(publicRef, {
      id: today,
      date: today,
      toneLevel: 3,
      sectorScores,
      headline: `${today} AI 뉴스 분석 완료`,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      publishedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Write individual impactScores docs
    for (const score of sectorScores) {
      const impactRef = db.collection("impactScores").doc(`${today}_global_${score.sectorId}`);
      batch.set(impactRef, {
        id: `${today}_global_${score.sectorId}`,
        date: today,
        classId: "global",
        sectorId: score.sectorId,
        impactScore: score.impactScore,
        duration: score.duration,
        risk: score.risk,
        version: "ai_draft",
        dailyReturn: score.dailyReturn,
        dailyRankInClass: score.rank,
        rankChangeFromYesterday: score.rankChange,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
    console.log(`calcImpactScores: wrote ${sectorScores.length} scores for ${today}`);
  }
);
