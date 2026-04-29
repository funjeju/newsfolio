"use client";

import { useState } from "react";
import * as motion from "framer-motion/client";
import {
  Users, Trophy, TrendingUp, TrendingDown, MessageSquare,
  CalendarIcon, ChevronRightIcon, TargetIcon, ShieldIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PortfolioDonut } from "@/components/student/PortfolioDonut";
import Link from "next/link";

const ROLE_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  analyst:    { label: "애널리스트",   color: "bg-purple-500/20 text-purple-300",   emoji: "📊" },
  researcher: { label: "리서처",       color: "bg-blue-500/20 text-blue-300",       emoji: "🔍" },
  reporter:   { label: "기자",         color: "bg-green-500/20 text-green-300",     emoji: "📰" },
  critic:     { label: "크리틱",       color: "bg-orange-500/20 text-orange-300",   emoji: "🎯" },
  editor:     { label: "에디터",       color: "bg-yellow-500/20 text-yellow-300",   emoji: "✏️" },
  auditor:    { label: "감사",         color: "bg-red-500/20 text-red-300",         emoji: "🛡️" },
};

const MOCK_GROUP = {
  name: "슈퍼노바5조",
  number: 5,
  rank: 3,
  totalGroups: 24,
  currentValue: 48230000,
  dailyChange: 1230000,
  dailyChangePercent: 2.6,
  mainSectors: ["semiconductor", "automotive"],
  nextChangeDate: "2026-05-02",
  members: [
    {
      id: "u1", name: "김지민", role: "analyst",
      sectorIds: ["semiconductor"],
      totalValue: 12450000, rank: 12, isMe: true,
      activity: [true, true, true, false, true, true, true],
    },
    {
      id: "u2", name: "이현우", role: "researcher",
      sectorIds: ["semiconductor", "automotive"],
      totalValue: 11800000, rank: 18, isMe: false,
      activity: [true, true, false, false, true, true, true],
    },
    {
      id: "u3", name: "박소윤", role: "reporter",
      sectorIds: ["automotive"],
      totalValue: 12100000, rank: 15, isMe: false,
      activity: [true, false, true, true, true, false, true],
    },
    {
      id: "u4", name: "최준호", role: "critic",
      sectorIds: ["semiconductor"],
      totalValue: 11880000, rank: 17, isMe: false,
      activity: [false, true, true, true, false, true, true],
    },
  ],
};

const GROUP_PORTFOLIO = [
  { sectorId: "semiconductor", color: "#818CF8", weight: 60 },
  { sectorId: "automotive",    color: "#FBBF24", weight: 40 },
];

function ActivityDots({ days }: { days: boolean[] }) {
  return (
    <div className="flex items-center gap-0.5">
      {days.map((active, i) => (
        <div
          key={i}
          className={cn(
            "w-2 h-2 rounded-full",
            active ? "bg-brand-400" : "bg-white/10"
          )}
          title={active ? "활동함" : "비활동"}
        />
      ))}
    </div>
  );
}

