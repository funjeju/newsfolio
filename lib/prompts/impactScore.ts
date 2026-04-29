// AI prompt for daily sector impact score generation
// Model: Gemini 2.0 Flash | Called at 06:00 KST daily

export interface ImpactScoreInput {
  date: string;
  sectorId: string;
  sectorName: string;
  sectorKeywords: string[];
  newsItems: {
    title: string;
    summary: string;
    source: string;
    url: string;
    publishedAt: string;
  }[];
  previousScore?: number;
}

export interface ImpactScoreOutput {
  sectorId: string;
  impactScore: number;       // -5 ~ +5
  dailyReturn: number;       // impactScore * 0.005
  duration: 'short' | 'medium' | 'long';
  risk: 'low' | 'mid' | 'high';
  rationale: string;         // 2-3 sentences, tone3 (초5-6 기준)
  keyNewsIds: string[];
  glossaryTermIds?: string[];
}

export function buildImpactScorePrompt(input: ImpactScoreInput): string {
  const hasNews = input.newsItems.length > 0;

  const newsBlock = hasNews
    ? input.newsItems
        .map((n, i) => `[뉴스${i + 1}] ${n.title}\n요약: ${n.summary}\n출처: ${n.source} (${n.publishedAt})`)
        .join("\n\n")
    : "※ 오늘 뉴스 데이터를 수집하지 못했습니다. 섹터 키워드와 최근 시장 동향 일반 지식을 바탕으로 분석해 주세요.";

  return `당신은 초등학교 5~6학년 학생들을 위한 경제 교육 플랫폼의 AI 분석가입니다.
오늘 "${input.sectorName}" 섹터의 영향도를 분석해 주세요.

## 분석 대상 섹터
- 이름: ${input.sectorName}
- 핵심 키워드: ${input.sectorKeywords.join(', ')}
- 전일 점수: ${input.previousScore ?? '없음 (첫 분석)'}

## 오늘 수집된 뉴스 (${input.newsItems.length}건)
${newsBlock}

## 출력 형식 (JSON)
{
  "impactScore": <-5부터 +5 사이의 정수>,
  "duration": <"short" | "medium" | "long">,
  "risk": <"low" | "mid" | "high">,
  "rationale": "<초등학교 고학년이 이해할 수 있는 2~3문장 설명. 쉬운 단어 사용. 수동태 금지.>",
  "keyNewsIndices": [<핵심 뉴스 번호 배열, 예: [0, 2]. 뉴스 없으면 []>]
}

## 점수 기준
- +5: 매우 강한 호재 (규제 완화, 사상 최대 실적, 독점 계약 등)
- +3~+4: 호재 (수요 증가, 투자 확대, 정책 지원)
- +1~+2: 소폭 호재 (긍정적 전망, 작은 계약)
- 0: 중립 (뚜렷한 영향 없음)
- -1~-2: 소폭 악재 (경쟁 심화, 소폭 원가 상승)
- -3~-4: 악재 (수요 감소, 규제 강화, 실적 악화)
- -5: 매우 강한 악재 (시장 붕괴 수준의 충격)

## 주의사항
- rationale은 반드시 초등학교 5~6학년 수준의 언어로 작성하세요
- "하였습니다" 같은 딱딱한 표현 대신 "~했어요", "~예요" 형식 사용
- 전문 용어가 나올 경우 괄호 안에 간단한 설명 추가
- 뉴스가 없을 경우 일반적인 시장 상황을 근거로 중립(0) 또는 소폭 점수를 부여하고 rationale에 "오늘 관련 뉴스가 많지 않아요" 언급
`;
}
