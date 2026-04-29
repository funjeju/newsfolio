"use client";

import * as motion from "framer-motion/client";
import { cn } from "@/lib/utils";
import { ZapIcon, XIcon, ArrowRightIcon } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface BigMover {
  sectorId: string;
  sectorName: string;
  sectorIcon: string;
  rankChange: number;
  impactScore: number;
  dailyReturn: number;
}

interface Props {
  movers: BigMover[];
  className?: string;
}

export function BigMoverAlert({ movers, className }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || movers.length === 0) return null;

  const topMover = movers[0];
  const isReversal = topMover.rankChange <= -3;
  const isRocketRise = topMover.rankChange >= 3;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className={cn(
        "relative flex items-center gap-3 px-4 py-3 rounded-xl border overflow-hidden",
        isReversal
          ? "bg-red-50 border-red-300"
          : "bg-emerald-50 border-emerald-300",
        className
      )}
    >
      <motion.div
        animate={{ rotate: isRocketRise ? [0, -10, 10, 0] : [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }}
        className="flex-shrink-0"
      >
        <ZapIcon className={cn("w-5 h-5", isRocketRise ? "text-amber-500" : "text-red-500")} />
      </motion.div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-sm text-slate-800">
            {isReversal ? "⚠️ 반전 주의" : "🚀 급등 포착"}
          </span>
          <span className="text-sm">
            <span className="mr-1">{topMover.sectorIcon}</span>
            <span className="font-semibold text-slate-700">{topMover.sectorName}</span>
          </span>
          <span className={cn(
            "text-xs font-bold px-2 py-0.5 rounded-full",
            topMover.rankChange >= 3
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          )}>
            {topMover.rankChange > 0 ? "▲" : "▼"}{Math.abs(topMover.rankChange)}단계
          </span>
        </div>
        {movers.length > 1 && (
          <p className="text-xs text-slate-500 mt-0.5">
            외 {movers.length - 1}개 섹터 순위 급변
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href={`/student/sector/${topMover.sectorId}`}
          className="hidden sm:flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          상세 보기 <ArrowRightIcon className="w-3 h-3" />
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="닫기"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
