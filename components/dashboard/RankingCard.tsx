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
    <div className={cn("bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col gap-4", className)}>
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-slate-500 text-sm flex items-center gap-2">
          <TrophyIcon className="w-4 h-4 text-amber-500" />
          순위 현황
        </h3>
        {streakDays >= 3 && (
          <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-bold">
            🔥 {streakDays}일 연속
          </span>
        )}
      </div>

      {/* Individual Rank */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-xs text-slate-500 font-medium">개인 순위</span>
          </div>
          <div className="flex items-center gap-1.5">
            {medalEmoji && <span>{medalEmoji}</span>}
            <span className="text-xl font-display font-bold text-slate-900">{individualRank}위</span>
            <span className="text-sm text-slate-400">/ {totalStudents}명</span>
          </div>
        </div>

        {/* Percentile Bar */}
        <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
            style={{ width: `${percentileBar}%` }}
          />
        </div>
        <p className="text-right text-xs text-indigo-600 font-bold">상위 {topPercent}%</p>
      </div>

      {/* Group Rank */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <UsersIcon className="w-3.5 h-3.5 text-violet-500" />
          <span className="text-xs text-slate-500 font-medium">{groupName}</span>
        </div>
        <div className="flex items-center gap-1">
          {groupRank <= 3 && (
            <span>{groupRank === 1 ? "🥇" : groupRank === 2 ? "🥈" : "🥉"}</span>
          )}
          <span className="font-bold text-slate-800">{groupRank}위</span>
          <span className="text-sm text-slate-400">/ {totalGroups}조</span>
        </div>
      </div>

      {accuracyRate !== undefined && (
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-slate-500">
            <TargetIcon className="w-3.5 h-3.5" />
            예측 적중률
          </span>
          <span className="font-bold text-emerald-600">{accuracyRate}%</span>
        </div>
      )}

      <Link
        href="/student/ranking"
        className="mt-auto w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 transition-colors text-sm font-bold text-indigo-700"
      >
        전체 랭킹 보기 <ChevronRightIcon className="w-4 h-4" />
      </Link>
    </div>
  );
}
