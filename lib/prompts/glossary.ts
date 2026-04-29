// On-demand glossary term generation prompt for 4 tone levels

export interface GlossaryInput {
  term: string;
  sectorContext?: string;
}

export function buildGlossaryPrompt(input: GlossaryInput): string {
  const { term, sectorContext } = input;

  return `당신은 초등학생과 중학생에게 경제 용어를 쉽게 설명하는 AI 선생님입니다.
"${term}"이라는 용어를 4가지 학년 수준에 맞게 설명해주세요.${sectorContext ? `\n관련 섹터: ${sectorContext}` : ""}

## 각 톤 레벨 기준
- Tone 1 (초1~2): 아주 쉬운 단어, 일상 예시 (문장 2개 이내)
- Tone 2 (초3~4): 쉬운 단어, 친근한 예시 (문장 3개 이내)
- Tone 3 (초5~6): 기본 경제 개념 활용, 실제 사례 (문장 3~4개)
- Tone 4 (중학생): 정확한 경제 용어 사용, 시장 메커니즘 설명 (문장 4~5개)

## 응답 형식 (JSON)
{
  "term": "${term}",
  "category": "<investment|sector_general|sector_specific|news_term>",
  "explanations": {
    "tone1": "...",
    "tone2": "...",
    "tone3": "...",
    "tone4": "..."
  },
  "examples": {
    "tone1": "예: ...",
    "tone2": "예: ...",
    "tone3": "예: ...",
    "tone4": "예: ..."
  },
  "relatedTerms": ["<관련 용어 2~3개>"]
}

JSON만 반환하세요.`;
}
