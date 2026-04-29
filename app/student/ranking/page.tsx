"use client";

import { useState } from "react";
import { MOCK_USER_PORTFOLIO } from "@/lib/mockData";
import { TrophyIcon, UsersIcon, UserIcon, ChevronUpIcon, ChevronDownIcon, MinusIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import * as motion from "framer-motion/client";

type TabType = "individual" | "group";
type PeriodType = "weekly" | "monthly" | "season";

interface RankEntry {
  rank: number;
  name: string;
  value: number;
  returnPercent: number;
  change: number;
  isMe?: boolean;
}

const MOCK_INDIVIDUAL_RANKS: RankEntry[] = [
  { rank: 1, name: "이수현", value: 15200000, returnPercent: 52.0, change: 0 },
  { rank: 2, name: "박준서", value: 14800000, returnPercent: 48.0, change: 2 },
  { rank: 3, name: "최아린", value: 14100000, returnPercent: 41.0, change: -1 },
  { rank: 4, name: "정하은", value: 13700000, returnPercent: 37.0, change: 1 },
  { rank: 5, name: "강민재", value: 13400000, returnPercent: 34.0, change: -2 },
  { rank: 12, name: "김민준", value: 12450000, returnPercent: 24.5, change: 3, isMe: true },
  { rank: 13, name: "오지훈", value: 12100000, returnPercent: 21.0, change: -1 },
];

const MOCK_GROUP_RANKS: RankEntry[] = [
  { rank: 1, name: "갤럭시1조", value: 62000000, returnPercent: 55.0, change: 0 },
  { rank: 2, name: "오리온2조", value: 58000000, returnPercent: 45.0, change: 1 },
  { rank: 3, name: "슈퍼노바5조", value: 48230000, returnPercent: 26.0, change: 0, isMe: true },
  { rank: 4, name: "코메트3조", value: 44000000, returnPercent: 10.0, change: -1 },
  { rank: 5, name: "스타더스트4조", value: 40000000, returnPercent: 0.0, change: 0 },
];

const medalEmoji = (rank: number) =>
  rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

export default function RankingPage() {
  const [tab, setTab] = useState<TabType>("individual");
  const [period, setPeriod] = useState<PeriodType>("weekly");

  const entries = tab === "individual" ? MOCK_INDIVIDUAL_RANKS : MOCK_GROUP_RANKS;

  return (
    <main className="max-w-3xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <TrophyIcon className="w-7 h-7 text-yellow-400" />
        <h1 className="text-2xl font-display font-bold">랭킹</h1>
      </div>

      {/* My Snapshot */}
      <div className="glass p-4 rounded-2xl border border-brand-500/30 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-brand-400" />
          <span className="font-bold">개인 {MOCK_USER_PORTFOLIO.rank}위</span>
          <span className="text-muted-foreground text-sm">/ {MOCK_USER_PORTFOLIO.totalStudents}명</span>
          <span className="text-xs text-brand-400 bg-brand-500/15 px-2 py-0.5 rounded-full font-bold ml-1">
            상위 {MOCK_USER_PORTFOLIO.topPercent}%
          </span>
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <UsersIcon className="w-4 h-4 text-purple-400" />
          <span className="font-bold">{MOCK_USER_PORTFOLIO.groupName}</span>
          <span className="font-bold text-purple-400">{MOCK_USER_PORTFOLIO.groupRank}위</span>
          <span className="text-muted-foreground text-sm">/ {MOCK_USER_PORTFOLIO.totalGroups}조</span>
        </div>
      </div>

      {/* Tab + Period Controls */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-border/50">
          {([["individual", "👤 개인"], ["group", "👥 조별"]] as const).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                tab === t ? "bg-brand-500 text-white shadow-md" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-border/50">
          {([["weekly", "주간"], ["monthly", "월간"], ["season", "시즌"]] as const).map(([p, label]) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-bold transition-all",
                period === p ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Ranking List */}
      <div className="space-y-2">
        {entries.map((entry, index) => {
          const medal = medalEmoji(entry.rank);
          const hasGap = index > 0 && entry.rank - entries[index - 1].rank > 1;
          const isPositive = entry.returnPercent > 0;

          return (
            <div key={entry.rank}>
              {hasGap && (
                <div className="flex items-center gap-2 py-1 px-3">
                  <div className="flex-1 h-px bg-border/50" />
                  <span className="text-xs text-muted-foreground">···</span>
                  <div className="flex-1 h-px bg-border/50" />
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04, duration: 0.3 }}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-all",
                  entry.isMe
                    ? "bg-brand-500/10 border-brand-500/30"
                    : "bg-card border-transparent hover:border-border"
                )}
              >
                {/* Rank */}
                <div className="w-8 text-center font-bold text-lg">
                  {medal ?? <span className="text-muted-foreground">{entry.rank}</span>}
                </div>

                {/* Name */}
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <span className="font-bold truncate">{entry.name}</span>
                  {entry.isMe && (
                    <span className="text-[10px] bg-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded font-bold flex-shrink-0">나</span>
                  )}
                </div>

                {/* Value */}
                <div className="hidden sm:block text-sm text-muted-foreground font-mono">
                  ₩{entry.value.toLocaleString()}
                </div>

                {/* Return */}
                <div className={cn(
                  "font-mono font-bold text-sm w-16 text-right",
                  isPositive ? "text-score-up" : entry.returnPercent < 0 ? "text-score-down" : "text-muted-foreground"
                )}>
                  {isPositive ? "+" : ""}{entry.returnPercent.toFixed(1)}%
                </div>

                {/* Change */}
                <div className="hidden sm:flex w-10 justify-end items-center text-xs font-medium">
                  {entry.change > 0 ? (
                    <span className="flex items-center text-score-up"><ChevronUpIcon className="w-3 h-3" />{entry.change}</span>
                  ) : entry.change < 0 ? (
                    <span className="flex items-center text-score-down"><ChevronDownIcon className="w-3 h-3" />{Math.abs(entry.change)}</span>
                  ) : (
                    <span className="text-muted-foreground"><MinusIcon className="w-3 h-3" /></span>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground py-4">
        전체 {tab === "individual" ? `${MOCK_USER_PORTFOLIO.totalStudents}명` : `${MOCK_USER_PORTFOLIO.totalGroups}조`} 중 상위 표시 중 — 매일 장 마감 후 업데이트
      </p>
    </main>
  );
}
