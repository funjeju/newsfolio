"use client";

import { cn } from "@/lib/utils";
import { ScoreBadge, getScoreStyle } from "@/components/ui/ScoreBadge";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, FlameIcon, BookOpenIcon, MessageSquarePlusIcon, SearchIcon } from "lucide-react";
import * as motion from "framer-motion/client";
import { useRouter } from "next/navigation";

interface SectorImpact {
  sectorId: string;
  sectorName: string;
  sectorIcon: string;
  impactScore: number;
  dailyReturn: number;
  rankChange: number;
  rank: number;
  duration: "short" | "medium" | "long";
  risk: "low" | "mid" | "high";
  tonedRationale: string;
  objectionCount: number;
  isMine?: boolean;
}

interface Props {
  impact: SectorImpact;
  index: number;
}

const DURATION_DOTS: Record<string, number> = { short: 1, medium: 2, long: 3 };
const RISK_DOTS: Record<string, number> = { low: 1, mid: 2, high: 3 };

function ThreeDotMeter({ filled, total, colorClass }: { filled: number; total: number; colorClass: string }) {
  return (
    <div className="flex gap-1">
      {Array(total).fill(null).map((_, i) => (
        <div key={i} className={cn("w-2.5 h-2.5 rounded-full", i < filled ? colorClass : "bg-slate-100")} />
      ))}
    </div>
  );
}

export function SectorCard({ impact, index }: Props) {
  const router = useRouter();
  const style = getScoreStyle(impact.impactScore);
  const isPositive = impact.dailyReturn > 0;
  const isNegative = impact.dailyReturn < 0;
  const isHot = impact.objectionCount >= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className={cn(
        "glass rounded-2xl p-5 border cursor-pointer hover:border-white/20 transition-all group",
        impact.isMine ? "border-brand-500/40 bg-brand-500/5" : "border-border/50"
      )}
      onClick={() => router.push(`/student/sector/${impact.sectorId}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{impact.sectorIcon}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">{impact.sectorName}</h3>
              {isHot && <FlameIcon className="w-4 h-4 text-orange-500 fill-orange-500" />}
              {impact.isMine && <span className="text-xs px-2 py-0.5 bg-brand-500/20 text-brand-300 rounded-full font-semibold">내 섹터</span>}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-muted-foreground">{impact.rank}위</span>
              {impact.rankChange > 0 ? (
                <span className="text-xs text-score-up flex items-center gap-0.5"><ArrowUpIcon className="w-3 h-3" />{impact.rankChange}</span>
              ) : impact.rankChange < 0 ? (
                <span className="text-xs text-score-down flex items-center gap-0.5"><ArrowDownIcon className="w-3 h-3" />{Math.abs(impact.rankChange)}</span>
              ) : (
                <span className="text-xs text-muted-foreground flex items-center gap-0.5"><MinusIcon className="w-3 h-3" /></span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <ScoreBadge score={impact.impactScore} />
          <div className={cn("text-base font-mono font-bold", isPositive ? "text-score-up" : isNegative ? "text-score-down" : "text-muted-foreground")}>
            {isPositive ? "+" : ""}{impact.dailyReturn.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Score Gauge */}
      <div className="mb-3">
        <ScoreGauge score={impact.impactScore} />
      </div>

      {/* 3-Dot Meters */}
      <div className="flex items-center gap-6 mb-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>강도</span>
          <ThreeDotMeter filled={Math.ceil((Math.abs(impact.impactScore) / 5) * 3)} total={3} colorClass={style.colorClass.replace("text-", "bg-")} />
        </div>
        <div className="flex items-center gap-2">
          <span>지속</span>
          <ThreeDotMeter filled={DURATION_DOTS[impact.duration]} total={3} colorClass="bg-blue-500" />
        </div>
        <div className="flex items-center gap-2">
          <span>위험</span>
          <ThreeDotMeter filled={RISK_DOTS[impact.risk]} total={3} colorClass="bg-orange-500" />
        </div>
      </div>

      {/* AI Rationale */}
      <p className="text-sm text-muted-foreground bg-slate-100/70 rounded-xl p-3 leading-relaxed mb-4">
        {impact.tonedRationale}
      </p>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={e => { e.stopPropagation(); router.push(`/student/sector/${impact.sectorId}`); }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-100/70 hover:bg-slate-100 text-sm font-medium transition-colors"
        >
          <SearchIcon className="w-4 h-4" />
          AI 분석 보기
        </button>
        <button
          onClick={e => { e.stopPropagation(); router.push(`/student/objections/new?sector=${impact.sectorId}`); }}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors",
            impact.objectionCount > 0
              ? "bg-brand-500/20 text-brand-300 hover:bg-brand-500/30"
              : "bg-slate-100/70 hover:bg-slate-100"
          )}
        >
          <MessageSquarePlusIcon className="w-4 h-4" />
          이의 {impact.objectionCount > 0 ? `(${impact.objectionCount})` : ""}
          {isHot && <FlameIcon className="w-3 h-3 text-orange-500 fill-orange-500" />}
        </button>
        <button
          onClick={e => { e.stopPropagation(); router.push(`/student/sector/${impact.sectorId}?tab=learn`); }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-100/70 hover:bg-slate-100 text-sm font-medium transition-colors"
        >
          <BookOpenIcon className="w-4 h-4" />
          학습
        </button>
      </div>
    </motion.div>
  );
}
