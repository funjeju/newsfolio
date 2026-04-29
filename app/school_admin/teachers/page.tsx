"use client";

import { useState } from "react";
import * as motion from "framer-motion/client";
import {
  UsersIcon, PlusIcon, SearchIcon, MailIcon,
  CheckCircle2Icon, XCircleIcon, ShieldIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MockTeacher {
  id: string;
  name: string;
  email: string;
  classes: string[];
  status: "active" | "inactive" | "pending";
  joinedAt: string;
}

const MOCK_TEACHERS: MockTeacher[] = [
  { id: "t1", name: "김민준", email: "minjun@school.kr", classes: ["1학년 1반", "1학년 3반"], status: "active", joinedAt: "2026-03-01" },
  { id: "t2", name: "이수진", email: "sujin@school.kr", classes: ["1학년 2반"], status: "active", joinedAt: "2026-03-01" },
  { id: "t3", name: "박도현", email: "dohyun@school.kr", classes: ["2학년 1반"], status: "active", joinedAt: "2026-03-05" },
  { id: "t4", name: "최유나", email: "yuna@school.kr", classes: ["2학년 2반", "2학년 4반"], status: "active", joinedAt: "2026-03-05" },
  { id: "t5", name: "정하늘", email: "haneul@school.kr", classes: ["3학년 1반"], status: "active", joinedAt: "2026-03-10" },
  { id: "t6", name: "한지수", email: "jisu@school.kr", classes: ["3학년 2반"], status: "active", joinedAt: "2026-03-10" },
  { id: "t7", name: "오세훈", email: "sehoon@school.kr", classes: [], status: "pending", joinedAt: "2026-04-20" },
  { id: "t8", name: "윤서연", email: "seoyeon@school.kr", classes: [], status: "inactive", joinedAt: "2026-02-15" },
];

const STATUS_STYLE = {
  active:   { label: "활성",    color: "text-score-up bg-score-up/10" },
  inactive: { label: "비활성",  color: "text-muted-foreground bg-white/5" },
  pending:  { label: "승인 대기", color: "text-yellow-400 bg-yellow-500/10" },
};

export default function SchoolAdminTeachersPage() {
  const [search, setSearch] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  const filtered = MOCK_TEACHERS.filter(t =>
    t.name.includes(search) || t.email.includes(search)
  );

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    toast.success(`${inviteEmail}로 초대 이메일을 발송했어요!`);
    setInviteEmail("");
    setShowInvite(false);
  };

  const handleApprove = (name: string) => toast.success(`${name} 교사 계정이 승인됐어요.`);
  const handleDeactivate = (name: string) => toast.success(`${name} 교사 계정이 비활성화됐어요.`);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-bold mb-3 border border-brand-500/30">
            <UsersIcon className="w-3.5 h-3.5" />
            교사 관리
          </div>
          <h1 className="text-2xl font-display font-bold">교사 계정 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">총 {MOCK_TEACHERS.length}명 · 활성 {MOCK_TEACHERS.filter(t => t.status === "active").length}명</p>
        </div>
        <button
          onClick={() => setShowInvite(v => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-bold hover:bg-brand-600 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          교사 초대
        </button>
      </div>

      {/* Invite Form */}
      {showInvite && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="glass rounded-2xl p-5 border border-brand-500/30 bg-brand-500/5 space-y-3"
        >
          <h3 className="font-bold text-sm flex items-center gap-2">
            <MailIcon className="w-4 h-4 text-brand-400" />
            교사 초대 이메일 발송
          </h3>
          <div className="flex gap-3">
            <input
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="teacher@school.kr"
              type="email"
              className="flex-1 p-3 bg-white/5 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-brand-500/50 placeholder:text-muted-foreground/50"
            />
            <button
              onClick={handleInvite}
              disabled={!inviteEmail.trim()}
              className="px-5 py-3 bg-brand-500 text-white rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-brand-600 transition-colors"
            >
              초대 발송
            </button>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="이름 또는 이메일로 검색"
          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-brand-500/50 placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">교사</th>
                <th className="px-5 py-3 text-left">이메일</th>
                <th className="px-5 py-3 text-left">담당 반</th>
                <th className="px-5 py-3 text-center">상태</th>
                <th className="px-5 py-3 text-center">가입일</th>
                <th className="px-5 py-3 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.map((teacher, i) => {
                const statusInfo = STATUS_STYLE[teacher.status];
                return (
                  <motion.tr
                    key={teacher.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-300 font-bold text-sm">
                          {teacher.name.charAt(0)}
                        </div>
                        <span className="font-semibold">{teacher.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{teacher.email}</td>
                    <td className="px-5 py-3">
                      {teacher.classes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {teacher.classes.map(c => (
                            <span key={c} className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-muted-foreground">{c}</span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">미배정</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", statusInfo.color)}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-muted-foreground text-xs">{teacher.joinedAt}</td>
                    <td className="px-5 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {teacher.status === "pending" && (
                          <button
                            onClick={() => handleApprove(teacher.name)}
                            className="p-1.5 rounded-lg bg-score-up/10 text-score-up hover:bg-score-up/20 transition-colors"
                            title="승인"
                          >
                            <CheckCircle2Icon className="w-4 h-4" />
                          </button>
                        )}
                        {teacher.status === "active" && (
                          <button
                            onClick={() => handleDeactivate(teacher.name)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            title="비활성화"
                          >
                            <XCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          className="p-1.5 rounded-lg bg-white/5 text-muted-foreground hover:bg-white/10 transition-colors"
                          title="권한 관리"
                        >
                          <ShieldIcon className="w-4 h-4" />
                        </button>
                      </div>
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
