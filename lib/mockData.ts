export type ToneLevel = 1 | 2 | 3 | 4;

export interface Sector {
  id: string;
  name: string;
  icon: string;
  order: number;
}

export interface SectorImpact {
  sectorId: string;
  impactScore: number;
  dailyReturn: number;
  rankChange: number;
  rationaleSummary: string;
}

export const MOCK_SECTORS: Sector[] = [
  { id: 'semiconductor', name: '반도체', icon: '💻', order: 1 },
  { id: 'automotive', name: '자동차', icon: '🚗', order: 2 },
  { id: 'game', name: '게임', icon: '🎮', order: 3 },
  { id: 'content', name: '콘텐츠', icon: '🎬', order: 4 },
  { id: 'travel', name: '여행', icon: '✈️', order: 5 },
  { id: 'green_energy', name: '친환경', icon: '🌱', order: 6 },
  { id: 'food', name: '식품', icon: '🍔', order: 7 },
  { id: 'construction', name: '건설', icon: '🏗️', order: 8 },
  { id: 'geopolitics', name: '국제정세', icon: '🌐', order: 9 },
  { id: 'global_trade', name: '글로벌무역', icon: '🚢', order: 10 },
];

export const MOCK_IMPACTS: SectorImpact[] = [
  { sectorId: 'semiconductor', impactScore: 4, dailyReturn: 3.24, rankChange: 2, rationaleSummary: '미국 반도체 수출 규제 완화' },
  { sectorId: 'game', impactScore: 3, dailyReturn: 2.11, rankChange: 1, rationaleSummary: '대형 신작 게임 글로벌 흥행 돌풍' },
  { sectorId: 'green_energy', impactScore: 2, dailyReturn: 1.45, rankChange: 0, rationaleSummary: '정부의 신재생 에너지 보조금 확대 발표' },
  { sectorId: 'automotive', impactScore: 1, dailyReturn: 0.72, rankChange: -1, rationaleSummary: '전기차 판매량 소폭 증가 추세 유지' },
  { sectorId: 'travel', impactScore: 0, dailyReturn: -0.15, rankChange: 0, rationaleSummary: '해외 여행객 수요 평이한 수준 유지' },
  { sectorId: 'content', impactScore: -1, dailyReturn: -0.68, rankChange: -1, rationaleSummary: '주요 OTT 플랫폼 가입자 증가세 둔화' },
  { sectorId: 'global_trade', impactScore: -2, dailyReturn: -1.23, rankChange: -2, rationaleSummary: '해상 운임 상승으로 인한 수출 기업 부담 증가' },
  { sectorId: 'food', impactScore: -3, dailyReturn: -2.14, rankChange: -1, rationaleSummary: '주요 원자재(밀, 설탕) 가격 급등에 따른 마진 하락 우려' },
  { sectorId: 'geopolitics', impactScore: -4, dailyReturn: -3.67, rankChange: 0, rationaleSummary: '주요국 무역 갈등 심화로 인한 시장 불확실성 최고조' },
  { sectorId: 'construction', impactScore: -5, dailyReturn: -4.89, rankChange: -3, rationaleSummary: '부동산 PF 부실 우려 확산 및 신규 수주 급감 쇼크' },
];

export const MOCK_USER_PORTFOLIO = {
  totalValue: 12450000,
  dailyChange: 520000,
  dailyChangePercent: 4.36,
  rank: 12,
  totalStudents: 128,
  topPercent: 9.4,
  groupTotalValue: 48230000,
  groupDailyChange: 1230000,
  groupDailyChangePercent: 2.6,
  groupRank: 3,
  totalGroups: 24,
  groupName: '슈퍼노바5조',
  mySectors: ['semiconductor', 'automotive'],
  myWeights: { semiconductor: 60, automotive: 40 } as Record<string, number>,
};

// 7-day sparkline data for PortfolioValueCard
export const MOCK_SPARKLINE_INDIVIDUAL = [
  { date: '04-23', value: 10800000 },
  { date: '04-24', value: 11100000 },
  { date: '04-25', value: 10950000 },
  { date: '04-26', value: 11420000 },
  { date: '04-27', value: 11780000 },
  { date: '04-28', value: 11930000 },
  { date: '04-29', value: 12450000 },
];

export const MOCK_SPARKLINE_GROUP = [
  { date: '04-23', value: 43200000 },
  { date: '04-24', value: 44100000 },
  { date: '04-25', value: 43800000 },
  { date: '04-26', value: 45200000 },
  { date: '04-27', value: 46500000 },
  { date: '04-28', value: 47100000 },
  { date: '04-29', value: 48230000 },
];

// 30-day portfolio history for Portfolio page chart
export const MOCK_PORTFOLIO_HISTORY = Array.from({ length: 30 }, (_, i) => {
  const base = 10000000;
  const day = i + 1;
  const value = Math.round(base * (1 + (day * 0.008) + Math.sin(day * 0.4) * 0.015));
  const date = new Date(2026, 2, day + 30);
  return {
    date: `${date.getMonth() + 1}/${date.getDate()}`,
    value,
    dailyReturn: (Math.sin(day * 0.4) * 0.015 + 0.008),
  };
});

// Streak and accuracy data
export const MOCK_STREAK = {
  currentStreak: 5,
  bestStreak: 12,
  accuracyRate: 72,
  totalObjections: 18,
  acceptedObjections: 13,
  activityDots: [true, true, true, false, true, true, true], // last 7 days
};

// BestAnalystSpotlight mock data
export const MOCK_BEST_ANALYST = {
  studentName: '이서연',
  groupName: '2조',
  sectorName: '반도체',
  sectorIcon: '💻',
  aiScore: 3,
  finalScore: 5,
  scoreDelta: 2,
  reasoning: '미국 반도체 수출 규제 완화와 HBM 수요 급증이라는 두 가지 핵심 근거로 AI보다 2점 높은 +5점 예측에 성공했어요.',
  date: '2026-04-28',
};