export default function StudentGroupPage() {
  const [tab, setTab] = useState<"overview" | "members" | "chat">("overview");
  const isPositive = MOCK_GROUP.dailyChange >= 0;

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-bold mb-3 border border-brand-500/30">
            <Users className="w-3.5 h-3.5" />
            우리 조 현황
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">{MOCK_GROUP.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{MOCK_GROUP.members.length}명 구성</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end text-yellow-400 font-bold text-lg">
            <Trophy className="w-5 h-5" />
            {MOCK_GROUP.rank}위 / {MOCK_GROUP.totalGroups}조
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">조 종합 순위</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass p-5 flex flex-col gap-1">
          <p className="text-xs text-muted-foreground">조 총 평가액</p>
          <p className="text-2xl font-display font-bold">₩{(MOCK_GROUP.currentValue / 10000).toFixed(0)}만</p>
          <div className={cn("flex items-center gap-1 text-sm font-medium", isPositive ? "text-score-up" : "text-score-down")}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {isPositive ? "+" : ""}{MOCK_GROUP.dailyChangePercent}%
            <span className="text-muted-foreground font-normal">오늘</span>
          </div>
        </div>

        <div className="glass p-5 flex flex-col gap-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <TargetIcon className="w-3.5 h-3.5" />
            메인 섹터
          </p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {MOCK_GROUP.mainSectors.map(s => (
              <span key={s} className="px-2 py-0.5 bg-brand-500/20 text-brand-300 rounded-full text-xs font-semibold">
                {s === "semiconductor" ? "💻 반도체" : s === "automotive" ? "🚗 자동차" : s}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
            <CalendarIcon className="w-3 h-3" />
            다음 변경 가능일: {MOCK_GROUP.nextChangeDate}
          </p>
        </div>

        <div className="glass p-5 flex flex-col gap-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <ShieldIcon className="w-3.5 h-3.5" />
            조원 활동률
          </p>
          <p className="text-2xl font-display font-bold">
            {Math.round(
              (MOCK_GROUP.members.reduce((sum, m) => sum + m.activity.filter(Boolean).length, 0) /
              (MOCK_GROUP.members.length * 7)) * 100
            )}%
          </p>
          <p className="text-[10px] text-muted-foreground">최근 7일 평균</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
        {(["overview", "members", "chat"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-semibold transition-colors",
              tab === t ? "bg-brand-500 text-white" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "overview" ? "개요" : t === "members" ? "조원" : "토론방"}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Donut chart */}
          <div className="glass p-6 flex flex-col items-center">
            <h3 className="font-bold mb-4 self-start">조 포트폴리오 구성</h3>
            <PortfolioDonut
              allocations={GROUP_PORTFOLIO}
              totalValue={MOCK_GROUP.currentValue}
            />
          </div>

          {/* Member quick summary */}
          <div className="glass p-5 space-y-3">
            <h3 className="font-bold">조원 성과 요약</h3>
            {[...MOCK_GROUP.members].sort((a, b) => b.totalValue - a.totalValue).map((m, i) => {
              const roleInfo = ROLE_LABELS[m.role];
              return (
                <div key={m.id} className={cn("flex items-center gap-3 p-3 rounded-xl", m.isMe ? "bg-brand-500/10 border border-brand-500/20" : "bg-white/5")}>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{m.name}</span>
                      {m.isMe && <span className="text-[10px] px-1.5 py-0.5 bg-brand-500/20 text-brand-300 rounded">나</span>}
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", roleInfo.color)}>
                        {roleInfo.emoji} {roleInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.rank}위</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold">₩{(m.totalValue / 10000).toFixed(0)}만</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "members" && (
        <div className="space-y-3">
          {MOCK_GROUP.members.map(member => {
            const roleInfo = ROLE_LABELS[member.role];
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "glass rounded-2xl p-5 border",
                  member.isMe ? "border-brand-500/40 bg-brand-500/5" : "border-border/50"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shrink-0",
                      member.isMe ? "bg-brand-500 text-white" : "bg-white/10"
                    )}>
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold">{member.name}</span>
                        {member.isMe && (
                          <span className="text-[10px] px-2 py-0.5 bg-brand-500/20 text-brand-300 rounded-full font-semibold">나</span>
                        )}
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", roleInfo.color)}>
                          {roleInfo.emoji} {roleInfo.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {member.sectorIds.map(s => (
                          <span key={s} className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-muted-foreground">
                            {s === "semiconductor" ? "💻 반도체" : s === "automotive" ? "🚗 자동차" : s}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>7일 활동</span>
                        <ActivityDots days={member.activity} />
                        <span className="text-foreground font-medium">
                          {member.activity.filter(Boolean).length}/7
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold">₩{(member.totalValue / 10000).toFixed(0)}만</div>
                    <div className="text-xs text-muted-foreground mt-0.5">개인 {member.rank}위</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {tab === "chat" && (
        <div className="glass rounded-2xl p-8 flex flex-col items-center gap-4 text-center border border-border/50">
          <MessageSquare className="w-12 h-12 text-muted-foreground" />
          <h3 className="font-bold text-lg">조 토론방</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            조원들과 오늘 뉴스를 함께 토론하고 매수·매도 전략을 논의해보세요!
          </p>
          <Link
            href="/student/group/discussion"
            className="flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition-colors"
          >
            토론방 입장하기 <ChevronRightIcon className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
