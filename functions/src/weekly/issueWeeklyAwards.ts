import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";

const db = admin.firestore();

type AwardType =
  | "best_analyst"
  | "best_objector"
  | "most_active"
  | "best_group"
  | "comeback_king"
  | "steady_investor";

interface AwardCandidate {
  type: AwardType;
  recipientType: "individual" | "group";
  recipientId: string;
  recipientName: string;
  metric: number;
  context: string;
}

async function generateAwardReason(
  candidate: AwardCandidate,
  toneLevel: number,
  genai: GoogleGenAI
): Promise<string> {
  const tones: Record<number, string> = {
    1: "아주 쉽고 칭찬을 많이 넣어서",
    2: "쉬운 말로 친근하게",
    3: "명확하고 응원하는 톤으로",
    4: "전문적이지만 따뜻하게",
  };

  const prompt = `${tones[toneLevel] ?? tones[3]} 주간 시상 이유를 한 문장으로 작성해주세요.
수상자: ${candidate.recipientName}, 상 유형: ${candidate.type}, 성과: ${candidate.context}
JSON: { "reason": "수상 이유 한 문장" }`;

  const response = await genai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json" },
  });

  const raw = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  return JSON.parse(raw).reason ?? "";
}

// Every Friday 17:00 KST (08:00 UTC Friday)
export const issueWeeklyAwards = onSchedule(
  { schedule: "0 8 * * 5", timeZone: "Asia/Seoul", region: "asia-northeast3" },
  async () => {
    const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const now = new Date();
    const weekEnd = now.toISOString().split("T")[0];
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const period = `${weekStart}~${weekEnd}`;

    // Get all running classes
    const classesSnap = await db.collection("classes")
      .where("seasonState", "==", "running")
      .get();

    for (const classDoc of classesSnap.docs) {
      const classId = classDoc.id;
      const classData = classDoc.data();
      const toneLevel: number = classData.toneLevel ?? 3;
      const schoolId: string = classData.schoolId ?? "";

      const candidates: AwardCandidate[] = [];

      // 1. best_analyst: highest |reviewedScore - aiOriginalScore| this week
      const objSnap = await db.collection("objections")
        .where("classId", "==", classId)
        .where("status", "in", ["approved", "auto_approved"])
        .get();

      let bestAnalyst: { id: string; name: string; delta: number } | null = null;
      for (const doc of objSnap.docs) {
        const obj = doc.data();
        const delta = Math.abs((obj.reviewedScore ?? obj.proposedScore) - obj.aiOriginalScore);
        if (!bestAnalyst || delta > bestAnalyst.delta) {
          const userDoc = await db.collection("users").doc(obj.studentId).get();
          bestAnalyst = { id: obj.studentId, name: userDoc.data()?.displayName ?? "학생", delta };
        }
      }
      if (bestAnalyst) {
        candidates.push({
          type: "best_analyst",
          recipientType: "individual",
          recipientId: bestAnalyst.id,
          recipientName: bestAnalyst.name,
          metric: bestAnalyst.delta,
          context: `AI 대비 ${bestAnalyst.delta}점 차이 예측 성공`,
        });
      }

      // 2. most_active: highest objection count
      const objCountMap: Record<string, { count: number; name: string }> = {};
      for (const doc of objSnap.docs) {
        const { studentId } = doc.data();
        if (!objCountMap[studentId]) {
          const userDoc = await db.collection("users").doc(studentId).get();
          objCountMap[studentId] = { count: 0, name: userDoc.data()?.displayName ?? "학생" };
        }
        objCountMap[studentId].count++;
      }
      const mostActive = Object.entries(objCountMap).sort((a, b) => b[1].count - a[1].count)[0];
      if (mostActive) {
        candidates.push({
          type: "most_active",
          recipientType: "individual",
          recipientId: mostActive[0],
          recipientName: mostActive[1].name,
          metric: mostActive[1].count,
          context: `이번 주 이의제기 ${mostActive[1].count}회`,
        });
      }

      // 3. best_group: highest weekly return among groups
      const groupPortfoliosSnap = await db.collection("portfolios")
        .where("classId", "==", classId)
        .where("ownerType", "==", "group")
        .get();

      let bestGroup: { id: string; name: string; returnPct: number } | null = null;
      for (const doc of groupPortfoliosSnap.docs) {
        const p = doc.data();
        const cumulativeReturn = (p.currentValue - p.startingValue) / p.startingValue * 100;
        if (!bestGroup || cumulativeReturn > bestGroup.returnPct) {
          const groupDoc = await db.collection("groups").doc(p.ownerId).get();
          const groupName = groupDoc.data()?.groupName ?? "조";
          bestGroup = { id: p.ownerId, name: groupName, returnPct: cumulativeReturn };
        }
      }
      if (bestGroup) {
        candidates.push({
          type: "best_group",
          recipientType: "group",
          recipientId: bestGroup.id,
          recipientName: bestGroup.name,
          metric: bestGroup.returnPct,
          context: `누적 수익률 +${bestGroup.returnPct.toFixed(1)}%`,
        });
      }

      // Issue awards
      const batch = db.batch();
      for (const candidate of candidates) {
        let reason = "";
        try {
          reason = await generateAwardReason(candidate, toneLevel, genai);
        } catch {
          reason = `${candidate.context}으로 수상했습니다.`;
        }

        const awardRef = db.collection("awards").doc();
        batch.set(awardRef, {
          type: candidate.type,
          classId,
          schoolId,
          recipientType: candidate.recipientType,
          recipientId: candidate.recipientId,
          recipientName: candidate.recipientName,
          period,
          reason,
          aiGenerated: true,
          issuedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
      await batch.commit();
      console.log(`Weekly awards issued for class ${classId}: ${candidates.length} awards`);
    }
  }
);
