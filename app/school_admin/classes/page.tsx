"use client";

import { useState } from "react";
import * as motion from "framer-motion/client";
import {
  BookOpenIcon, PlusIcon, Users2Icon, TrophyIcon,
  CopyIcon, PlayIcon, PauseIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MockClass {
  id: string;
  name: string;
  grade: number;
  teacher: string;
  classCode: string;
  students: number;
  groups: number;
  toneLevel: 1 | 2 | 3 | 4;
  seasonState: "setup" | "running" | "final_week" | "finished";
  avgReturn: number;
  startedAt: string;
}

const MOCK_CLASSES: MockClass[] = [
  { id: "c1", name: "1학년 1반", grade: 7, teacher: "김민준", classCode: "KIM1234", students: 32, groups: 6, toneLevel: 2, seasonState: "running", avgReturn: 18.4, startedAt: "2026-03-10" },
  { id: "c2", name: "1학년 2반", grade: 7, teacher: "이수진", classCode: "LEE5678", students: 30, groups: 6, toneLevel: 2, seasonState: "running", avgReturn: 15.2, startedAt: "2026-03-10" },
  { id: "c3", name: "2학년 1반", grade: 8, teacher: "박도현", classCode: "PARK9012", students: 35, groups: 7, toneLevel: 3, seasonState: "running", avgReturn: 22.1, startedAt: "2026-03-12" },
  { id: "c4", name: "2학년 2반", grade: 8, teacher: "최유나", classCode: "CHOI3456", students: 33, groups: 7, toneLevel: 3, seasonState: "running", avgReturn: 12.8, startedAt: "2026-03-12" },
  { id: "c5", name: "3학년 1반", grade: 9, teacher: "정하늘", classCode: "JUN7890", students: 28, groups: 5, toneLevel: 4, seasonState: "running", avgReturn: 8.3, startedAt: "2026-03-15" },
  { id: "c6", name: "3학년 2반", grade: 9, teacher: "한지수", classCode: "HAN2345", students: 31, groups: 6, toneLevel: 4, seasonState: "running", avgReturn: 19.7, startedAt: "2026-03-15" },
  { id: "c7", name: "2학년 4반", grade: 8, teacher: "최유나", classCode: "CHO6789", students: 0, groups: 0, toneLevel: 3, seasonState: "setup", avgReturn: 0, startedAt: "-" },
];

const TONE_LABELS = { 1: "초1-2", 2: "초3-4", 3: "초5-6", 4: "중학생" };

const STATE_STYLE = {
  setup:       { label: "준비 중",  color: "text-yellow-400 bg-yellow-500/10" },
  running:     { label: "진행 중",  color: "text-score-up bg-score-up/10" },
  final_week:  { label: "파이널",   color: "text-orange-400 bg-orange-500/10" },
  finished:    { label: "종료됨",   color: "text-muted-foreground bg-white/5" },
};

export default function SchoolAdminClassesPage() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_CLASSES.filter(c =>
    c.name.includes(search) || c.teacher.includes(search)
  );

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("클래스 코드가 복사됐어요!");
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-bold mb-3 border border-brand-500/30">
            <BookOpenIcon className="w-3.5 h-3.5" />
            반 관리
          </div>
          <h1 className="text-2xl font-display font-bold">반 현황 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">총 {MOCK_CLASSES.length}개 반 · 진행 중 {MOCK_CLASSES.filter(c => c.seasonState === "running").length}개</p>
        </div>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="반 이름 또는 교사 이름으로 검색"
        className="w-full px-4 py-3 bg-white/5 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-brand-500/50 placeholder:text-muted-foreground/50"
      />

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((cls, i) => {
          const stateInfo = STATE_STYLE[cls.seasonState];
          const isRunning = cls.seasonState === "running";
          return (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5 border border-border/50 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base">{cls.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{cls.teacher} 교사 · 톤레벨 {TONE_LABELS[cls.toneLevel]}</p>
                </div>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", stateInfo.color)}>
                  {stateInfo.label}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/5 rounded-xl p-2">
                  <p className="text-sm font-bold">{cls.students}</p>
                  <p className="text-[10px] text-muted-foreground">학생</p>
                </div>
                <div className="bg-white/5 rounded-xl p-2">
                  <p className="text-sm font-bold">{cls.groups}</p>
                  <p className="text-[10px] text-muted-foreground">조</p>
                </div>
                <div className={cn("bg-white/5 rounded-xl p-2")}>
                  <p className={cn("text-sm font-bold", isRunning ? (cls.avgReturn >= 0 ? "text-score-up" : "text-score-down") : "")}>
                    {isRunning ? `${cls.avgReturn >= 0 ? "+" : ""}${cls.avgReturn}%` : "-"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">평균 수익</p>
                </div>
              </div>

              {/* Class Code */}
              <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">클래스 코드</p>
                  <p className="font-mono font-bold text-sm tracking-widest">{cls.classCode}</p>
                </div>
                <button
                  onClick={() => copyCode(cls.classCode)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <CopyIcon className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Actions */}
              {cls.seasonState === "setup" && (
                <button className="w-full flex items-center justify-center gap-2 py-2 bg-brand-500/20 text-brand-300 rounded-xl text-sm font-bold hover:bg-brand-500/30 transition-colors">
                  <PlayIcon className="w-4 h-4" />
                  시즌 시작
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
