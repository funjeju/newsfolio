"use client";

import * as motion from "framer-motion/client";
import {
  BuildingIcon, UsersIcon, ActivityIcon, ServerIcon,
  TrendingUpIcon, CheckCircle2Icon, AlertCircleIcon, ZapIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

const MOCK_SYSTEM_STATS = {
  totalSchools: 12,
  totalTeachers: 87,
  totalStudents: 2840,
  activeClasses: 54,
  dailyActiveUsers: 1230,
  functionsSuccessRate: 99.2,
  avgResponseMs: 420,
};

const MOCK_DAILY_USERS = [
  { date: "04-22", dau: 980 },
  { date: "04-23", dau: 1050 },
  { date: "04-24", dau: 1180 },
  { date: "04-25", dau: 1020 },
  { date: "04-26", dau: 890 },
  { date: "04-27", dau: 760 },
  { date: "04-28", dau: 1150 },
  { date: "04-29", dau: 1230 },
];

const MOCK_RECENT_EVENTS = [
  { id: "e1", type: "success", message: "calcImpactScores 완료 — 12개 학교 처리", time: "06:10" },
  { id: "e2", type: "success", message: "generateBriefings 완료 — 54개 반 브리핑 생성", time: "06:15" },
  { id: "e3", type: "success", message: "publishCardNews 완료 — 162개 카드뉴스 발행", time: "07:02" },
  { id: "e4", type: "warning", message: "onObjectionCreated 지연 — 함수 실행 450ms 초과", time: "09:32" },
  { id: "e5", type: "success", message: "calcPortfolioValues 완료 — 2840명 포트폴리오 갱신", time: "16:32" },
  { id: "e6", type: "error", message: "announceBestAnalyst 실패 — Gemini API rate limit", time: "17:31" },
];

const EVENT_STYLE = {
  success: { color: "text-score-up", bg: "bg-score-up/10", icon: CheckCircle2Icon },
  warning: { color: "text-yellow-400", bg: "bg-yellow-500/10", icon: AlertCircleIcon },
  error:   { color: "text-score-down", bg: "bg-score-down/10", icon: AlertCircleIcon },
};

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: any; color: string }) {
  return (
    <div className="glass p-5 flex items-start gap-4">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-display font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function SystemAdminDashboard() {
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-300 text-xs font-bold mb-3 border border-red-500/30">
          <ZapIcon className="w-3.5 h-3.5" />
          시스템 전체 현황
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Newsfolio 시스템 대시보드</h1>
        <p className="text-sm text-muted-foreground mt-1">오늘 2026-04-29 · 모든 파이프라인 정상 운영 중</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="등록 학교" value={MOCK_SYSTEM_STATS.totalSchools} icon={BuildingIcon} color="bg-blue-500/20 text-blue-400" />
        <StatCard label="전체 학생" value={MOCK_SYSTEM_STATS.totalStudents.toLocaleString()} icon={UsersIcon} color="bg-brand-500/20 text-brand-400" />
        <StatCard label="일일 활성 사용자" value={MOCK_SYSTEM_STATS.dailyActiveUsers.toLocaleString()} sub="오늘 기준" icon={ActivityIcon} color="bg-green-500/20 text-green-400" />
        <StatCard label="함수 성공률" value={`${MOCK_SYSTEM_STATS.functionsSuccessRate}%`} sub={`평균 ${MOCK_SYSTEM_STATS.avgResponseMs}ms`} icon={ServerIcon} color="bg-yellow-500/20 text-yellow-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DAU Chart */}
        <div className="lg:col-span-2 glass p-5 rounded-2xl">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <TrendingUpIcon className="w-4 h-4 text-brand-400" />
            일일 활성 사용자 추이 (8일)
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_DAILY_USERS} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickLine={false} axisLine={false} width={40} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(v) => [`${Number(v).toLocaleString()}명`, "DAU"]}
                />
                <Area
                  type="monotone"
                  dataKey="dau"
                  stroke="#818CF8"
                  strokeWidth={2}
                  fill="url(#dauGrad)"
                />
                <defs>
                  <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818CF8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#818CF8" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Events */}
        <div className="glass p-5 rounded-2xl">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <ServerIcon className="w-4 h-4 text-red-400" />
            오늘 함수 실행 로그
          </h3>
          <div className="space-y-2">
            {MOCK_RECENT_EVENTS.map(ev => {
              const style = EVENT_STYLE[ev.type as keyof typeof EVENT_STYLE];
              const Icon = style.icon;
              return (
                <div key={ev.id} className={cn("flex items-start gap-2 p-2.5 rounded-xl text-xs", style.bg)}>
                  <Icon className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", style.color)} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-semibold truncate", style.color)}>{ev.time}</p>
                    <p className="text-muted-foreground leading-relaxed mt-0.5">{ev.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
