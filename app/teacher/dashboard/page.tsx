"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus, ZapIcon, TrophyIcon,
  ChevronRightIcon, SettingsIcon, UsersIcon,
  AwardIcon, ClipboardListIcon, TrendingUpIcon, TrendingDownIcon, ExternalLinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MOCK_IMPACTS, MOCK_SECTORS } from "@/lib/mockData";

const MOCK_CLASS = {
  name: "5학년 3반",
  totalStudents: 24,
  activeStudents: 22,
  groups: 6,
  seasonWeek: 2,
  totalWeeks: 40,
  toneLevel: 3,
  toneLabel: "초5-6 (Tone 3)",
  confirmMode: "항상 교사 컨펌",
  pendingQueue: {
    objections: 5,
    transactions: 3,
    domains: 1,
    total: 9,
  },
  ranking: {
    current: 2,
    total: 8,
    label: "학년 내",
  },
  bestGroup: "1조 정보 헌터즈",
};

function StatCard({ label, value, sub, icon, colorClass, href }: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; colorClass: string; href?: string;
}) {
  const content = (
    <div className={cn("bg-white border border-slate-200 shadow-sm p-5 rounded-2xl flex flex-col gap-3 h-full hover:border-indigo-200 hover:shadow-md transition-all", href ? "cursor-pointer" : "")}>
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colorClass)}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm font-medium mt-0.5">{label}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function QuickAction({ href, icon, label, badge }: { href: string; icon: React.ReactNode; label: string; badge?: number }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-all group">
      <div className="text-brand-400">{icon}</div>
      <span className="font-medium text-sm flex-1">{label}</span>
      {badge && badge > 0 ? (
        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">{badge}</span>
      ) : (
        <ChevronRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      )}
    </Link>
  );
}

export default function TeacherDashboardPage() {
  const cls = MOCK_CLASS;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="text-sm text-muted-foreground mb-1">교사 대시보드</div>
          <h1 className="text-3xl font-display font-bold">{cls.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-slate-600"
          >
            <ExternalLinkIcon className="w-4 h-4" />
            섹터 현황 메인
          </Link>
          <Link
            href="/teacher/setup"
            className="flex items-center gap-2 bg-brand-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-brand-600 transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          >
            <Plus className="w-5 h-5" />
            새 학급 만들기
          </Link>
        </div>
      </div>

      {/* Class Status Bar */}
      <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <div className="text-muted-foreground mb-1">학생</div>
            <div className="font-bold text-xl">{cls.activeStudents}<span className="text-muted-foreground font-normal text-sm">/{cls.totalStudents}명</span></div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">시즌 진행</div>
            <div className="font-bold text-xl">{cls.seasonWeek}주<span className="text-muted-foreground font-normal text-sm">/{cls.totalWeeks}주차</span></div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">학급 톤</div>
            <div className="font-bold">{cls.toneLabel}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">컨펌 모드</div>
            <div className="font-bold text-sm">{cls.confirmMode}</div>
          </div>
        </div>
      </div>

      {/* Confirm Queue Alert */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-amber-50 border border-amber-300 p-5 rounded-2xl"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
              <ZapIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-lg flex items-center gap-2 text-slate-800">
                컨펌 큐
                <span className="text-sm font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">{cls.pendingQueue.total}건 대기</span>
              </div>
              <div className="text-sm text-amber-700 mt-0.5">
                이의제기 {cls.pendingQueue.objections}건 · 포지션 변경 {cls.pendingQueue.transactions}건 · 도메인 요청 {cls.pendingQueue.domains}건
              </div>
            </div>
          </div>
          <Link href="/teacher/approvals" className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors flex-shrink-0">
            컨펌 큐 열기 <ChevronRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="우리 반 랭킹"
          value={`${cls.ranking.current}위`}
          sub={`${cls.ranking.label} ${cls.ranking.total}개 반`}
          icon={<TrophyIcon className="w-5 h-5 text-amber-600" />}
          colorClass="bg-amber-100"
          href="/teacher/students"
        />
        <StatCard
          label="이번 주 조 1위"
          value={cls.bestGroup}
          sub="주간 수익률 +5.2%"
          icon={<AwardIcon className="w-5 h-5 text-indigo-600" />}
          colorClass="bg-indigo-100"
          href="/teacher/groups"
        />
        <StatCard
          label="활동 학생"
          value={`${cls.activeStudents}명`}
          sub={`${Math.round(cls.activeStudents/cls.totalStudents*100)}% 참여`}
          icon={<UsersIcon className="w-5 h-5 text-emerald-600" />}
          colorClass="bg-emerald-100"
          href="/teacher/students"
        />
        <StatCard
          label="전체 조"
          value={`${cls.groups}조`}
          sub="조당 평균 4명"
          icon={<UsersIcon className="w-5 h-5 text-violet-600" />}
          colorClass="bg-violet-100"
          href="/teacher/groups"
        />
      </div>

      {/* Sector Summary */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-bold text-lg">오늘의 섹터 등락률</h2>
          <Link href="/" className="text-xs text-indigo-600 hover:underline font-medium flex items-center gap-1">
            전체 순위 보기 <ChevronRightIcon className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {[...MOCK_IMPACTS]
            .sort((a, b) => b.dailyReturn - a.dailyReturn)
            .map((impact) => {
              const sector = MOCK_SECTORS.find(s => s.id === impact.sectorId);
              if (!sector) return null;
              const isUp = impact.dailyReturn > 0;
              const isDown = impact.dailyReturn < 0;
              return (
                <motion.div
                  key={sector.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center",
                    isUp
                      ? "bg-emerald-50 border-emerald-200"
                      : isDown
                      ? "bg-red-50 border-red-200"
                      : "bg-slate-50 border-slate-200"
                  )}
                >
                  <span className="text-xl">{sector.icon}</span>
                  <span className="text-xs font-semibold text-slate-700 leading-tight">{sector.name}</span>
                  <div className={cn(
                    "flex items-center gap-0.5 text-sm font-bold",
                    isUp ? "text-emerald-600" : isDown ? "text-red-500" : "text-slate-400"
                  )}>
                    {isUp ? <TrendingUpIcon className="w-3.5 h-3.5" /> : isDown ? <TrendingDownIcon className="w-3.5 h-3.5" /> : null}
                    {isUp ? "+" : ""}{impact.dailyReturn.toFixed(2)}%
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h2 className="font-bold text-lg px-1">빠른 이동</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <QuickAction href="/teacher/approvals" icon={<ZapIcon className="w-5 h-5" />} label="컨펌 큐" badge={cls.pendingQueue.total} />
          <QuickAction href="/teacher/students" icon={<UsersIcon className="w-5 h-5" />} label="학생 명단" />
          <QuickAction href="/teacher/groups" icon={<UsersIcon className="w-5 h-5" />} label="조 관리" />
          <QuickAction href="/teacher/evaluations" icon={<ClipboardListIcon className="w-5 h-5" />} label="주간/월간 평가" />
          <QuickAction href="/teacher/awards" icon={<AwardIcon className="w-5 h-5" />} label="상장 발행" />
          <QuickAction href="/teacher/settings" icon={<SettingsIcon className="w-5 h-5" />} label="설정 (섹터·일정·도메인)" />
        </div>
      </div>
    </div>
  );
}
