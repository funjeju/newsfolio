// Monthly retrospective: compare class portfolio bets vs real market

export interface MonthlyRetroInput {
  className: string;
  month: string;                   // "2026년 4월"
  toneLevel: 1 | 2 | 3 | 4;
  classBets: { sectorName: string; avgWeight: number }[];
  realMarketData?: {
    sectorName: string;
    realReturn: number;            // actual market return %
    newsHighlights: string;
  }[];
}

export function buildMonthlyRetroPrompt(input: MonthlyRetroInput): string {
  const { className, month, toneLevel, classBets, realMarketData } = input;

  const toneInstr: Record<number, string> = {
    1: "초등학교 1~2학년이 이해할 수 있는 매우 쉬운 언어로",
    2: "초등학교 3~4학년 수준의 쉬운 언어로",
    3: "초등학교 5~6학년 수준으로 경제 개념을 활용해서",
    4: "중학생 수준으로 경제 용어와 시장 원리를 활용해서",
  };

  const betsText = classBets.map(b => `- ${b.sectorName}: ${(b.avgWeight * 100).toFixed(0)}% 투자`).join("\n");
  const realText = realMarketData
    ? realMarketData.map(r => `- ${r.sectorName}: 실제 ${r.realReturn > 0 ? "+" : ""}${(r.realReturn * 100).toFixed(1)}% (${r.newsHighlights})`).join("\n")
    : "(실제 데이터 없음 — 일반적 설명으로 대체)";

  return `당신은 학교 경제 교육 플랫폼의 AI 월간 회고 작가입니다.
${className}의 ${month} 포트폴리오 결과를 분석해서 회고 자료를 만들어주세요.

## 톤 지침
${toneInstr[toneLevel] ?? toneInstr[3]} 작성해주세요.

## 우리 반의 베팅
${betsText}

## 실제 시장 결과
${realText}

## 요청사항
1. 이달 우리 반이 잘 맞춘 것과 틀린 것 비교 (2~3문장)
2. 핵심 교훈 3가지 (짧고 기억하기 쉽게)
3. 다음 달 주목할 트렌드 2~3가지
4. 학생들에게 전하는 응원 메시지 (1문장)

JSON 형식으로 반환하세요:
{
  "comparison": "...",
  "lessons": ["...", "...", "..."],
  "nextMonthFocus": ["...", "..."],
  "cheerMessage": "..."
}`;
}
