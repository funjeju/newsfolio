import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";

const db = admin.firestore();

function buildBestAnalystPrompt(
  studentName: string,
  sectorName: string,
  aiScore: number,
  finalScore: number,
  logic: { why: string; keyEvidence: string; counterAcknowledgment: string },
  toneLevel: number
): string {
  const tones: Record<number, string> = {
    1: "아주 쉽고 친근하게, 칭찬을 많이 넣어서",
    2: "쉬운 말로 친근하게",
    3: "명확하고 칭찬하는 톤으로",
    4: "전문적이지만 응원하는 톤으로",
  };
  const tone = tones[toneLevel] ?? tones[3];

  return `당신은 경제 시뮬레이션 수업의 진행자입니다.
오늘의 최우수 애널리스트를 ${tone} 소개해주세요.

## 오늘의 최우수 애널리스트 정보
- 이름: ${studentName}
- 예측 섹터: ${sectorName}
- AI 원래 점수: ${aiScore > 0 ? "+" : ""}${aiScore}
- 최종 확정 점수: ${finalScore > 0 ? "+" : ""}${finalScore}
- 점수 차이: ${finalScore - aiScore > 0 ? "+" : ""}${finalScore - aiScore}점 예측 성공
- 논리 요약: ${logic.why}
- 핵심 근거: ${logic.keyEvidence}
- 반론 인정: ${logic.counterAcknowledgment}

## 출력 형식 (JSON)
{
  "announcement": "50~80자 반 전체에게 발표하는 수상 멘트 (이모지 포함)",
  "reasoning": "이 학생이 왜 훌륭했는지 1~2문장 설명",
  "learningPoint": "반 전체가 배울 수 있는 인사이트 1문장",
  "cheerMessage": "수상 학생에게 직접 하는 짧은 응원 메시지"
}

JSON만 출력하세요.`;
}

// 17:30 KST (08:30 UTC) — after portfolio values calculated
export const announceBestAnalyst = onSchedule(
  { schedule: "30 8 * * *", timeZone: "Asia/Seoul", region: "asia-northeast3" },
  async () => {
    const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const todayKST = new Date().toLocaleDateString("ko-KR", {
      timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
    }).replace(/\. /g, "-").replace(".", "").trim();

    // Find the best objection per class: approved, highest |finalScore - aiScore|
    const objSnap = await db.collection("objections")
      .where("status", "in", ["approved", "auto_approved"])
      .get();

    // Group by classId, pick best per class
    const bestByClass: Record<string, any> = {};

    for (const doc of objSnap.docs) {
      const obj = doc.data();
      const delta = Math.abs((obj.reviewedScore ?? obj.proposedScore) - obj.aiOriginalScore);
      const existing = bestByClass[obj.classId];
      if (!existing || delta > existing.delta) {
        bestByClass[obj.classId] = { ...obj, id: doc.id, delta };
      }
    }

    const batch = db.batch();

    for (const [classId, best] of Object.entries(bestByClass)) {
      // Get student display name
      const userSnap = await db.collection("users").doc(best.studentId).get();
      const studentName = userSnap.data()?.displayName ?? "익명 학생";

      // Get class tone level
      const classSnap = await db.collection("classes").doc(classId).get();
      const toneLevel: number = classSnap.data()?.toneLevel ?? 3;
      const className: string = classSnap.data()?.className ?? "";

      // Get sector name from publicScores
      const scoresSnap = await db.collection("publicScores")
        .where("date", "==", todayKST)
        .where("classId", "==", classId)
        .limit(1).get();

      let sectorName = best.sectorId;
      if (!scoresSnap.empty) {
        const scores = scoresSnap.docs[0].data();
        const sectorData = (scores.sectorScores ?? []).find((s: any) => s.sectorId === best.sectorId);
        if (sectorData) sectorName = sectorData.sectorName;
      }

      const finalScore = best.reviewedScore ?? best.proposedScore;

      const prompt = buildBestAnalystPrompt(
        studentName,
        sectorName,
        best.aiOriginalScore,
        finalScore,
        best.logic ?? {},
        toneLevel
      );

      try {
        const response = await genai.models.generateContent({
          model: "gemini-2.0-flash-lite",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: { responseMimeType: "application/json" },
        });

        const raw = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
        const announcement = JSON.parse(raw);

        // Write to reports collection
        const reportRef = db.collection("reports").doc();
        batch.set(reportRef, {
          type: "card_news",
          classId,
          briefingDateRef: todayKST,
          content: JSON.stringify({
            awardType: "best_analyst",
            studentName,
            studentId: best.studentId,
            sectorName,
            aiScore: best.aiOriginalScore,
            finalScore,
            scoreDelta: finalScore - best.aiOriginalScore,
            ...announcement,
          }),
          publishedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Also write to awards collection
        const awardRef = db.collection("awards").doc();
        batch.set(awardRef, {
          type: "best_analyst",
          classId,
          schoolId: classSnap.data()?.schoolId ?? "",
          recipientType: "individual",
          recipientId: best.studentId,
          recipientName: studentName,
          period: todayKST,
          reason: announcement.reasoning ?? "",
          aiGenerated: true,
          issuedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Best analyst announced: ${studentName} (${classId})`);
      } catch (err) {
        console.error(`Best analyst announcement failed for class ${classId}:`, err);
      }
    }

    await batch.commit();
    console.log(`Best analyst announcements done for ${todayKST}`);
  }
);
