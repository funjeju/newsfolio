// AI auto-confirm prompt for evaluating whether an objection should be auto-accepted

export interface AutoConfirmInput {
  sectorName: string;
  aiOriginalScore: number;
  proposedScore: number;
  overallQuality: number;      // 0~1 from objectionValidate
  evidenceStrength: number;    // 0~1
  logicalCoherence: number;    // 0~1
  scoreDelta: number;          // |proposedScore - aiOriginalScore|
  confirmationMode: "ai_auto" | "mixed";
}

export interface AutoConfirmResult {
  decision: "accept" | "reject" | "escalate";
  finalScore: number;
  confidence: number;          // 0~1
  reasoning: string;
}

export function buildAutoConfirmPrompt(input: AutoConfirmInput): string {
  const { sectorName, aiOriginalScore, proposedScore, overallQuality, evidenceStrength, logicalCoherence, scoreDelta, confirmationMode } = input;

  const mixedThreshold = confirmationMode === "mixed" ? `\n중요: "mixed" 모드에서는 |점수 변동| >= 3이면 반드시 "escalate"를 반환하세요.` : "";

  return `당신은 학교 경제 교육 플랫폼 Newsfolio의 이의제기 자동 컨펌 AI입니다.
학생이 AI 섹터 영향도 점수에 이의를 제기했습니다. 당신은 이 이의제기를 자동으로 수용/거부/교사에게 전달할지 결정해야 합니다.

## 이의제기 정보

- 섹터: ${sectorName}
- AI 원안 점수: ${aiOriginalScore} / 학생 제안 점수: ${proposedScore} (변동: ${scoreDelta > 0 ? "+" : ""}${proposedScore - aiOriginalScore})
- AI 논리 검증 결과:
  - 종합 품질: ${(overallQuality * 100).toFixed(0)}점 / 100
  - 증거 강도: ${(evidenceStrength * 100).toFixed(0)}점 / 100
  - 논리 일관성: ${(logicalCoherence * 100).toFixed(0)}점 / 100
${mixedThreshold}

## 결정 기준

| 조건 | 결정 |
|------|------|
| 품질 >= 0.75 AND 증거 >= 0.7 AND 점수변동 <= 2 | accept |
| 품질 < 0.45 OR 증거 < 0.4 | reject |
| 그 외 | escalate (교사 검토) |

## 응답 형식 (JSON)

\`\`\`json
{
  "decision": "accept" | "reject" | "escalate",
  "finalScore": <수용 시 최종 점수, reject 시 aiOriginalScore 그대로>,
  "confidence": <0.0~1.0>,
  "reasoning": "<2~3문장으로 결정 이유 설명 (한국어)>"
}
\`\`\`

JSON 외 다른 텍스트 없이 응답하세요.`;
}
