"use client";

import { cn } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon, UsersIcon, UserIcon, TrophyIcon, PieChartIcon } from "lucide-react";
import Link from "next/link";
import { ResponsiveContainer, LineChart, Line, Tooltip } from "recharts";

interface SparkPoint {
  date: string;
  value: number;
}

interface Props {
  ownerType: 'individual' | 'group';
  value: number;
  dailyChange: number;
  dailyChangePercent: number;
  rank: number;
  totalParticipants: number;
  name?: string;
  sparkline?: SparkPoint[];
  className?: string;
}

export function PortfolioValueCard({
  ownerType,
  value,
  dailyChange,
  dailyChangePercent,
  rank,
  totalParticipants,
  name,
  sparkline,
  className,
}: Props) {
  const isPositive = dailyChange >= 0;
  const isGroup = ownerType === 'group';

  const medalEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden shadow-sm",
      isPositive
        ? "border-emerald-200"
        : "border-rose-200",
      className
    )}>
      {/* Top accent bar */}
      <div className={cn(
        "h-1.5",
        isPositive
          ? "bg-gradient-to-r from-emerald-400 to-teal-400"
          : "bg-gradient-to-r from-rose-400 to-red-400"
      )} />

      <div className="bg-white p-5 flex flex-col gap-3">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-slate-500 flex items-center gap-2 text-sm">
            {isGroup
              ? <UsersIcon className="w-4 h-4 text-violet-500" />
              : <UserIcon className="w-4 h-4 text-indigo-500" />}
            {isGroup ? '우리 조 평가액' : '내 평가액'}
          </h3>
          {name && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{name}</span>
          )}
        </div>

        {/* Value + Sparkline */}
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-3xl font-display font-bold tabular-nums tracking-tight text-slate-900">
              ₩{value.toLocaleString()}
            </div>
            <div className={cn(
              "flex items-center gap-1.5 mt-1 text-sm font-bold",
              isPositive ? "text-emerald-600" : "text-rose-500"
            )}>
              {isPositive ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
              {Math.abs(dailyChange).toLocaleString()}
              <span className="font-medium opacity-80">
                ({isPositive ? '+' : ''}{dailyChangePercent}%)
              </span>
            </div>
          </div>

          {sparkline && sparkline.length > 1 && (
            <div className="h-12 w-24 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkline}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={isPositive ? "#10b981" : "#f43f5e"}
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Tooltip contentStyle={{ display: "none" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Rank */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 text-sm">
          {medalEmoji
            ? <span className="text-base">{medalEmoji}</span>
            : <TrophyIcon className="w-4 h-4 text-amber-500" />
          }
          <span className="font-bold text-slate-800">{rank}위</span>
          <span className="text-slate-400">/ {totalParticipants}{isGroup ? '조' : '명'}</span>
          {!isGroup && (
            <span className={cn(
              "ml-auto text-xs font-bold px-2 py-0.5 rounded-full",
              isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            )}>
              상위 {((rank / totalParticipants) * 100).toFixed(1)}%
            </span>
          )}
        </div>

        {/* CTA */}
        <Link
          href={isGroup ? "/student/group" : "/student/portfolio"}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-colors",
            isPositive
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "bg-rose-50 text-rose-700 hover:bg-rose-100"
          )}
        >
          <PieChartIcon className="w-4 h-4" />
          {isGroup ? '조 포트폴리오 보기' : '내 포트폴리오 보기'}
        </Link>
      </div>
    </div>
  );
}
