import { cn } from "@/lib/utils";
import { TrophyIcon, UsersIcon, UserIcon, ChevronRightIcon, TargetIcon } from "lucide-react";
import Link from "next/link";

interface Props {
  individualRank: number;
  totalStudents: number;
  topPercent: number;
  groupRank: number;
  totalGroups: number;
  groupName: string;
  streakDays?: number;
  accuracyRate?: number;
  className?: string;
}

export function RankingCard({
  individualRank,
  totalStudents,
  topPercent,
  groupRank,
  totalGroups,
  groupName,
  streakDays = 0,
  accuracyRate,
  className,
}: Props) {
  const percentileBar = Math.max(0, Math.min(100, 100 - topPercent));
  const medalEmoji =
    individualRank === 1 ? "🥇" : individualRank === 2 ? "🥈" : individualRank === 3 ? "🥉" : null;

  return (
    <div className={cn("glass p-5 flex flex-col gap-4", className)}>
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-muted-foreground flex items-center gap-2">
          <TrophyIcon className="w-4 h-4 text-yellow-400" />
          순위 현황
        </h3>
        {streakDays >= 3 && (
          <span className="text-xs bg-orange-500/15 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold">
            🔥 {streakDays}일 연속
          </span>
        )}
      </div>

      {/* Individual Rank */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserIcon className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs text-muted-foreground font-medium">개인 순위</span>
          </div>
          <div className="flex items-center gap-1.5">
            {medalEmoji && <span>{medalEmoji}</span>}
            <span className="text-xl font-display font-bold text-foreground">{individualRank}위</span>
            <span className="text-sm text-muted-foreground">/ {totalStudents}명</span>
          </div>
        </div>

        {/* Percentile Bar */}
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all"
            style={{ width: `${percentileBar}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-brand-400 shadow-[0_0_6px_rgba(99,102,241,0.8)]"
            style={{ left: `calc(${percentileBar}% - 6px)` }}
          />
        </div>
        <p className="text-right text-xs text-brand-400 font-bold">상위 {topPercent}%</p>
      </div>

      {/* Group Rank */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-2">
          <UsersIcon className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs text-muted-foreground font-medium">{groupName}</span>
        </div>
        <div className="flex items-center gap-1">
          {groupRank <= 3 && (
            <span>{groupRank === 1 ? "🥇" : groupRank === 2 ? "🥈" : "🥉"}</span>
          )}
          <span className="font-bold text-foreground">{groupRank}위</span>
          <span className="text-sm text-muted-foreground">/ {totalGroups}조</span>
        </div>
      </div>

      {accuracyRate !== undefined && (
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <TargetIcon className="w-3.5 h-3.5" />
            예측 적중률
          </span>
          <span className="font-bold text-score-up">{accuracyRate}%</span>
        </div>
      )}

      <Link
        href="/student/ranking"
        className="mt-auto w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
      >
        전체 랭킹 보기 <ChevronRightIcon className="w-4 h-4" />
      </Link>
    </div>
  );
}
