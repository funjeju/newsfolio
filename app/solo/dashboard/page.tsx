"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUpIcon, TrendingDownIcon, ArrowRightIcon,
  SparklesIcon, FlameIcon, CalendarIcon, NewspaperIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useUser } from "@/lib/hooks/useUser";

const MOCK_PORTFOLIO_HISTORY = [
  { date: "4/22", value: 1000000 },
  { date: "4/23", value: 1012000 },
  { date: "4/24", value: 1008000 },
  { date: "4/25", value: 1025000 },
  { date: "4/28", value: 1019000 },
  { date: "4/29", value: 1038000 },
];

const MOCK_MY_SECTORS = [
  { id: "semi", name: "반도체", icon: "💻", weight: 40, dailyReturn: 2.1, cumReturn: 3.8 },
  { id: "bio",  name: "바이오",  icon: "🧬", weight: 35, dailyReturn: -0.8, cumReturn: 1.2 },
  { id: "fin",  name: "금융",   icon: "🏦", weight: 25, dailyReturn: 0.5, cumReturn: -0.3 },
];

const MOCK_TODAY_MOVERS = [
  { name: "반도체", icon: "💻", return: 2.1, rank: 1 },
  { name: "방산",   icon: "🛡️", return: 1.8, rank: 2 },
  { name: "바이오", icon: "🧬", return: -0.8, rank: 7 },
];

const MOCK_NEWS = [
  { title: "삼성전자, HBM4 양산 속도 높여 엔비디아 공급 본격화", source: "조선비즈", time: "오전 7:30" },
  { title: "코스피, 美 빅테크 실적 호조에 장중 2% 상승", source: "한국경제", time: "오전 9:15" },
];

export default function SoloDashboard() {
  const { user } = useUser();
  const currentValue = 1038000;
  const startValue = 1000000;
  const cumReturn = ((currentValue - startValue) / startValue) * 100;
  const dailyReturn = ((1038000 - 1019000) / 1019000) * 100;
  const rank = 142;
  const totalUsers = 3841;

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-display font-bold">
          안녕하세요, {user?.displayName ?? "투자자"}님 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">오늘도 뉴스를 읽고 섹터를 선택해보세요</p>
      </div>

      {/* Portfolio Value Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm opacity-80">내 포트폴리오</div>
            <div className="text-4xl font-display font-bold mt-1">
              {currentValue.toLocaleString()}원
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className={`flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-full ${dailyReturn >= 0 ? "bg-white/20" : "bg-red-400/30"}`}>
                {dailyReturn >= 0 ? <TrendingUpIcon className="w-3.5 h-3.5" /> : <TrendingDownIcon className="w-3.5 h-3.5" />}
                오늘 {dailyReturn >= 0 ? "+" : ""}{dailyReturn.toFixed(2)}%
              </span>
              <span className={`text-sm opacity-80`}>
                누적 {cumReturn >= 0 ? "+" : ""}{cumReturn.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-80">전체 랭킹</div>
            <div className="text-3xl font-display font-bold mt-1">{rank}위</div>
            <div className="text-xs opacity-70 mt-0.5">/{totalUsers.toLocaleString()}명</div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="mt-4 h-16">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_PORTFOLIO_HISTORY} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="soloGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke="#ffffff" strokeWidth={2} fill="url(#soloGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* My Sectors + Today's Movers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* My Sectors */}
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-emerald-400" /> 내 섹터 배분
            </h2>
            <Link href="/solo/portfolio" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
              변경 <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_MY_SECTORS.map(s => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="text-xl w-8 text-center">{s.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className={`text-xs font-bold ${s.dailyReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {s.dailyReturn >= 0 ? "+" : ""}{s.dailyReturn.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${s.weight}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{s.weight}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Movers */}
        <div className="bg-card border border-border/50 rounded-2xl p-5">
          <h2 className="font-bold text-base flex items-center gap-2 mb-4">
            <FlameIcon className="w-4 h-4 text-orange-400" /> 오늘의 섹터 현황
          </h2>
          <div className="space-y-2">
            {MOCK_TODAY_MOVERS.map(m => (
              <div key={m.name} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                <span className="text-base w-6 text-center">{m.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.rank}위</div>
                </div>
                <span className={`text-sm font-bold ${m.return >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {m.return >= 0 ? "+" : ""}{m.return.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
          <Link href="/" className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            전체 섹터 보기 <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Today's News */}
      <div className="bg-card border border-border/50 rounded-2xl p-5">
        <h2 className="font-bold text-base flex items-center gap-2 mb-4">
          <NewspaperIcon className="w-4 h-4 text-blue-400" /> 오늘의 주요 뉴스
        </h2>
        <div className="space-y-2">
          {MOCK_NEWS.map((n, i) => (
            <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-muted/30">
              <CalendarIcon className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium line-clamp-1">{n.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{n.source} · {n.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA: Set Portfolio */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <div className="font-bold">포트폴리오 섹터를 바꿔보세요</div>
          <div className="text-sm text-muted-foreground mt-0.5">매일 뉴스를 보고 섹터 비중을 조정할 수 있어요</div>
        </div>
        <Link
          href="/solo/portfolio"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors whitespace-nowrap"
        >
          조정하기 <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
