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

function getLeftBorder(score: number) {
  if (score >= 4) return "border-l-4 border-l-emerald-500";
  if (score >= 1) return "border-l-4 border-l-emerald-300";
  if (score === 0) return "border-l-4 border-l-slate-200";
  if (score >= -3) return "border-l-4 border-l-red-300";
  return "border-l-4 border-l-red-500";
}

export function LeaderboardRow({ rank, sector, impact, isMine, myWeight, index }: Props) {
  const isPositive = impact.dailyReturn > 0;
  const isNegative = impact.dailyReturn < 0;
  const isBigMover = Math.abs(impact.rankChange) >= 3;
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      onClick={() => router.push(`/student/sector/${sector.id}`)}
      className={cn(
        "group relative flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer",
        getLeftBorder(impact.impactScore),
        isMine
          ? "bg-indigo-50 border border-indigo-200 shadow-sm"
          : "bg-white border border-slate-100 hover:bg-indigo-50/60 hover:border-indigo-200/60 hover:shadow-sm",
        isBigMover && !isMine && "border border-amber-200 bg-amber-50/40"
      )}
    >
      {/* Big mover pulse overlay */}
      {isBigMover && (
        <motion.div
          animate={{ opacity: [0.1, 0.25, 0.1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 rounded-xl bg-amber-400/10 pointer-events-none"
        />
      )}

      {/* Rank */}
      <div className="w-8 flex justify-center font-bold text-lg relative flex-shrink-0">
        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : (
          <span className="text-sm font-bold text-slate-400">{rank}</span>
        )}
        {isBigMover && (
          <ZapIcon className="absolute -top-1 -right-1 w-3 h-3 text-amber-500" />
        )}
      </div>

      {/* Sector Name */}
      <div className="flex-1 flex items-center gap-2 min-w-[120px]">
        <span className="text-xl">{sector.icon}</span>
        <span className="font-bold text-[15px] text-slate-800">{sector.name}</span>
      </div>

      {/* Score + Gauge */}
      <div className="hidden md:flex flex-col items-center justify-center min-w-[140px] gap-1.5">
        <ScoreBadge score={impact.impactScore} />
        <ScoreGauge score={impact.impactScore} />
      </div>

      {/* Daily Return — hero number */}
      <div className={cn(
        "w-20 text-right font-mono font-bold text-base",
        isPositive ? "text-emerald-600" : isNegative ? "text-red-500" : "text-slate-400"
      )}>
        {isPositive ? '+' : ''}{impact.dailyReturn.toFixed(2)}%
      </div>

      {/* Rank Change */}
      <div className="hidden sm:flex w-12 justify-end items-center text-sm font-bold">
        {impact.rankChange > 0 ? (
          <span className="flex items-center text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-lg">
            <ArrowUpIcon className="w-3 h-3 mr-0.5" />{impact.rankChange}
          </span>
        ) : impact.rankChange < 0 ? (
          <span className="flex items-center text-red-500 bg-red-50 px-1.5 py-0.5 rounded-lg">
            <ArrowDownIcon className="w-3 h-3 mr-0.5" />{Math.abs(impact.rankChange)}
          </span>
        ) : (
          <span className="flex items-center text-slate-400"><MinusIcon className="w-3 h-3" /></span>
        )}
      </div>

      {/* Rationale */}
      <div className="hidden lg:block flex-1 text-sm text-slate-500 truncate pl-4 border-l border-slate-100">
        {impact.rationaleSummary}
      </div>

      {/* My sector badge + star */}
      <div className="flex items-center justify-end gap-1.5 flex-shrink-0">
        {isMine && myWeight !== undefined && (
          <span className="hidden sm:block text-xs font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full">
            내 비중 {myWeight}%
          </span>
        )}
        {isMine ? (
          <StarIcon className="w-5 h-5 fill-indigo-500 text-indigo-500" />
        ) : (
          <StarIcon className="w-5 h-5 text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </motion.div>
  );
}
