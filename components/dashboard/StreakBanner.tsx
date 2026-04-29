"use client";

import * as motion from "framer-motion/client";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";
import { useState } from "react";

interface Props {
  streakDays: number;
  sectorName?: string;
  className?: string;
}

export function StreakBanner({ streakDays, sectorName, className }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || streakDays < 3) return null;

  const isLongStreak = streakDays >= 7;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "relative flex items-center gap-3 px-4 py-3 rounded-xl border overflow-hidden",
        isLongStreak
          ? "bg-orange-500/10 border-orange-500/40"
          : "bg-amber-500/10 border-amber-500/30",
        className
      )}
    >
      {/* Animated background sweep */}
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
      />

      <motion.span
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-2xl flex-shrink-0"
      >
        🔥
      </motion.span>

      <div className="flex-1 min-w-0">
        <span className="font-bold text-sm text-amber-300">
          {streakDays}일 연속 적중 중!
        </span>
        {sectorName && (
          <span className="text-sm text-muted-foreground ml-1.5">
            {sectorName} 섹터 예측이 이어지고 있어요
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="hidden sm:block text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
          🏅 끈기상 도전 중
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="닫기"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
