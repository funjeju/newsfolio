"use client";

import { useState } from "react";
import {
  UsersIcon, SearchIcon, TrophyIcon, TargetIcon,
  MessageSquareIcon, PieChartIcon, ZapIcon, StarIcon, ChevronDownIcon, ChevronUpIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as motion from "framer-motion/client";

interface StudentRecord {
  id: string;
  name: string;
  studentNumber: number;
  groupName: string;
  role: string;
  portfolio: { value: number; returnPercent: number; rank: number };
  metrics: {
    return: number;        // 0~100
    accuracy: number;      // 예측 적중률
    evidence: number;      // 증거 품질
    discussion: number;    // 토론 참여
    risk: number;          // 위험 관리
    activity: number;      // 활동률
  };
  streakDays: number;
  objectionsSubmitted: number;
  objectionsAccepted: number;
}

const MOCK_STUDENTS: StudentRecord[] = [
  {
    id: "s1", name: "김민준", studentNumber: 1, groupName: "슈퍼노바5조", role: "애널리스트",
    portfolio: { value: 12450000, returnPercent: 24.5, rank: 12 },
    metrics: { return: 75, accuracy: 80, evidence: 70, discussion: 60, risk: 65, activity: 90 },
    streakDays: 5, objectionsSubmitted: 3, objectionsAccepted: 2,
  },
  {
    id: "s2", name: "이수현", studentNumber: 2, groupName: "갤럭시1조", role: "리서처",
    portfolio: { value: 15200000, returnPercent: 52.0, rank: 1 },
    metrics: { return: 95, accuracy: 88, evidence: 85, discussion: 80, risk: 75, activity: 95 },
    streakDays: 12, objectionsSubmitted: 5, objectionsAccepted: 4,
  },
  {
    id: "s3", name: "박준서", studentNumber: 3, groupName: "갤럭시1조", role: "기자",
    portfolio: { value: 14800000, returnPercent: 48.0, rank: 2 },
    metrics: { return: 90, accuracy: 75, evidence: 82, discussion: 90, risk: 70, activity: 88 },
    streakDays: 7, objectionsSubmitted: 4, objectionsAccepted: 3,
  },
  {
    id: "s4", name: "최아린", studentNumber: 4, groupName: "오리온2조", role: "편집장",
    portfolio: { value: 14100000, returnPercent: 41.0, rank: 3 },
    metrics: { return: 85, accuracy: 72, evidence: 78, discussion: 85, risk: 80, activity: 92 },
    streakDays: 3, objectionsSubmitted: 2, objectionsAccepted: 1,
  },
];

const METRIC_LABELS: Record<string, string> = {
  return: "수익률", accuracy: "예측정확도", evidence: "증거품질",
  discussion: "토론참여", risk: "위험관리", activity: "활동률",
};

function MetricBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={cn(
          "h-full rounded-full transition-all",
          pct >= 80 ? "bg-score-up" : pct >= 60 ? "bg-brand-500" : pct >= 40 ? "bg-yellow-500" : "bg-score-down"
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function TeacherStudentsPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"rank" | "activity" | "name">("rank");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = MOCK_STUDENTS
    .filter(s => s.name.includes(search) || s.groupName.includes(search))
    .sort((a, b) => {
      if (sortBy === "rank") return a.portfolio.rank - b.portfolio.rank;
      if (sortBy === "activity") return b.metrics.activity - a.metrics.activity;
      return a.name.localeCompare(b.name, "ko");
    });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-brand-400" />
            학생 명단
          </h1>
          <p className="text-muted-foreground mt-1">전체 {MOCK_STUDENTS.length}명 · 6가지 평가 지표</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-slate-100/70 border border-border/50 rounded-xl px-3 py-2.5">
          <SearchIcon className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="이름 또는 조명으로 검색"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="flex gap-1 p-1 bg-slate-100/70 rounded-xl border border-border/50">
          {([["rank", "순위순"], ["activity", "활동순"], ["name", "이름순"]] as const).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setSortBy(v)}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-bold transition-all",
                sortBy === v ? "bg-brand-500 text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Student List */}
      <div className="space-y-2">
        {filtered.map((student, i) => {
          const avgMetric = Math.round(
            Object.values(student.metrics).reduce((a, b) => a + b, 0) / 6
          );
          const isExpanded = expandedId === student.id;

          return (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass rounded-2xl border border-border/50 overflow-hidden"
            >
              {/* Row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : student.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-100/70 transition-colors"
              >
                {/* Rank */}
                <div className="w-8 text-center font-bold text-lg flex-shrink-0">
                  {student.portfolio.rank === 1 ? "🥇" : student.portfolio.rank === 2 ? "🥈" : student.portfolio.rank === 3 ? "🥉" : (
                    <span className="text-muted-foreground text-base">{student.portfolio.rank}</span>
                  )}
                </div>

                {/* Name + Group */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold">{student.name}</span>
                    <span className="text-xs text-muted-foreground">{student.studentNumber}번</span>
                    <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{student.groupName}</span>
                    <span className="text-xs text-brand-400">{student.role}</span>
                  </div>
                  <div className="mt-1.5">
                    <MetricBar value={avgMetric} />
                  </div>
                </div>

                {/* Portfolio Value */}
                <div className="hidden sm:block text-right flex-shrink-0">
                  <div className="font-mono font-bold text-sm">₩{(student.portfolio.value / 10000).toFixed(0)}만</div>
                  <div className={cn("text-xs font-bold", student.portfolio.returnPercent > 0 ? "text-score-up" : "text-score-down")}>
                    {student.portfolio.returnPercent > 0 ? "+" : ""}{student.portfolio.returnPercent}%
                  </div>
                </div>

                {/* Activity */}
                <div className="hidden md:flex flex-col items-center gap-1 flex-shrink-0 w-16">
                  <div className="text-xs text-muted-foreground">활동률</div>
                  <div className={cn("font-bold text-sm", student.metrics.activity >= 80 ? "text-score-up" : "text-yellow-400")}>
                    {student.metrics.activity}%
                  </div>
                </div>

                {/* Streak */}
                {student.streakDays >= 3 && (
                  <span className="hidden sm:flex items-center gap-1 text-xs bg-orange-500/15 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                    🔥{student.streakDays}일
                  </span>
                )}

                {isExpanded ? (
                  <ChevronUpIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </button>

              {/* Expanded: 6 Metrics */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-border/50 p-4"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {Object.entries(student.metrics).map(([key, val]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{METRIC_LABELS[key]}</span>
                          <span className={cn(
                            "font-bold",
                            val >= 80 ? "text-score-up" : val >= 60 ? "text-brand-400" : val >= 40 ? "text-yellow-400" : "text-score-down"
                          )}>{val}</span>
                        </div>
                        <MetricBar value={val} />
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border/50 pt-3">
                    <span className="flex items-center gap-1.5">
                      <MessageSquareIcon className="w-3.5 h-3.5" />
                      이의제기 {student.objectionsAccepted}/{student.objectionsSubmitted}건 채택
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ZapIcon className="w-3.5 h-3.5 text-amber-400" />
                      연속 {student.streakDays}일
                    </span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground py-4">
        Firestore 연동 후 실시간 데이터로 표시됩니다
      </p>
    </div>
  );
}
