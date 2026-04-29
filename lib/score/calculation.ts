// Portfolio value calculation — spec: impactScore × 0.5% = dailyReturn, compound interest

export interface SectorWeight {
  sectorId: string;
  weight: number; // 0~1 (sum = 1)
}

export interface SectorDailyReturn {
  sectorId: string;
  dailyReturn: number; // e.g. 0.0324 for +3.24%
}

/**
 * Calculate portfolio daily return from sector weights and daily returns.
 * Weighted average of sector dailyReturns.
 */
export function calcPortfolioDailyReturn(
  allocations: SectorWeight[],
  returns: SectorDailyReturn[]
): number {
  let total = 0;
  for (const alloc of allocations) {
    const ret = returns.find(r => r.sectorId === alloc.sectorId);
    if (ret) {
      total += alloc.weight * ret.dailyReturn;
    }
  }
  return total;
}

/**
 * Convert impactScore (-5~+5) to dailyReturn percentage (decimal).
 * Rule: dailyReturn = impactScore × 0.005
 */
export function impactScoreToDailyReturn(score: number): number {
  return score * 0.005;
}

/**
 * Apply compound growth for N days.
 * newValue = startValue × ∏(1 + dailyReturn_i)
 */
export function applyCompoundReturns(startValue: number, dailyReturns: number[]): number {
  return dailyReturns.reduce((val, r) => val * (1 + r), startValue);
}

/**
 * Calculate cumulative return from start to current value.
 */
export function cumulativeReturn(startValue: number, currentValue: number): number {
  return (currentValue - startValue) / startValue;
}

/**
 * Evaluate full portfolio value given current allocations and today's impact scores.
 */
export function evaluatePortfolio(
  currentValue: number,
  allocations: SectorWeight[],
  impactScores: { sectorId: string; impactScore: number }[]
): { newValue: number; dailyReturn: number; dailyChangeWon: number } {
  const returns: SectorDailyReturn[] = impactScores.map(s => ({
    sectorId: s.sectorId,
    dailyReturn: impactScoreToDailyReturn(s.impactScore),
  }));

  const dailyReturn = calcPortfolioDailyReturn(allocations, returns);
  const newValue = Math.round(currentValue * (1 + dailyReturn));
  const dailyChangeWon = newValue - currentValue;

  return { newValue, dailyReturn, dailyChangeWon };
}
