// Teacher class performance summary report prompt

export interface TeacherReportInput {
  className: string;
  periodLabel: string;           // e.g. "2026년 4주차"
  totalStudents: number;
  avgReturn: number;             // cumulative %
  topStudentName: string;
  topStudentReturn: number;
  totalObjections: number;
  acceptedObjections: number;
  avgObjectionQuality: number;   // 0~1
  topSectors: { name: string; avgWeight: number }[];
  portfolioDistribution: { range: string; count: number }[];
}

export function buildTeacherReportPrompt(input: TeacherReportInput): string {
  const {
    className, periodLabel, totalStudents,
    avgReturn, topStudentName, topStudentReturn,
    totalObjections, acceptedObjections, avgObjectionQuality,
    topSectors,
  } = input;

  return `당신은 학교 경제 교육 플랫폼 Newsfolio의 교사 리포트 AI입니다.
${className}의 ${periodLabel} 활동을 분석하고 교사에게 유용한 인사이트를 제공해주세요.

## 기간 데이터

- 총 학생 수: ${totalStudents}명
- 반 평균 누적 수익률: ${(avgReturn * 100).toFixed(2)}%
- 최고 성과 학생: ${topStudentName} (${(topStudentReturn * 100).toFixed(2)}%)
- 총 이의제기: ${totalObjections}건 / 수용: ${acceptedObjections}건
- 평균 이의제기 품질: ${(avgObjectionQuality * 100).toFixed(0)}점
- 가장 많이 투자된 섹터: ${topSectors.map(s => `${s.name}(${(s.avgWeight * 100).toFixed(0)}%)`).join(", ")}

## 요청사항

1. 이번 주 반 전체 활동 요약 (3문장)
2. 눈에 띄는 학습 패턴 또는 트렌드 (2~3가지 인사이트)
3. 다음 주 교사 추천 행동 (2~3가지 구체적 제안)
4. 특별히 주목할 학생 또는 그룹이 있다면 언급

JSON 형식으로 반환하세요:
{
  "summary": "...",
  "insights": ["...", "..."],
  "recommendations": ["...", "..."],
  "spotlightNote": "..."
}`;
}
