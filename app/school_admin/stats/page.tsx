"use client";

import * as motion from "framer-motion/client";
import {
  BarChart3Icon, TrendingUpIcon, UsersIcon, TargetIcon,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

const MOCK_WEEKLY_RETURN = [
  { week: "W1", avg: 2.1 },
  { week: "W2", avg: 3.4 },
  { week: "W3", avg: -1.2 },
  { week: "W4", avg: 5.8 },
  { week: "W5", avg: 4.1 },
  { week: "W6", avg: 6.3 },
];

const MOCK_OBJECTIONS_BY_CLASS = [
  { class: "1반", total: 12, approved: 9 },
  { class: "2반", total: 8,  approved: 5 },
  { class: "3반", total: 15, approved: 11 },
  { class: "4반", total: 6,  approved: 4 },
];

const MOCK_SECTOR_ACTIVITY = [
  { sector: "반도체", count: 48 },
  { sector: "바이오", count: 31 },
  { sector: "2차전지", count: 27 },
  { sector: "부동산", count: 19 },
  { sector: "자동차", count: 15 },
];

const MOCK_TOP_STUDENTS = [
  { rank: 1, name: "이서연", class: "3반", returnRate: 18.4 },
  { rank: 2, name: "박지현", class: "1반", returnRate: 16.2 },
  { rank: 3, name: "최도윤", class: "2반", returnRate: 14.9 },
  { rank: 4, name: "김하은", class: "4반", returnRate: 13.5 },
  { rank: 5, name: "정민준", class: "3반", returnRate: 12.8 },
];

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string; icon: any; color: string;
}) {
  return (
    <div className="glass p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
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

export default function SchoolAdminStatsPage() {
  return (
    <div className="space-y-6 pb-10">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-bold mb-3 border border-blue-500/30">
          <BarChart3Icon className="w-3.5 h-3.5" />
          학교 통계
        </div>
        <h1 className="text-2xl font-display font-bold">학교 전체 통계</h1>
        <p className="text-sm text-muted-foreground mt-1">2026년 4월 기준 · 전체 반 합산 데이터</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="평균 수익률" value="+5.8%" sub="이번 달 기준" icon={TrendingUpIcon} color="bg-green-500/20 text-green-400" />
        <StatCard label="총 이의제기" value={41} sub="승인률 71%" icon={TargetIcon} color="bg-brand-500/20 text-brand-400" />
        <StatCard label="활성 학생" value={312} sub="전체 대비 94%" icon={UsersIcon} color="bg-yellow-500/20 text-yellow-400" />
        <StatCard label="섹터 변경 요청" value={88} sub="이번 시즌 누계" icon={BarChart3Icon} color="bg-purple-500/20 text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Return Chart */}
        <div className="glass p-5 rounded-2xl">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-sm">
            <TrendingUpIcon className="w-4 h-4 text-green-400" />
            주간 평균 수익률 추이
          </h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_WEEKLY_RETURN} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickLine={false} axisLine={false} width={36} unit="%" />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(v) => [`${Number(v) > 0 ? "+" : ""}${Number(v)}%`, "평균 수익률"]}
                />
                <Area type="monotone" dataKey="avg" stroke="#34d399" strokeWidth={2} fill="url(#retGrad)" />
                <defs>
                  <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Activity */}
        <div className="glass p-5 rounded-2xl">
          <h3 className="font-bold mb-4 text-sm">인기 섹터 Top 5 (분석 건수)</h3>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_SECTOR_ACTIVITY} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <XAxis type="number" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="sector" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickLine={false} axisLine={false} width={48} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(v) => [`${Number(v)}건`, "분석"]}
                />
                <Bar dataKey="count" fill="#818CF8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Objections by class */}
        <div className="glass p-5 rounded-2xl space-y-3">
          <h3 className="font-bold text-sm">반별 이의제기 현황</h3>
          {MOCK_OBJECTIONS_BY_CLASS.map((row, i) => (
            <motion.div
              key={row.class}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <span className="text-sm font-semibold w-8 text-center">{row.class}</span>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-400 rounded-full transition-all"
                  style={{ width: `${(row.approved / row.total) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-20 text-right">
                {row.approved}/{row.total} 승인
              </span>
            </motion.div>
          ))}
        </div>

        {/* Top Students */}
        <div className="glass p-5 rounded-2xl space-y-2">
          <h3 className="font-bold text-sm mb-3">개인 수익률 TOP 5</h3>
          {MOCK_TOP_STUDENTS.map((s, i) => (
            <div key={s.rank} className="flex items-center gap-3 py-1.5 border-b border-border/30 last:border-0">
              <span className={`text-sm font-bold w-6 text-center ${i === 0 ? "text-yellow-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-amber-600" : "text-muted-foreground"}`}>
                {s.rank}
              </span>
              <span className="flex-1 text-sm font-semibold">{s.name}</span>
              <span className="text-xs text-muted-foreground">{s.class}</span>
              <span className="text-sm font-bold text-score-up">+{s.returnRate}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
