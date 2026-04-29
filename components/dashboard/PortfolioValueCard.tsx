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
  const lineColor = isPositive ? "#34d399" : "#f87171";

  return (
    <div className={cn("glass p-5 flex flex-col gap-3", className)}>
      <div className="flex justify-between items-center text-muted-foreground">
        <h3 className="font-semibold flex items-center gap-2">
          {isGroup ? <UsersIcon className="w-4 h-4 text-brand-400" /> : <UserIcon className="w-4 h-4 text-brand-400" />}
          {isGroup ? '우리 조 평가액' : '내 평가액'}
        </h3>
        {name && <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{name}</span>}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-3xl font-display font-bold tabular-nums tracking-tight">
            ₩{value.toLocaleString()}
          </div>
          <div className={cn(
            "flex items-center gap-1.5 mt-1 text-sm font-medium",
            isPositive ? "text-score-up" : "text-score-down"
          )}>
            {isPositive ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
            {Math.abs(dailyChange).toLocaleString()}
            <span className="opacity-80">({isPositive ? '+' : ''}{dailyChangePercent}%)</span>
          </div>
        </div>

        {/* Sparkline */}
        {sparkline && sparkline.length > 1 && (
          <div className="h-12 w-24 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkline}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={lineColor}
                  strokeWidth={2}
                  dot={false}
                />
                <Tooltip
                  contentStyle={{ display: "none" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-border/50 text-sm">
        <TrophyIcon className="w-4 h-4 text-yellow-500" />
        <span className="font-medium text-foreground">{rank}위</span>
        <span className="text-muted-foreground">/ {totalParticipants}{isGroup ? '조' : '명'}</span>
        {!isGroup && (
          <span className="ml-auto text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded">
            상위 {((rank / totalParticipants) * 100).toFixed(1)}%
          </span>
        )}
      </div>

      <Link
        href={isGroup ? "/student/group" : "/student/portfolio"}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
      >
        <PieChartIcon className="w-4 h-4" />
        {isGroup ? '조 포트폴리오 보기' : '내 포트폴리오 보기'}
      </Link>
    </div>
  );
}
