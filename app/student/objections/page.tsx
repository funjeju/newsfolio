"use client";

import * as motion from "framer-motion/client";
import {
  MessageSquarePlusIcon, CheckCircle2Icon, XCircleIcon,
  ClockIcon, ChevronRightIcon, PlusIcon, SparklesIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useUser } from "@/lib/hooks/useUser";
import { useMyObjections } from "@/lib/hooks/useObjections";

const STATUS_STYLE = {
  pending:  { label: "검토 중",   color: "text-yellow-400 bg-yellow-500/10", icon: ClockIcon },
  approved: { label: "승인됨",    color: "text-score-up bg-score-up/10",     icon: CheckCircle2Icon },
  rejected: { label: "거절됨",    color: "text-score-down bg-score-down/10", icon: XCircleIcon },
  auto_approved: { label: "AI 자동 승인", color: "text-brand-300 bg-brand-500/10", icon: SparklesIcon },
  auto_rejected: { label: "AI 자동 거절", color: "text-red-400 bg-red-500/10", icon: XCircleIcon },
};

const SECTOR_NAMES: Record<string, string> = {
  semiconductor: "💻 반도체",
  automotive:    "🚗 자동차",
  game:          "🎮 게임",
  content:       "🎬 콘텐츠",
  travel:        "✈️ 여행",
  green_energy:  "🌱 친환경에너지",
  food:          "🍔 식품",
  construction:  "🏗️ 건설",
  geopolitics:   "🌐 국제정세",
  global_trade:  "🚢 글로벌무역",
};

// Static mock for when no real data
const MOCK_OBJECTIONS = [
  {
    id: "obj1",
    briefingDateRef: "2026-04-28",
    sectorId: "semiconductor",
    aiOriginalScore: 3,
    proposedScore: 5,
    status: "approved",
    logic: {
      why: "HBM 수요 급증과 규제 완화가 동시에 발생해 AI 점수가 과소평가됐다고 생각해요.",
      keyEvidence: "삼성전자 HBM3E 수주 뉴스 + 미국 BIS 규정 완화 공식 발표",
      counterAcknowledgment: "중국 보복 관세 가능성은 인정하지만 단기 영향은 제한적이에요.",
    },
    aiValidation: { overallQuality: 4.2, feedbackForStudent: "근거가 명확하고 반론도 잘 인식했어요!" },
    reviewedScore: 5,
    teacherComment: "훌륭한 분석입니다. 근거 제시가 매우 탄탄했어요.",
    createdAt: { seconds: 1745769600 },
  },
  {
    id: "obj2",
    briefingDateRef: "2026-04-27",
    sectorId: "game",
    aiOriginalScore: 2,
    proposedScore: 4,
    status: "pending",
    logic: {
      why: "대형 신작의 흥행이 단순 호재가 아니라 메타버스 플랫폼 전략과 연결되어 있어요.",
      keyEvidence: "엔씨소프트 TL 글로벌 런칭 + 스팀 차트 1위 뉴스",
      counterAcknowledgment: "모바일 게임 시장 둔화는 위험 요인이에요.",
    },
    aiValidation: { overallQuality: 3.8, feedbackForStudent: "주장이 일관적이에요. 데이터 근거를 더 보강하면 좋겠어요." },
    reviewedScore: undefined,
    teacherComment: undefined,
    createdAt: { seconds: 1745683200 },
  },
];

export default function StudentObjectionsPage() {
  const { user } = useUser();
  const { objections: realObjections, isLoading } = useMyObjections(user?.id);
  const objections = realObjections.length > 0 ? realObjections : (isLoading ? [] : MOCK_OBJECTIONS as any[]);

  const approvedCount = objections.filter(o => o.status === "approved" || o.status === "auto_approved").length;
  const pendingCount = objections.filter(o => o.status === "pending").length;

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-bold mb-3 border border-brand-500/30">
            <MessageSquarePlusIcon className="w-3.5 h-3.5" />
            내 이의제기
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">이의제기 내역</h1>
        </div>
        <Link
          href="/student/objections/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-bold hover:bg-brand-600 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          새 이의제기
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass p-4 text-center">
          <p className="text-2xl font-bold">{objections.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">전체</p>
        </div>
        <div className="glass p-4 text-center">
          <p className="text-2xl font-bold text-score-up">{approvedCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">승인됨</p>
        </div>
        <div className="glass p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
          <p className="text-xs text-muted-foreground mt-0.5">검토 중</p>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="glass rounded-2xl p-5 animate-pulse border border-border/30 h-32" />
          ))}
        </div>
      ) : objections.length === 0 ? (
        <div className="glass p-10 text-center text-muted-foreground rounded-2xl">
          <MessageSquarePlusIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">이의제기 내역이 없어요</p>
          <p className="text-sm mt-1">AI 분석에 동의하지 않으면 이의를 제기해보세요!</p>
          <Link
            href="/student/objections/new"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-bold hover:bg-brand-600 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            첫 이의제기 작성하기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {objections.map((obj, index) => {
            const status = STATUS_STYLE[obj.status as keyof typeof STATUS_STYLE] ?? STATUS_STYLE.pending;
            const StatusIcon = status.icon;
            const date = obj.createdAt?.seconds
              ? new Date(obj.createdAt.seconds * 1000).toLocaleDateString("ko-KR")
              : obj.briefingDateRef;
            const scoreDelta = obj.proposedScore - obj.aiOriginalScore;

            return (
              <motion.div
                key={obj.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-2xl border border-border/50 p-5 space-y-3"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold">{SECTOR_NAMES[obj.sectorId] ?? obj.sectorId}</span>
                    <span className="text-xs text-muted-foreground">{date}</span>
                  </div>
                  <span className={cn("flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full", status.color)}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                  </span>
                </div>

                {/* Score change */}
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">AI 점수</span>
                    <span className="font-mono font-bold text-base">{obj.aiOriginalScore > 0 ? "+" : ""}{obj.aiOriginalScore}</span>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">내 제안</span>
                    <span className={cn("font-mono font-bold text-base", scoreDelta > 0 ? "text-score-up" : scoreDelta < 0 ? "text-score-down" : "")}>
                      {obj.proposedScore > 0 ? "+" : ""}{obj.proposedScore}
                    </span>
                    <span className={cn("text-xs", scoreDelta > 0 ? "text-score-up" : "text-score-down")}>
                      ({scoreDelta > 0 ? "+" : ""}{scoreDelta})
                    </span>
                  </div>
                  {obj.reviewedScore !== undefined && (
                    <>
                      <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">최종</span>
                        <span className="font-mono font-bold text-base text-brand-300">
                          {obj.reviewedScore > 0 ? "+" : ""}{obj.reviewedScore}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Logic summary */}
                <p className="text-sm text-muted-foreground bg-slate-100/70 rounded-xl p-3 leading-relaxed line-clamp-2">
                  {obj.logic?.why}
                </p>

                {/* AI Validation feedback */}
                {obj.aiValidation && (
                  <div className="flex items-start gap-2 text-xs bg-brand-500/10 rounded-xl p-3">
                    <SparklesIcon className="w-3.5 h-3.5 text-brand-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-brand-300">AI 평가 {obj.aiValidation.overallQuality}/5</span>
                      <span className="text-muted-foreground ml-2">{obj.aiValidation.feedbackForStudent}</span>
                    </div>
                  </div>
                )}

                {/* Teacher comment */}
                {obj.teacherComment && (
                  <div className="text-xs text-yellow-300 bg-yellow-500/10 rounded-xl p-3">
                    👨‍🏫 선생님: {obj.teacherComment}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
