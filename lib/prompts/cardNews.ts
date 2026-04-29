// AI prompt for generating weekly card news content
// Model: Gemini 2.0 Flash | Called on weekly publish schedule

export function buildCardNewsPrompt(input: {
  date: string;
  toneLevel: 1 | 2 | 3 | 4;
  topSector: { name: string; icon: string; score: number; rationale: string };
  bottomSector: { name: string; icon: string; score: number; rationale: string };
  weekHighlight: string;
  classStats?: { avgReturn: number; topGroup: string };
}): string {
  return `당신은 초등/중학교 학급 신문의 카드뉴스를 제작하는 AI입니다.
이번 주 경제 뉴스를 학생들이 좋아할 카드뉴스로 만들어 주세요.

## 이번 주 데이터
- 날짜: ${input.date}
- 톤 레벨: ${input.toneLevel}
- 주간 MVP 섹터: ${input.topSector.icon} ${input.topSector.name} (${input.topSector.score > 0 ? '+' : ''}${input.topSector.score})
  근거: ${input.topSector.rationale}
- 주간 최하위 섹터: ${input.bottomSector.icon} ${input.bottomSector.name} (${input.bottomSector.score})
  근거: ${input.bottomSector.rationale}
- 주간 하이라이트: ${input.weekHighlight}
${input.classStats ? `- 반 평균 수익률: ${input.classStats.avgReturn}% | 1등 조: ${input.classStats.topGroup}` : ''}

## 출력 형식 (JSON)
{
  "title": "<카드뉴스 메인 타이틀 (15자 이내)>",
  "subtitle": "<부제목 1줄>",
  "cards": [
    {
      "cardNumber": 1,
      "emoji": "<이모지>",
      "headline": "<카드 제목 (10자 이내)>",
      "body": "<내용 2~3줄>"
    }
  ],
  "closingMessage": "<이번 주를 마치며 학생들에게 하는 말 1줄>"
}

카드는 3~5장으로 구성하세요. 각 카드는 독립적으로 이해 가능해야 합니다.
`;
}
