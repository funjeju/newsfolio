// AI prompt for generating personalized award citation text
// Model: Gemini Flash Lite | Called when award is issued

export type AwardType =
  | 'weekly_winner' | 'monthly_winner' | 'season_champion'
  | 'grand_champion' | 'best_analyst' | 'best_collaboration'
  | 'rookie_award' | 'persistence_award';

const AWARD_LABELS: Record<AwardType, string> = {
  weekly_winner: '주간 우승상',
  monthly_winner: '월간 우승상',
  season_champion: '시즌 챔피언상',
  grand_champion: '왕중왕상',
  best_analyst: '베스트 애널리스트상',
  best_collaboration: '최고 협력상',
  rookie_award: '신인왕상',
  persistence_award: '끈기왕상',
};

export function buildAwardReasonPrompt(input: {
  awardType: AwardType;
  recipientName: string;
  recipientType: 'group' | 'individual';
  period: string;
  stats: {
    returnPercent?: number;
    rank?: number;
    totalParticipants?: number;
    objectionAcceptRate?: number;
    streakDays?: number;
    activityRate?: number;
  };
  className: string;
  teacherName: string;
}): string {
  const awardLabel = AWARD_LABELS[input.awardType];
  const statsBlock = Object.entries(input.stats)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');

  return `당신은 학교 시상식의 상장 문구를 작성하는 AI입니다.
따뜻하고 격려하는 상장 사유를 작성해 주세요.

## 수상 정보
- 상 이름: ${awardLabel}
- 수상자: ${input.recipientName} (${input.recipientType === 'group' ? '모둠' : '개인'})
- 기간: ${input.period}
- 학급: ${input.className}
- 담당 교사: ${input.teacherName}

## 주요 성과
${statsBlock}

## 출력 형식 (JSON)
{
  "reason": "<상장 사유 2~3문장. 구체적인 성과 포함. 격려와 칭찬 어조. 공식적이지만 따뜻하게.>",
  "shortMessage": "<상장 아래에 들어갈 짧은 축하 메시지 1줄>"
}

상장 사유는 수상자의 구체적인 노력과 성과를 담아야 합니다.
일반적인 칭찬 문구가 아닌 실제 데이터에 기반한 내용을 포함하세요.
`;
}
