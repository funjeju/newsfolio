"use client";

import { useState } from "react";
import * as motion from "framer-motion/client";
import {
  UsersIcon, SearchIcon, ShieldCheckIcon, UserIcon,
  ChevronDownIcon, BanIcon, KeyRoundIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type UserRole = "system_admin" | "school_admin" | "teacher" | "student";

interface MockUser {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  school: string;
  className?: string;
  status: "active" | "suspended" | "pending";
  lastSeen: string;
  createdAt: string;
}

const MOCK_USERS: MockUser[] = [
  { id: "u1", displayName: "김민준 (관리자)", email: "minjun@seoulmiraejhs.edu.kr", role: "school_admin", school: "서울 미래중학교", status: "active", lastSeen: "2026-04-29", createdAt: "2026-02-10" },
  { id: "u2", displayName: "이하나 선생님", email: "hana@seoulmiraejhs.edu.kr", role: "teacher", school: "서울 미래중학교", className: "2학년 1반", status: "active", lastSeen: "2026-04-29", createdAt: "2026-02-12" },
  { id: "u3", displayName: "박서준 선생님", email: "seojun@busaninnovation.edu.kr", role: "teacher", school: "부산 혁신초등학교", className: "5학년 3반", status: "active", lastSeen: "2026-04-28", createdAt: "2026-02-16" },
  { id: "u4", displayName: "최지우", email: "jiwoo@student.kr", role: "student", school: "서울 미래중학교", className: "2학년 1반", status: "active", lastSeen: "2026-04-29", createdAt: "2026-03-03" },
  { id: "u5", displayName: "정도현", email: "dohyun@student.kr", role: "student", school: "부산 혁신초등학교", className: "5학년 3반", status: "suspended", lastSeen: "2026-04-20", createdAt: "2026-03-04" },
  { id: "u6", displayName: "윤시아", email: "sia@student.kr", role: "student", school: "대구 창의중학교", className: "1학년 2반", status: "active", lastSeen: "2026-04-29", createdAt: "2026-03-05" },
  { id: "u7", displayName: "강현우 선생님", email: "hyunwoo@daesin.edu.kr", role: "teacher", school: "대구 창의중학교", className: "1학년 2반", status: "pending", lastSeen: "없음", createdAt: "2026-04-28" },
];

const ROLE_STYLE: Record<UserRole, { label: string; color: string }> = {
  system_admin: { label: "시스템 관리자", color: "text-red-400 bg-red-500/10" },
  school_admin:  { label: "학교 관리자",   color: "text-orange-400 bg-orange-500/10" },
  teacher:       { label: "교사",          color: "text-blue-400 bg-blue-500/10" },
  student:       { label: "학생",          color: "text-green-400 bg-green-500/10" },
};

const STATUS_STYLE = {
  active:    { label: "활성",      color: "text-score-up bg-score-up/10" },
  suspended: { label: "정지",      color: "text-score-down bg-score-down/10" },
  pending:   { label: "승인 대기", color: "text-yellow-400 bg-yellow-500/10" },
};

const ROLE_FILTER_OPTIONS: (UserRole | "all")[] = ["all", "system_admin", "school_admin", "teacher", "student"];
const ROLE_FILTER_LABELS: Record<string, string> = {
  all: "전체", system_admin: "시스템 관리자", school_admin: "학교 관리자", teacher: "교사", student: "학생",
};

export default function SystemAdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");

  const filtered = MOCK_USERS.filter(u => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchSearch = !search || u.displayName.includes(search) || u.email.includes(search) || u.school.includes(search);
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-300 text-xs font-bold mb-3 border border-red-500/30">
            <UsersIcon className="w-3.5 h-3.5" />
            계정 관리
          </div>
          <h1 className="text-2xl font-display font-bold">전체 계정 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            총 {MOCK_USERS.length}명 · 교사 {MOCK_USERS.filter(u => u.role === "teacher").length}명 · 학생 {MOCK_USERS.filter(u => u.role === "student").length}명
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="이름, 이메일, 학교로 검색"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100/70 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-brand-500/50 placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ROLE_FILTER_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => setRoleFilter(opt)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-semibold transition-colors",
                roleFilter === opt ? "bg-red-500/20 text-red-300 border border-red-500/30" : "bg-slate-100/70 text-muted-foreground hover:bg-slate-100"
              )}
            >
              {ROLE_FILTER_LABELS[opt]}
            </button>
          ))}
        </div>
      </div>

      {/* User Table */}
      <div className="glass rounded-2xl overflow-hidden border border-border/50">
        <div className="hidden md:grid grid-cols-[1fr_1.5fr_auto_auto_auto_auto] gap-4 px-5 py-3 text-xs text-muted-foreground border-b border-border/30 font-semibold">
          <span>이름</span>
          <span>이메일 · 학교</span>
          <span>역할</span>
          <span>상태</span>
          <span>최근 접속</span>
          <span>액션</span>
        </div>
        <div className="divide-y divide-border/20">
          {filtered.map((u, i) => {
            const role = ROLE_STYLE[u.role];
            const status = STATUS_STYLE[u.status];
            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_auto_auto_auto_auto] gap-2 md:gap-4 px-5 py-4 items-center"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    {u.role === "system_admin" ? <ShieldCheckIcon className="w-4 h-4 text-red-400" /> : <UserIcon className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <span className="font-semibold text-sm">{u.displayName}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{u.school}{u.className ? ` · ${u.className}` : ""}</p>
                </div>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", role.color)}>{role.label}</span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", status.color)}>{status.label}</span>
                <span className="text-xs text-muted-foreground">{u.lastSeen}</span>
                <div className="flex gap-1">
                  {u.status === "pending" && (
                    <button
                      onClick={() => toast.success(`${u.displayName} 승인됐어요.`)}
                      className="px-2 py-1 text-xs bg-score-up/10 text-score-up hover:bg-score-up/20 rounded-lg transition-colors font-semibold"
                    >
                      승인
                    </button>
                  )}
                  {u.status === "active" && u.role !== "system_admin" && (
                    <button
                      onClick={() => toast.success(`${u.displayName} 계정이 정지됐어요.`)}
                      className="p-1.5 rounded-lg bg-slate-100/70 hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <BanIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {u.status === "suspended" && (
                    <button
                      onClick={() => toast.success(`${u.displayName} 계정이 복구됐어요.`)}
                      className="px-2 py-1 text-xs bg-brand-500/10 text-brand-400 hover:bg-brand-500/20 rounded-lg transition-colors font-semibold"
                    >
                      복구
                    </button>
                  )}
                  <button
                    onClick={() => toast.info(`${u.displayName} 비밀번호 재설정 이메일이 발송됐어요.`)}
                    className="p-1.5 rounded-lg bg-slate-100/70 hover:bg-slate-100 text-muted-foreground transition-colors"
                  >
                    <KeyRoundIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
