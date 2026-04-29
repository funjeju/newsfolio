import { cn } from "@/lib/utils";
import { Sector, SectorImpact } from "@/lib/mockData";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, StarIcon, ZapIcon } from "lucide-react";
import * as motion from "framer-motion/client";
import { useRouter } from "next/navigation";

interface Props {
  rank: number;
  sector: Sector;
  impact: SectorImpact;
  isMine: boolean;
  myWeight?: number;
  index: number;
}

export function LeaderboardRow({ rank, sector, impact, isMine, myWeight, index }: Props) {
  const isPositive = impact.dailyReturn > 0;
  const isNegative = impact.dailyReturn < 0;
  const isBigMover = Math.abs(impact.rankChange) >= 3;
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={() => router.push(`/student/sector/${sector.id}`)}
      className={cn(
        "group relative flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer hover:bg-white/5",
        isMine ? "bg-brand-500/10 border border-brand-500/30" : "bg-card border border-transparent hover:border-border",
        isBigMover && !isMine && "border border-amber-500/30"
      )}
    >
      {isBigMover && (
        <motion.div
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 rounded-xl bg-amber-500/10 pointer-events-none"
        />
      )}
      {/* Rank */}
      <div className="w-8 flex justify-center font-bold text-lg relative">
        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : <span className="text-muted-foreground">{rank}</span>}
        {isBigMover && (
          <ZapIcon className="absolute -top-1 -right-1 w-3 h-3 text-amber-400" />
        )}
      </div>

      {/* Sector Name */}
      <div className="flex-1 flex items-center gap-2 min-w-[120px]">
        <span className="text-xl">{sector.icon}</span>
        <span className="font-bold text-[15px]">{sector.name}</span>
      </div>

      {/* Score and Gauge */}
      <div className="hidden md:flex flex-col items-center justify-center min-w-[140px] gap-1.5">
        <ScoreBadge score={impact.impactScore} />
        <ScoreGauge score={impact.impactScore} />
      </div>

      {/* Daily Return */}
      <div className={cn(
        "w-20 text-right font-mono font-bold text-[15px]",
        isPositive ? "text-score-up" : isNegative ? "text-score-down" : "text-muted-foreground"
      )}>
        {isPositive ? '+' : ''}{impact.dailyReturn.toFixed(2)}%
      </div>

      {/* Rank Change */}
      <div className="hidden sm:flex w-12 justify-end items-center text-sm font-medium">
        {impact.rankChange > 0 ? (
          <span className="flex items-center text-score-up"><ArrowUpIcon className="w-3 h-3 mr-0.5" />{impact.rankChange}</span>
        ) : impact.rankChange < 0 ? (
          <span className="flex items-center text-score-down"><ArrowDownIcon className="w-3 h-3 mr-0.5" />{Math.abs(impact.rankChange)}</span>
        ) : (
          <span className="flex items-center text-muted-foreground"><MinusIcon className="w-3 h-3 mr-0.5" /></span>
        )}
      </div>

      {/* Rationale Snippet */}
      <div className="hidden lg:block flex-1 text-sm text-muted-foreground truncate pl-4 border-l border-border/50">
        {impact.rationaleSummary}
      </div>

      {/* Is Mine Star + Weight */}
      <div className="flex items-center justify-end gap-1.5">
        {isMine && myWeight !== undefined && (
          <span className="hidden sm:block text-xs font-bold text-brand-400 bg-brand-500/15 px-1.5 py-0.5 rounded-full">
            내 비중 {myWeight}%
          </span>
        )}
        {isMine ? (
          <StarIcon className="w-5 h-5 fill-brand-400 text-brand-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
        ) : (
          <StarIcon className="w-5 h-5 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      
    </motion.div>
  );
}
