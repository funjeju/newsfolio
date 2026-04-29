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

function buildBriefingPrompt(sectorScores: any[], toneLevel: number, className: string): string {
  const toneInstr = TONE_INSTRUCTIONS[toneLevel] ?? TONE_INSTRUCTIONS[3];
  const topScores = [...sectorScores].sort((a, b) => Math.abs(b.impactScore) - Math.abs(a.impactScore)).slice(0, 5);

  const scoreText = topScores.map(s =>
    `- ${s.sectorName}: ${s.impactScore > 0 ? "+" : ""}${s.impactScore}점 (${s.rationale})`
  ).join("\n");

  return `당신은 ${className} 학생들을 위한 AI 경제 뉴스 브리퍼입니다.
오늘의 섹터 영향도 점수를 바탕으로 학급 맞춤 브리핑을 작성해주세요.

## 톤 지침
${toneInstr}

## 오늘의 주요 섹터 점수
${scoreText}

## 요청사항
1. 헤드라인 (15자 이내, 오늘 가장 큰 뉴스 포인트)
2. 3~4개 섹터에 대한 짧은 설명 (각 2~3문장)
3. 오늘의 한 줄 경제 교훈

JSON 형식으로 반환하세요:
{
  "headline": "...",
  "sectorBriefs": [
    { "sectorName": "반도체", "brief": "..." }
  ],
  "todayLesson": "..."
}`;
}

// Runs after calcImpactScores at 06:10 KST (= 21:10 UTC)
export const generateBriefings = onSchedule(
  { schedule: "10 21 * * *", timeZone: "UTC", region: "asia-northeast3" },
  async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) { console.error("GEMINI_API_KEY not set"); return; }

    const genai = new GoogleGenAI({ apiKey });
    const today = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);

    // Fetch today's public scores
    const scoresDoc = await db.collection("publicScores").doc(today).get();
    if (!scoresDoc.exists) {
      console.error("No public scores found for", today);
      return;
    }
    const sectorScores = scoresDoc.data()?.sectorScores ?? [];

    // Fetch all running classes
    const classesSnap = await db.collection("classes")
      .where("seasonState", "==", "running")
      .get();

    for (const classDoc of classesSnap.docs) {
      const classData = classDoc.data();
      const toneLevel: number = classData.toneLevel ?? 3;
      const className: string = classData.className ?? "우리 반";

      const prompt = buildBriefingPrompt(sectorScores, toneLevel, className);

      try {
        const response = await genai.models.generateContent({
          model: "gemini-2.0-flash-lite",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: { temperature: 0.4 },
        });

        const text = response.text ?? "{}";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) continue;
        const parsed = JSON.parse(jsonMatch[0]);

        const briefingId = `${today}_${classDoc.id}`;
        const confirmMode = classData.confirmationMode ?? "always_teacher";

        await db.collection("briefings").doc(briefingId).set({
          id: briefingId,
          date: today,
          classId: classDoc.id,
          toneLevel,
          aiDraft: {
            headline: parsed.headline ?? "",
            sectorImpacts: sectorScores,
            sectorBriefs: parsed.sectorBriefs ?? [],
            todayLesson: parsed.todayLesson ?? "",
            generatedAt: admin.firestore.FieldValue.serverTimestamp(),
            promptVersion: "v1.0",
          },
          status: confirmMode === "ai_auto" ? "auto_approved" : "pending_review",
          cardNewsPublished: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Generated briefing for class ${classDoc.id}`);
      } catch (err) {
        console.error(`generateBriefings error for class ${classDoc.id}:`, err);
      }
    }
  }
);
