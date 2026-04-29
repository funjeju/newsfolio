import { cn } from "@/lib/utils";

export interface ScoreStyle {
  emoji: string;
  colorClass: string;
  bgClass: string;
  ringClass: string;
  label: string;
}

export function getScoreStyle(score: number): ScoreStyle {
  if (score >= 4) return {
    emoji: '🚀',
    colorClass: 'text-score-mega-up',
    bgClass: 'bg-emerald-500/10',
    ringClass: 'ring-emerald-500',
    label: '큰 호재',
  };
  if (score >= 1) return {
    emoji: '🟢',
    colorClass: 'text-score-up',
    bgClass: 'bg-emerald-500/10',
    ringClass: 'ring-emerald-300',
    label: '호재',
  };
  if (score === 0) return {
    emoji: '⚪',
    colorClass: 'text-score-neutral',
    bgClass: 'bg-gray-500/10',
    ringClass: 'ring-gray-300',
    label: '평이',
  };
  if (score >= -3) return {
    emoji: '🔻',
    colorClass: 'text-score-down',
    bgClass: 'bg-red-500/10',
    ringClass: 'ring-red-300',
    label: '악재',
  };
  return {
    emoji: '💥',
    colorClass: 'text-score-mega-down',
    bgClass: 'bg-red-500/10',
    ringClass: 'ring-red-500',
    label: '큰 악재',
  };
}

interface ScoreBadgeProps {
  score: number;
  className?: string;
}

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  const style = getScoreStyle(score);
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold", style.bgClass, style.colorClass, className)}>
      <span>{style.emoji}</span>
      <span>{score > 0 ? `+${score}` : score}</span>
    </span>
  );
}
