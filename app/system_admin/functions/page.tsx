"use client";

import * as motion from "framer-motion/client";
import {
  ServerIcon, CheckCircle2Icon, AlertCircleIcon, XCircleIcon,
  ClockIcon, RefreshCwIcon, ZapIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type FnStatus = "ok" | "warning" | "error";

interface CloudFunction {
  id: string;
  name: string;
  schedule: string;
  lastRun: string;
  lastDuration: number;
  status: FnStatus;
  successRate: number;
  lastError?: string;
}

const MOCK_FUNCTIONS: CloudFunction[] = [
  { id: "f1", name: "calcImpactScores",    schedule: "매일 06:00 KST", lastRun: "2026-04-29 06:00", lastDuration: 320,  status: "ok",      successRate: 100 },
  { id: "f2", name: "generateBriefings",   schedule: "매일 06:15 KST", lastRun: "2026-04-29 06:15", lastDuration: 870,  status: "ok",      successRate: 98.5 },
  { id: "f3", name: "publishCardNews",     schedule: "매일 07:00 KST", lastRun: "2026-04-29 07:02", lastDuration: 1540, status: "ok",      successRate: 97.2 },
  { id: "f4", name: "calcPortfolioValues", schedule: "매일 16:30 KST", lastRun: "2026-04-29 16:32", lastDuration: 620,  status: "ok",      successRate: 100 },
  { id: "f5", name: "announceBestAnalyst", schedule: "매일 17:30 KST", lastRun: "2026-04-29 17:31", lastDuration: 0,    status: "error",   successRate: 72.0, lastError: "Gemini API rate limit exceeded" },
  { id: "f6", name: "onObjectionCreated",  schedule: "트리거 (Firestore)", lastRun: "2026-04-29 09:32", lastDuration: 480, status: "warning", successRate: 95.0, lastError: "지연 경고: 450ms" },
  { id: "f7", name: "onBriefingApproved",  schedule: "트리거 (Firestore)", lastRun: "2026-04-29 06:12", lastDuration: 290,  status: "ok",      successRate: 100 },
  { id: "f8", name: "issueWeeklyAwards",   schedule: "매주 금요일 17:00 KST", lastRun: "2026-04-25 17:00", lastDuration: 1100, status: "ok",   successRate: 100 },
  { id: "f9", name: "validateSource",      schedule: "callable",         lastRun: "2026-04-29 14:55", lastDuration: 210,  status: "ok",      successRate: 99.1 },
  { id: "fa", name: "calcMonthlyRankings", schedule: "매월 말일",        lastRun: "2026-03-31 16:00", lastDuration: 980,  status: "ok",      successRate: 100 },
];

const STATUS_ICON = {
  ok:      CheckCircle2Icon,
  warning: AlertCircleIcon,
  error:   XCircleIcon,
};

const STATUS_COLOR = {
  ok:      "text-score-up",
  warning: "text-yellow-400",
  error:   "text-score-down",
};

const STATUS_BG = {
  ok:      "bg-score-up/10",
  warning: "bg-yellow-500/10",
  error:   "bg-score-down/10",
};

export default function SystemAdminFunctionsPage() {
  const okCount = MOCK_FUNCTIONS.filter(f => f.status === "ok").length;
  const warnCount = MOCK_FUNCTIONS.filter(f => f.status === "warning").length;
  const errCount = MOCK_FUNCTIONS.filter(f => f.status === "error").length;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-300 text-xs font-bold mb-3 border border-red-500/30">
            <ServerIcon className="w-3.5 h-3.5" />
            함수 모니터
          </div>
          <h1 className="text-2xl font-display font-bold">Cloud Functions 모니터</h1>
          <p className="text-sm text-muted-foreground mt-1">
            총 {MOCK_FUNCTIONS.length}개 함수 ·
            <span className="text-score-up"> 정상 {okCount}</span> ·
            <span className="text-yellow-400"> 경고 {warnCount}</span> ·
            <span className="text-score-down"> 오류 {errCount}</span>
          </p>
        </div>
        <button
          onClick={() => toast.success("함수 상태 새로고침됐어요.")}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100/70 border border-border/50 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors"
        >
          <RefreshCwIcon className="w-4 h-4" />
          새로고침
        </button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "정상", count: okCount,   color: "text-score-up border-score-up/20 bg-score-up/5" },
          { label: "경고", count: warnCount, color: "text-yellow-400 border-yellow-500/20 bg-yellow-500/5" },
          { label: "오류", count: errCount,  color: "text-score-down border-score-down/20 bg-score-down/5" },
        ].map(({ label, count, color }) => (
          <div key={label} className={cn("glass p-4 rounded-2xl border text-center", color)}>
            <p className="text-3xl font-display font-bold">{count}</p>
            <p className="text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Function List */}
      <div className="space-y-3">
        {MOCK_FUNCTIONS.map((fn, i) => {
          const StatusIcon = STATUS_ICON[fn.status];
          return (
            <motion.div
              key={fn.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn("glass rounded-2xl p-4 border", fn.status !== "ok" ? `border-${fn.status === "error" ? "score-down" : "yellow"}-500/30` : "border-border/50")}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", STATUS_BG[fn.status])}>
                    <StatusIcon className={cn("w-4 h-4", STATUS_COLOR[fn.status])} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono font-bold text-sm">{fn.name}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><ZapIcon className="w-3 h-3" /> {fn.schedule}</span>
                      <span className="flex items-center gap-1"><ClockIcon className="w-3 h-3" /> {fn.lastRun}</span>
                    </div>
                    {fn.lastError && (
                      <p className={cn("text-xs mt-1 font-medium", STATUS_COLOR[fn.status])}>{fn.lastError}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground">성공률</p>
                    <p className={cn("text-sm font-bold", fn.successRate >= 98 ? "text-score-up" : fn.successRate >= 90 ? "text-yellow-400" : "text-score-down")}>
                      {fn.successRate}%
                    </p>
                  </div>
                  {fn.lastDuration > 0 && (
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-muted-foreground">실행 시간</p>
                      <p className="text-sm font-bold">{fn.lastDuration}ms</p>
                    </div>
                  )}
                  {fn.status === "error" && (
                    <button
                      onClick={() => toast.success(`${fn.name} 재실행 요청됐어요.`)}
                      className="px-3 py-1.5 text-xs bg-score-down/10 text-score-down hover:bg-score-down/20 rounded-lg transition-colors font-semibold"
                    >
                      재실행
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
