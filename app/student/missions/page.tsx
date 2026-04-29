"use client";

import { cn } from "@/lib/utils";
import { TargetIcon, CheckCircleIcon, CircleIcon, LockIcon } from "lucide-react";
import * as motion from "framer-motion/client";

type MissionStatus = "completed" | "in_progress" | "locked";

interface Mission {
  id: string;
  emoji: string;
  title: string;
  description: string;
  status: MissionStatus;
  progress?: number;
  total?: number;
  rewardBadge?: string;
}

const MOCK_MISSIONS: Mission[] = [
  {
    id: "m1", emoji: "📰", title: "첫 뉴스 확인",
    description: "오늘의 브리핑을 처음으로 확인하세요",
    status: "completed", rewardBadge: "🚀",
  },
  {
    id: "m2", emoji: "🔍", title: "이의제기 마스터",
    description: "이의제기를 3번 제출하세요",
    status: "in_progress", progress: 1, total: 3, rewardBadge: "🎯",
  },
  {
    id: "m3", emoji: "📊", title: "포트폴리오 조정가",
    description: "포트폴리오 비중을 5번 변경하세요",
    status: "in_progress", progress: 2, total: 5, rewardBadge: "💼",
  },
  {
    id: "m4", emoji: "🔥", title: "연속 적중 챌린지",
    description: "7일 연속으로 섹터 예측을 적중시키세요",
    status: "in_progress", progress: 5, total: 7, rewardBadge: "🔥",
  },
  {
    id: "m5", emoji: "🏆", title: "주간 TOP 3",
    description: "주간 랭킹 3위 안에 들어보세요",
    status: "locked", rewardBadge: "👑",
  },
  {
    id: "m6", emoji: "🌐", title: "섹터 탐험가",
    description: "10개 모든 섹터를 클릭해서 확인하세요",
    status: "locked", rewardBadge: "🌐",
  },
];

const statusConfig = {
  completed: { label: "완료", color: "text-score-up", bg: "bg-score-up/10 border-score-up/30", icon: CheckCircleIcon },
  in_progress: { label: "진행 중", color: "text-brand-400", bg: "bg-brand-500/10 border-brand-500/30", icon: TargetIcon },
  locked: { label: "잠김", color: "text-muted-foreground", bg: "bg-white/5 border-border/30", icon: LockIcon },
};

export default function MissionsPage() {
  const completedCount = MOCK_MISSIONS.filter(m => m.status === "completed").length;

  return (
    <main className="max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <TargetIcon className="w-7 h-7 text-brand-400" />
        <h1 className="text-2xl font-display font-bold">미션</h1>
        <span className="text-sm text-muted-foreground ml-1">
          {completedCount}/{MOCK_MISSIONS.length} 완료
        </span>
      </div>

      {/* Progress Bar */}
      <div className="glass p-4 rounded-2xl border border-border/50 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">전체 진행률</span>
          <span className="text-brand-400 font-bold">{Math.round((completedCount / MOCK_MISSIONS.length) * 100)}%</span>
        </div>
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all"
            style={{ width: `${(completedCount / MOCK_MISSIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Mission List */}
      <div className="space-y-3">
        {MOCK_MISSIONS.map((mission, index) => {
          const config = statusConfig[mission.status];
          const Icon = config.icon;

          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className={cn(
                "glass p-4 rounded-2xl border flex items-start gap-4",
                config.bg,
                mission.status === "locked" && "opacity-60"
              )}
            >
              <div className="text-3xl flex-shrink-0 mt-0.5">{mission.emoji}</div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold">{mission.title}</span>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full border", config.bg, config.color)}>
                    {config.label}
                  </span>
                  {mission.rewardBadge && (
                    <span className="text-sm" title="보상 뱃지">{mission.rewardBadge}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{mission.description}</p>

                {mission.status === "in_progress" && mission.progress !== undefined && mission.total !== undefined && (
                  <div className="space-y-1">
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all"
                        style={{ width: `${(mission.progress / mission.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-brand-400 font-medium">{mission.progress}/{mission.total}</span>
                  </div>
                )}
              </div>

              <div className="flex-shrink-0">
                <Icon className={cn("w-5 h-5", config.color)} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}
