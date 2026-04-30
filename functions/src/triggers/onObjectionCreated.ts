import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { GoogleGenAI } from "@google/genai";

const db = admin.firestore();

const VALIDATION_PROMPT_TEMPLATE = (data: Record<string, any>) => `
당신은 학교 경제 교육 플랫폼의 이의제기 논리 검증 AI입니다.
학생의 이의제기를 평가해서 교사가 빠르게 검토할 수 있도록 요약해주세요.

## 이의제기 내용
- 섹터: ${data.sectorId}
- AI 원안 점수: ${data.aiOriginalScore} / 학생 제안: ${data.proposedScore}
- 왜 다르게 봤나: ${data.logic?.why ?? ""}
- 핵심 근거: ${data.logic?.keyEvidence ?? ""}
- 반대 의견 인정: ${data.logic?.counterAcknowledgment ?? ""}
- 출처 수: ${(data.sourceNewsIds ?? []).length}개

## 평가 항목 (0.0~1.0)
- structuralCompleteness: 왜/근거/반대의견 3요소가 모두 있는가
- evidenceStrength: 출처와 근거가 주장을 잘 뒷받침하는가
- logicalCoherence: 논리가 일관되고 모순이 없는가
- counterAcknowledged: 반대 가능성을 인정했는가 (bool)
- proposedScoreReasonable: 제안 점수가 근거에 비해 합리적인가 (bool)
- overallQuality: 종합 품질 점수

## 응답 형식 (JSON)
{
  "structuralCompleteness": 0.0,
  "evidenceStrength": 0.0,
  "logicalCoherence": 0.0,
  "counterAcknowledged": false,
  "proposedScoreReasonable": true,
  "overallQuality": 0.0,
  "feedbackForStudent": "<학생에게 전달할 1~2문장 피드백>",
  "summaryForTeacher": "<교사에게 전달할 1문장 요약>"
}

JSON만 반환하세요.
`;

export const onObjectionCreated = onDocumentCreated(
  { document: "objections/{objectionId}", region: "asia-northeast3" },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const data = snap.data();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY not set");
      return;
    }

    const genai = new GoogleGenAI({ apiKey });

    try {
      const response = await genai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: [{ role: "user", parts: [{ text: VALIDATION_PROMPT_TEMPLATE(data) }] }],
        config: { temperature: 0.1 },
      });

      const text = response.text ?? "{}";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("No JSON in validation response");
        return;
      }

      const validation = JSON.parse(jsonMatch[0]);

      await db.collection("objections").doc(snap.id).update({
        aiValidation: validation,
      });

      // If class uses auto confirm mode, trigger decision
      if (data.classId) {
        const classDoc = await db.collection("classes").doc(data.classId).get();
        const confirmMode = classDoc.data()?.confirmationMode ?? "always_teacher";

        if (confirmMode === "ai_auto") {
          const { overallQuality, evidenceStrength } = validation;
          const scoreDelta = Math.abs(data.proposedScore - data.aiOriginalScore);

          let decision: string;
          if (overallQuality >= 0.75 && evidenceStrength >= 0.7 && scoreDelta <= 2) {
            decision = "accepted";
          } else if (overallQuality < 0.45 || evidenceStrength < 0.4) {
            decision = "rejected";
          } else {
            return; // escalate to teacher — no auto update
          }

          await db.collection("objections").doc(snap.id).update({
            status: decision,
            reviewedScore: decision === "accepted" ? data.proposedScore : undefined,
            reviewedBy: "ai_auto",
            reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      console.log(`Validated objection ${snap.id}`);
    } catch (err) {
      console.error("onObjectionCreated error:", err);
    }
  }
);
