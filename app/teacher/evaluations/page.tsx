"use client";

import { useState } from "react";
import { BarChart2Icon, TrendingUpIcon, TargetIcon, UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const PERIODS = ["이번 주", "이번 달", "시즌 전체"];

const MOCK_WEEKLY = [
  { metric: "평균 수익률", value: "+3.2%", delta: "+0.8%", good: true },
  { metric: "이의제기 수", value: "14건", delta: "+5건", good: true },
  { metric: "평균 논리 품질", value: "72점", delta: "+4점", good: true },
  { metric: "포지션 변경", value: "8건", delta: "-2건", good: true },
  { metric: "조 활동 참여율", value: "91%", delta: "+3%", good: true },
];

const MOCK_STUDENTS_RADAR = [
  { name: "김민준", return: 85, accuracy: 72, evidence: 88, discussion: 65, risk: 70, activity: 95 },
  { name: "이서연", return: 92, accuracy: 88, evidence: 75, discussion: 90, risk: 80, activity: 100 },
  { name: "박지현", return: 68, accuracy: 65, evidence: 90, discussion: 78, risk: 55, activity: 85 },
  { name: "최도윤", return: 78, accuracy: 80, evidence: 70, discussion: 85, risk: 75, activity: 90 },
];

const METRICS = ["수익률", "정확도", "증거", "토론", "위험관리", "활동률"];
const METRIC_KEYS: (keyof typeof MOCK_STUDENTS_RADAR[0])[] = ["return", "accuracy", "evidence", "discussion", "risk", "activity"];
const METRIC_COLORS = ["text-brand-400", "text-emerald-400", "text-purple-400", "text-orange-400", "text-cyan-400", "text-pink-400"];

export default function TeacherEvaluationsPage() {
  const [activePeriod, setActivePeriod] = useState("이번 주");
  const [activeTab, setActiveTab] = useState<"overview" | "individual">("overview");

  return (
    <div className="space-y-6 pb-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">평가 현황</h1>
          <p className="text-muted-foreground mt-1">반 전체 및 개별 학생 성과 분석</p>
        </div>
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-border/50">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setActivePeriod(p)}
              className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-all", activePeriod === p ? "bg-brand-500 text-white" : "text-muted-foreground hover:text-foreground")}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {MOCK_WEEKLY.map(m => (
          <div key={m.metric} className="glass rounded-2xl p-4 border border-border/50 space-y-1">
            <div className="text-xs text-muted-foreground">{m.metric}</div>
            <div className="text-xl font-bold">{m.value}</div>
            <div className={cn("text-xs font-medium", m.good ? "text-emerald-400" : "text-red-400")}>
              {m.delta}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50">
        {[
          { id: "overview", label: "반 전체", icon: UsersIcon },
          { id: "individual", label: "개별 학생", icon: TargetIcon },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn("flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-colors text-sm", activeTab === tab.id ? "border-brand-500 text-brand-300" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          <div className="glass rounded-2xl p-6 border border-border/50">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BarChart2Icon className="w-5 h-5 text-brand-400" /> 6개 지표 반 평균
            </h3>
            <div className="space-y-4">
              {METRICS.map((metric, mi) => {
                const key = METRIC_KEYS[mi];
                const avg = Math.round(MOCK_STUDENTS_RADAR.reduce((sum, s) => sum + (s[key] as number), 0) / MOCK_STUDENTS_RADAR.length);
                return (
                  <div key={metric} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className={cn("font-medium", METRIC_COLORS[mi])}>{metric}</span>
                      <span className="font-bold">{avg}점</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all" style={{ width: `${avg}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Individual Tab */}
      {activeTab === "individual" && (
        <div className="space-y-4">
          {MOCK_STUDENTS_RADAR.map((student, si) => (
            <div key={si} className="glass rounded-2xl p-5 border border-border/50">
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold text-lg">{student.name}</div>
                <div className="text-sm text-muted-foreground">
                  종합 <span className="font-bold text-foreground">
                    {Math.round(METRIC_KEYS.reduce((sum, k) => sum + (student[k] as number), 0) / METRIC_KEYS.length)}점
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {METRICS.map((metric, mi) => {
                  const val = student[METRIC_KEYS[mi]] as number;
                  return (
                    <div key={metric} className="text-center">
                      <div className="relative w-12 h-12 mx-auto mb-1">
                        <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                          <circle cx="18" cy="18" r="15.9155" fill="none" stroke="currentColor"
                            strokeWidth="3" strokeDasharray={`${val} 100`}
                            className={METRIC_COLORS[mi]}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{val}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">{metric}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
