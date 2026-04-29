import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";

const db = admin.firestore();

const TONE_INSTRUCTIONS: Record<number, string> = {
  1: "초등학교 1~2학년이 이해할 수 있도록 매우 쉽고 친근하게",
  2: "초등학교 3~4학년 수준으로 쉬운 예시와 함께",
  3: "초등학교 5~6학년 수준으로 경제 개념을 활용해",
  4: "중학생 수준으로 경제 용어를 적절히 활용해",
};

function buildRetroPrompt(
  classId: string,
  period: string,
  topSectors: Array<{ name: string; avgScore: number }>,
  classAvgReturn: number,
  toneLevel: number
): string {
  const toneInstr = TONE_INSTRUCTIONS[toneLevel] ?? TONE_INSTRUCTIONS[3];
  const sectorText = topSectors.map(s =>
    `- ${s.name}: 평균 AI 점수 ${s.avgScore > 0 ? "+" : ""}${s.avgScore.toFixed(1)}`
  ).join("\n");

  return `당신은 초중등 학생을 위한 월간 경제 회고 리포트 작성자입니다.
${toneInstr} 이번 달 경제 시뮬레이션을 돌아보는 리포트를 작성해주세요.

## 이번 달 정보
- 기간: ${period}
- 반 평균 수익률: ${classAvgReturn > 0 ? "+" : ""}${(classAvgReturn * 100).toFixed(1)}%
- 주요 섹터 점수:
${sectorText}

## 출력 형식 (JSON)
{
  "headline": "이번 달을 한마디로 표현하는 제목 (20자 이내)",
  "summary": "이번 달 전체 경제 흐름 요약 (3문장)",
  "topLesson": "학생들이 이번 달에 배운 가장 중요한 교훈",
  "nextMonthFocus": "다음 달에 주목할 경제 트렌드",
  "cheerMessage": "반 전체에게 보내는 응원 메시지"
}

JSON만 출력하세요.`;
}

// Last day of month at 18:00 KST (09:00 UTC) — after monthly rankings
export const generateMonthlyRetro = onSchedule(
  { schedule: "0 9 28-31 * *", timeZone: "Asia/Seoul", region: "asia-northeast3" },
  async () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (tomorrow.getDate() !== 1) return;

    const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const period = `${year}-${month}`;

    const classesSnap = await db.collection("classes")
      .where("seasonState", "in", ["running", "final_week"])
      .get();

    for (const classDoc of classesSnap.docs) {
      const classId = classDoc.id;
      const classData = classDoc.data();
      const toneLevel: number = classData.toneLevel ?? 3;

      // Get sector scores for the month
      const scoresSnap = await db.collection("publicScores")
        .where("classId", "==", classId)
        .where("date", ">=", `${year}-${month}-01`)
        .where("date", "<=", `${year}-${month}-31`)
        .get();

      // Aggregate sector averages
      const sectorSum: Record<string, { sum: number; count: number; name: string }> = {};
      for (const doc of scoresSnap.docs) {
        const data = doc.data();
        for (const s of (data.sectorScores ?? [])) {
          if (!sectorSum[s.sectorId]) sectorSum[s.sectorId] = { sum: 0, count: 0, name: s.sectorName ?? s.sectorId };
          sectorSum[s.sectorId].sum += s.impactScore;
          sectorSum[s.sectorId].count++;
        }
      }

      const topSectors = Object.values(sectorSum)
        .map(v => ({ name: v.name, avgScore: v.sum / v.count }))
        .sort((a, b) => Math.abs(b.avgScore) - Math.abs(a.avgScore))
        .slice(0, 5);

      // Class average return from ranking
      const rankingSnap = await db.collection("rankings")
        .doc(`${classId}_${period}`)
        .get();

      let classAvgReturn = 0;
      if (rankingSnap.exists()) {
        const rankings = rankingSnap.data()?.individual ?? [];
        if (rankings.length > 0) {
          classAvgReturn = rankings.reduce((sum: number, r: any) => sum + r.cumulativeReturn, 0) / rankings.length;
        }
      }

      const prompt = buildRetroPrompt(classId, period, topSectors, classAvgReturn, toneLevel);

      try {
        const response = await genai.models.generateContent({
          model: "gemini-2.0-flash-lite",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: { responseMimeType: "application/json" },
        });

        const raw = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
        const retro = JSON.parse(raw);

        await db.collection("reports").add({
          type: "monthly_brief",
          classId,
          period,
          content: JSON.stringify(retro),
          publishedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Monthly retro generated for class ${classId}, period ${period}`);
      } catch (err) {
        console.error(`Monthly retro generation failed for class ${classId}:`, err);
      }
    }
  }
);
