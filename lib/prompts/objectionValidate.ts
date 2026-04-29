// AI prompt for validating student objection logic quality
// Model: GPT-4o-mini | Called on objection creation trigger

export interface ObjectionValidateInput {
  sectorName: string;
  aiOriginalScore: number;
  proposedScore: number;
  logic: {
    why: string;
    keyEvidence: string;
    counterAcknowledgment: string;
  };
  sources: {
    domain: string;
    headline: string;
    publishedAt: string;
    hoursAgo: number;
  }[];
  toneLevel: 1 | 2 | 3 | 4;
}

export interface ObjectionValidateOutput {
  structuralCompleteness: number;   // 0~1: 논리 3요소 완성도
  evidenceStrength: number;          // 0~1: 출처 신뢰도 + 관련성
  logicalCoherence: number;          // 0~1: 논리 일관성
  counterAcknowledged: boolean;      // 반대 가능성 인정 여부
  proposedScoreReasonable: boolean;  // 제안 점수 합리성
  overallQuality: number;            // 0~1 종합 점수
  feedbackForStudent: string;        // 학생에게 보여줄 피드백 (친근한 말투)
  summaryForTeacher: string;         // 교사용 요약 (1~2줄)
}

export function buildObjectionValidatePrompt(input: ObjectionValidateInput): string {
  const scoreChange = input.proposedScore - input.aiOriginalScore;
  const sourcesBlock = input.sources
    .map(s => `- ${s.domain}: "${s.headline}" (${s.hoursAgo}시간 전, ${s.hoursAgo <= 24 ? '유효' : '기한초과'})`)
    .join('\n');

  return `당신은 초등/중학생의 경제 이의제기를 평가하는 교육 AI입니다.
학생의 논리 품질을 0~1 척도로 평가하고 건설적인 피드백을 제공해 주세요.

## 이의제기 내용
- 섹터: ${input.sectorName}
- AI 원안: ${input.aiOriginalScore > 0 ? '+' : ''}${input.aiOriginalScore}
- 학생 제안: ${input.proposedScore > 0 ? '+' : ''}${input.proposedScore} (${scoreChange > 0 ? '+' : ''}${scoreChange} 차이)

## 학생 논리
**왜 AI와 다르게 봤나요?**
${input.logic.why}

**핵심 근거:**
${input.logic.keyEvidence}

**반대 가능성 인정:**
${input.logic.counterAcknowledgment || '(작성 없음)'}

## 첨부 출처
${sourcesBlock}

## 평가 기준
1. 구조 완성도: 3가지 논리 요소(이유/근거/반론인정)가 모두 작성됐는지
2. 증거 강도: 유효한 출처의 내용이 주장을 직접 뒷받침하는지
3. 논리 일관성: 근거와 결론이 연결되는지, 비약이 없는지
4. 점수 합리성: 제안 점수가 증거로 지지될 수 있는 수준인지

## 출력 형식 (JSON)
{
  "structuralCompleteness": <0~1>,
  "evidenceStrength": <0~1>,
  "logicalCoherence": <0~1>,
  "counterAcknowledged": <true|false>,
  "proposedScoreReasonable": <true|false>,
  "overallQuality": <0~1, 위 4개의 가중 평균>,
  "feedbackForStudent": "<학생 대상 피드백. 칭찬 + 개선점. 2~3문장. 반말 금지. ~해요 체>",
  "summaryForTeacher": "<교사 대상 1~2줄 요약. 수용/거부 권고 포함>"
}

주의: 피드백은 교육적이고 동기 부여적이어야 합니다. 점수가 낮아도 노력을 인정해 주세요.
`;
}
