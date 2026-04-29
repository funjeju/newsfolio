// AI prompt for evaluating news source credibility
// Model: GPT-4o-mini | Called when student requests new domain whitelist

export interface CredibilityInput {
  domain: string;
  displayName?: string;
  studentReason: string;
  sampleHeadlines?: string[];
}

export interface CredibilityOutput {
  rating: number;         // 0~5 (integer)
  isNewsOrg: boolean;
  isAgeAppropriate: boolean;
  hasAdContent: boolean;
  recommendation: 'approve' | 'review' | 'reject';
  reasoning: string;      // 교사용 설명 1~2줄
}

export function buildCredibilityPrompt(input: CredibilityInput): string {
  const headlinesBlock = input.sampleHeadlines && input.sampleHeadlines.length > 0
    ? `\n샘플 헤드라인:\n${input.sampleHeadlines.map(h => `- ${h}`).join('\n')}`
    : '';

  return `당신은 초등/중학교 학생용 뉴스 플랫폼의 도메인 신뢰도 평가 AI입니다.
학생이 이의제기 출처로 사용하고 싶어하는 도메인을 평가해 주세요.

## 평가 대상
- 도메인: ${input.domain}
- 표시 이름: ${input.displayName || '미제공'}
- 학생 요청 이유: ${input.studentReason}
${headlinesBlock}

## 평가 기준
1. 공신력 있는 언론사/연구기관/정부기관인지
2. 초등/중학생에게 적합한 내용인지 (폭력, 성인 콘텐츠 없음)
3. 광고성 콘텐츠나 가짜뉴스 위험이 없는지
4. 경제/사회 분야 전문성이 있는지

## 신뢰도 등급 (rating)
- 5: 주요 언론사, 정부기관, 국제 공신력 기관 (한경, 매경, 연합뉴스, 기재부 등)
- 4: 업계 전문 매체, 지역 언론사 (전자신문, 아이뉴스24 등)
- 3: 일반 뉴스 블로그, 소규모 매체
- 2: 개인 블로그, 출처 불명확
- 1: 광고성 콘텐츠 의심
- 0: 부적절하거나 가짜뉴스 위험

## 출력 형식 (JSON)
{
  "rating": <0~5 정수>,
  "isNewsOrg": <true|false>,
  "isAgeAppropriate": <true|false>,
  "hasAdContent": <true|false>,
  "recommendation": <"approve"|"review"|"reject">,
  "reasoning": "<교사를 위한 판단 근거 1~2줄>"
}

rating 4 이상이면 approve, 2~3이면 review(교사 판단), 1 이하면 reject 권고.
`;
}
