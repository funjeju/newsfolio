"use client";

import { cn } from "@/lib/utils";
import { StarIcon, TrendingUpIcon, ChevronRightIcon } from "lucide-react";
import * as motion from "framer-motion/client";
import Link from "next/link";

interface BestAnalyst {
  userId: string;
  nickname: string;
  avatarEmoji?: string;
  sectorName: string;
  sectorIcon: string;
  proposedScore: number;
  aiOriginalScore: number;
  finalScore: number;
  objectionSummary: string;
  accuracyDelta: number;
}

const MOCK_BEST_ANALYST: BestAnalyst = {
  userId: "user_kim",
  nickname: "김민준",
  avatarEmoji: "🧑‍💻",
  sectorName: "반도체",
  sectorIcon: "💻",
  proposedScore: 4,
  aiOriginalScore: 2,
  finalScore: 4,
  objectionSummary: "미국 수출규제 완화 뉴스를 AI보다 먼저 포착해 +4점 예측 성공!",
  accuracyDelta: 2,
};

interface Props {
  className?: string;
  date?: string;
}

export function BestAnalystSpotlight({ className, date }: Props) {
  const analyst = MOCK_BEST_ANALYST;

  return (
    <div className={cn("glass p-6 flex flex-col gap-4 relative overflow-hidden", className)}>
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 15, -10, 15, 0] }}
            transition={{ repeat: Infinity, duration: 3, repeatDelay: 4 }}
          >
            <StarIcon className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          </motion.div>
          <h3 className="font-display font-bold text-lg">베스트 애널리스트</h3>
        </div>
        {date && <span className="text-xs text-muted-foreground">{date}</span>}
      </div>

      {/* Analyst Info */}
      <div className="flex items-center gap-4 relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-14 h-14 rounded-2xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-3xl flex-shrink-0"
        >
          {analyst.avatarEmoji ?? "🎯"}
        </motion.div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl">{analyst.nickname}</span>
            <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full font-bold">
              🏆 오늘의 영웅
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
            <span>{analyst.sectorIcon}</span>
            <span>{analyst.sectorName} 섹터 이의제기 승인</span>
          </div>
        </div>
      </div>

      {/* Score Delta */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-border/50 relative z-10">
        <div className="text-center flex-1">
          <div className="text-xs text-muted-foreground mb-1">AI 원래 점수</div>
          <div className="text-2xl font-bold text-muted-foreground">
            {analyst.aiOriginalScore > 0 ? "+" : ""}{analyst.aiOriginalScore}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <TrendingUpIcon className="w-5 h-5 text-score-up" />
          <span className="text-xs font-bold text-score-up">+{analyst.accuracyDelta}점 수정</span>
        </div>
        <div className="text-center flex-1">
          <div className="text-xs text-muted-foreground mb-1">최종 확정 점수</div>
          <div className="text-2xl font-bold text-score-up">
            {analyst.finalScore > 0 ? "+" : ""}{analyst.finalScore}
          </div>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground leading-relaxed relative z-10">
        &ldquo;{analyst.objectionSummary}&rdquo;
      </p>

      <Link
        href="/student/briefing"
        className="relative z-10 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-bold text-sm transition-colors"
      >
        오늘 이의제기 하러 가기 <ChevronRightIcon className="w-4 h-4" />
      </Link>
    </div>
  );
}
