"use client";

import * as motion from "framer-motion/client";
import {
  UsersIcon, BookOpenIcon, TrendingUpIcon, ActivityIcon,
  CheckCircle2Icon, ClockIcon, AlertCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_SCHOOL = {
  name: "서울 미래중학교",
  totalTeachers: 8,
  totalStudents: 312,
  activeClasses: 6,
  totalClasses: 8,
  seasonState: "running",
};

const MOCK_CLASS_SUMMARY = [
  { id: "c1", name: "1학년 1반", teacher: "김민준", students: 32, avgReturn: 18.4, state: "running", objectionsPending: 3 },
  { id: "c2", name: "1학년 2반", teacher: "이수진", students: 30, avgReturn: 15.2, state: "running", objectionsPending: 0 },
  { id: "c3", name: "2학년 1반", teacher: "박도현", students: 35, avgReturn: 22.1, state: "running", objectionsPending: 5 },
  { id: "c4", name: "2학년 2반", teacher: "최유나", students: 33, avgReturn: 12.8, state: "running", objectionsPending: 1 },
  { id: "c5", name: "3학년 1반", teacher: "정하늘", students: 28, avgReturn: 8.3, state: "running", objectionsPending: 0 },
  { id: "c6", name: "3학년 2반", teacher: "한지수", students: 31, avgReturn: 19.7, state: "running", objectionsPending: 2 },
];

const STATE_STYLE = {
  running:    { label: "진행 중", color: "text-score-up bg-score-up/10", icon: ActivityIcon },
  setup:      { label: "준비 중", color: "text-yellow-400 bg-yellow-500/10", icon: ClockIcon },
  finished:   { label: "종료",   color: "text-muted-foreground bg-white/5", icon: CheckCircle2Icon },
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

export default function SchoolAdminDashboard() {
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-bold mb-3 border border-brand-500/30">
          학교 관리자 대시보드
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">{MOCK_SCHOOL.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">시즌 진행 중 · {MOCK_SCHOOL.activeClasses}개 반 활성</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="총 교사" value={MOCK_SCHOOL.totalTeachers} icon={UsersIcon} color="bg-blue-500/20 text-blue-400" />
        <StatCard label="총 학생" value={MOCK_SCHOOL.totalStudents} icon={UsersIcon} color="bg-brand-500/20 text-brand-400" />
        <StatCard label="진행 중인 반" value={`${MOCK_SCHOOL.activeClasses}/${MOCK_SCHOOL.totalClasses}`} icon={BookOpenIcon} color="bg-green-500/20 text-green-400" />
        <StatCard
          label="평균 누적 수익률"
          value={`+${(MOCK_CLASS_SUMMARY.reduce((s, c) => s + c.avgReturn, 0) / MOCK_CLASS_SUMMARY.length).toFixed(1)}%`}
          icon={TrendingUpIcon}
          color="bg-yellow-500/20 text-yellow-400"
        />
      </div>

      {/* Class Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border/50">
          <h2 className="font-bold text-lg">반별 현황</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">반</th>
                <th className="px-5 py-3 text-left">담당 교사</th>
                <th className="px-5 py-3 text-right">학생 수</th>
                <th className="px-5 py-3 text-right">평균 수익률</th>
                <th className="px-5 py-3 text-center">대기 이의</th>
                <th className="px-5 py-3 text-center">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {MOCK_CLASS_SUMMARY.map((cls, i) => {
                const stateInfo = STATE_STYLE[cls.state as keyof typeof STATE_STYLE] ?? STATE_STYLE.running;
                const StateIcon = stateInfo.icon;
                return (
                  <motion.tr
                    key={cls.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-5 py-3 font-semibold">{cls.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{cls.teacher}</td>
                    <td className="px-5 py-3 text-right">{cls.students}명</td>
                    <td className={cn("px-5 py-3 text-right font-bold", cls.avgReturn >= 0 ? "text-score-up" : "text-score-down")}>
                      {cls.avgReturn >= 0 ? "+" : ""}{cls.avgReturn}%
                    </td>
                    <td className="px-5 py-3 text-center">
                      {cls.objectionsPending > 0 ? (
                        <span className="inline-flex items-center gap-1 text-yellow-400 font-bold">
                          <AlertCircleIcon className="w-3.5 h-3.5" />
                          {cls.objectionsPending}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold", stateInfo.color)}>
                        <StateIcon className="w-3 h-3" />
                        {stateInfo.label}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
