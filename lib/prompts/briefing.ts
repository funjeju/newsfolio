// AI prompt for class-specific briefing generation (4 tone levels)
// Model: Gemini 2.0 Flash | Called after impact scores are finalized

export type ToneLevel = 1 | 2 | 3 | 4;

const TONE_DESCRIPTIONS: Record<ToneLevel, string> = {
  1: "초등학교 1~2학년: 매우 쉬운 단어, 10단어 이하 문장, 이모지 적극 사용, 비유 중심",
  2: "초등학교 3~4학년: 쉬운 단어, 짧은 문장, 일상 예시로 경제 개념 설명",
  3: "초등학교 5~6학년: 기본 경제 용어 허용, 괄호 설명 포함, 2~3문장 구성",
  4: "중학생: 경제 용어 자유롭게 사용, 논리적 분석 포함, 4~5문장 가능",
};

export interface BriefingInput {
  date: string;
  classId: string;
  toneLevel: ToneLevel;
  sectorScores: {
    sectorName: string;
    impactScore: number;
    rationale: string;
    rank: number;
    rankChange: number;
  }[];
  studentObjctions?: {
    sectorName: string;
    proposedScore: number;
    logicSummary: string;
    adopted: boolean;
  }[];
}

export function buildBriefingPrompt(input: BriefingInput): string {
  const toneDesc = TONE_DESCRIPTIONS[input.toneLevel];
  const topSectors = input.sectorScores.slice(0, 3);
  const bottomSectors = input.sectorScores.slice(-2);

  const objectionBlock = input.studentObjctions && input.studentObjctions.length > 0
    ? `\n## 학생 이의제기 반영 결과\n${input.studentObjctions.map(o =>
        `- ${o.sectorName}: 학생 제안 ${o.proposedScore > 0 ? '+' : ''}${o.proposedScore} (${o.adopted ? '채택됨' : '미채택'})`
      ).join('\n')}`
    : '';

  return `당신은 초등학교/중학교 학생들을 위한 경제 뉴스 브리핑을 작성하는 AI입니다.

## 오늘의 섹터 영향도 결과
상위 섹터:
${topSectors.map(s => `- ${s.sectorName}: ${s.impactScore > 0 ? '+' : ''}${s.impactScore}점 (${s.rationale})`).join('\n')}

하위 섹터:
${bottomSectors.map(s => `- ${s.sectorName}: ${s.impactScore}점 (${s.rationale})`).join('\n')}
${objectionBlock}

## 대상 학년 및 말투
${toneDesc}

## 출력 형식 (JSON)
{
  "headline": "<오늘의 경제 브리핑 헤드라인 1줄, 20자 이내>",
  "intro": "<오늘 경제 상황 전체 요약 1~2문장, 톤에 맞게>",
  "topSectorComment": "<오늘 가장 주목할 섹터에 대한 설명, 2~3문장>",
  "studentChallengeNote": "<학생들에게 오늘 생각해볼 질문 1개>",
  "emoji": "<오늘의 경제 분위기를 나타내는 이모지 1~2개>"
}

## 주의사항
- 톤 레벨 ${input.toneLevel}에 맞는 언어 수준을 반드시 지켜주세요
- 투자 권유나 특정 기업 추천 절대 금지
- 긍정적이고 학습 동기를 부여하는 톤 유지
- 뉴스 사실에 기반한 내용만 작성
`;
}
