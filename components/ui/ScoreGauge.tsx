import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number; // -5 to +5
  className?: string;
}

export function ScoreGauge({ score, className }: ScoreGaugeProps) {
  // Display: 10 dots horizontally
  // Score +5: ●●●●●○○○○○ (5 filled green from left)
  // Score -5: ○○○○○●●●●● (5 filled red from right)
  // Score 0: ○○○○○○○○○○ (all empty)
  
  const dots = Array(10).fill(null).map((_, i) => {
    if (score > 0 && i < Math.abs(score) * 2) {
      return 'bg-emerald-500';
    }
    if (score < 0 && i >= 10 - Math.abs(score) * 2) {
      return 'bg-red-500';
    }
    return 'bg-gray-700/30'; // Dark mode appropriate empty dot
  });
  
  return (
    <div className={cn('flex gap-[2px]', className)}>
      {dots.map((color, i) => (
        <div key={i} className={cn('w-2 h-2 rounded-full', color)} />
      ))}
    </div>
  );
}
