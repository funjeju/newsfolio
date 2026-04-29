"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckIcon, XIcon, ClockIcon, ChevronDownIcon, ChevronUpIcon,
  LinkIcon, TrendingUpIcon, SparklesIcon, AlertCircleIcon, RefreshCwIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { toast } from "sonner";
import { usePendingObjections, reviewObjection } from "@/lib/hooks/useObjections";
import { usePendingTransactions, reviewTransaction } from "@/lib/hooks/usePendingTransactions";
import { useUser } from "@/lib/hooks/useUser";
import type { ApprovalStatus } from "@/types/schema";

const SECTOR_NAMES: Record<string, string> = {
  semiconductor: "💻 반도체", automotive: "🚗 자동차", game: "🎮 게임",
  content: "🎬 콘텐츠", travel: "✈️ 여행", green_energy: "🌱 친환경에너지",
  food: "🍔 식품", construction: "🏗️ 건설", geopolitics: "🌐 국제정세", global_trade: "🚢 글로벌무역",
};

export default function TeacherApprovalsPage() {
  const { user } = useUser();
  const classId = user?.teachingClassIds?.[0] ?? null;
  const { objections, isLoading } = usePendingObjections(classId);
  const { transactions, isLoading: txLoading } = usePendingTransactions(classId);
  const [txComments, setTxComments] = useState<Record<string, string>>({});
  const [txSubmitting, setTxSubmitting] = useState<Record<string, boolean>>({});

  const handleTxDecision = async (txId: string, decision: "approved" | "rejected") => {
    if (!user?.id) return;
    setTxSubmitting(prev => ({ ...prev, [txId]: true }));
    try {
      await reviewTransaction(txId, decision, user.id, txComments[txId] ?? "");
      toast.success(decision === "approved" ? "포지션 변경이 승인됐어요." : "포지션 변경이 거부됐어요.");
    } catch (err: any) {
      toast.error(err.message || "처리에 실패했어요.");
    } finally {
      setTxSubmitting(prev => ({ ...prev, [txId]: false }));
    }
  };

  const [activeTab, setActiveTab] = useState<"objections" | "transactions" | "domains">("objections");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewScores, setReviewScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});

  const handleDecision = async (objectionId: string, decision: ApprovalStatus) => {
    if (!user?.id) return;
    setSubmitting(prev => ({ ...prev, [objectionId]: true }));
    try {
      await reviewObjection(
        objectionId,
        decision,
        reviewScores[objectionId],
        comments[objectionId] ?? "",
        user.id
      );
      const label = decision === "accepted" ? "수용" : decision === "partial" ? "부분수용" : "거부";
      toast.success(`이의제기가 ${label}됐어요.`);
      setExpandedId(null);
    } catch (err: any) {
      toast.error(err.message || "처리에 실패했어요.");
    } finally {
      setSubmitting(prev => ({ ...prev, [objectionId]: false }));
    }
  };

  return (
    <div className="space-y-6 pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">컨펌 큐</h1>
          <p className="text-muted-foreground mt-1">
            {isLoading ? "로딩 중..." : (
              <><span className="font-bold text-foreground">{objections.length}건</span> 검토 대기 중</>
            )}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-rose-500/10 text-rose-400 border border-rose-500/30 px-5 py-2.5 rounded-xl font-bold hover:bg-rose-500/20 transition-colors">
          <ClockIcon className="w-4 h-4" />
          오늘의 장 수동 마감
        </button>
      </div>

      {/* Daily Summary */}
      <div className="glass p-5 rounded-2xl border border-border/50">
        <div className="flex items-center gap-2 mb-3 font-semibold">
          <SparklesIcon className="w-5 h-5 text-brand-400" />
          오늘 종합 현황
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white/5 rounded-xl p-3">
            <div className="text-2xl font-bold text-brand-400">{objections.length}</div>
            <div className="text-xs text-muted-foreground mt-1">이의제기 대기</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <div className="text-2xl font-bold text-emerald-400">
              {isLoading ? "-" : 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">오늘 처리 완료</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3">
            <div className="text-2xl font-bold text-orange-400">{transactions.length}</div>
            <div className="text-xs text-muted-foreground mt-1">포지션 변경</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50">
        {[
          { id: "objections", label: `이의제기 (${objections.length})` },
          { id: "transactions", label: `포지션 변경 (${transactions.length})` },
          { id: "domains", label: "도메인 요청 (0)" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-4 py-3 font-semibold border-b-2 transition-colors text-sm",
              activeTab === tab.id ? "border-brand-500 text-brand-300" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Objections Tab */}
      {activeTab === "objections" && (
        <div className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-3">
              <RefreshCwIcon className="w-5 h-5 animate-spin" />
              이의제기를 불러오는 중...
            </div>
          )}

          {!isLoading && objections.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <CheckIcon className="w-12 h-12 mx-auto mb-3 text-emerald-400/50" />
              <p className="font-semibold">검토할 이의제기가 없어요</p>
              <p className="text-sm mt-1">오늘은 모두 처리됐거나 제출이 없었어요!</p>
            </div>
          )}

          {objections.map((obj, i) => {
            const isExpanded = expandedId === obj.id;
            const isSubmittingThis = submitting[obj.id];
            const scoreInput = reviewScores[obj.id] ?? obj.proposedScore;

            return (
              <motion.div
                key={obj.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl border border-border/50 overflow-hidden"
              >
                {/* Row header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : obj.id)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2 font-bold">
                        섹터 ID: {obj.sectorId}
                        <span className="text-sm text-muted-foreground font-normal">· {obj.studentId}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <ScoreBadge score={obj.aiOriginalScore} />
                        <span className="text-muted-foreground">→</span>
                        <ScoreBadge score={obj.proposedScore} />
                        <span className="text-xs text-muted-foreground">
                          ({obj.proposedScore - obj.aiOriginalScore > 0 ? "+" : ""}{obj.proposedScore - obj.aiOriginalScore})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {obj.sourceNewsIds.length}개 출처
                    </span>
                    {isExpanded ? <ChevronUpIcon className="w-5 h-5 text-muted-foreground" /> : <ChevronDownIcon className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </button>

                {/* Expanded */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border/50 overflow-hidden"
                    >
                      <div className="p-5 space-y-5">
                        {/* Logic */}
                        <div>
                          <h4 className="text-sm font-semibold mb-2">학생 논리</h4>
                          <div className="space-y-2 text-sm text-muted-foreground bg-white/5 rounded-xl p-4">
                            {obj.logic.why && <p><span className="font-semibold text-foreground">왜?</span> {obj.logic.why}</p>}
                            {obj.logic.keyEvidence && <p><span className="font-semibold text-foreground">핵심 근거:</span> {obj.logic.keyEvidence}</p>}
                            {obj.logic.counterAcknowledgment && <p><span className="font-semibold text-foreground">반대 인정:</span> {obj.logic.counterAcknowledgment}</p>}
                          </div>
                        </div>

                        {/* AI validation */}
                        {obj.aiValidation && (
                          <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-brand-300">
                              <SparklesIcon className="w-4 h-4" /> AI 논리 검증 결과
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                              <span>구조 완결성: <b className="text-foreground">{(obj.aiValidation.structuralCompleteness * 100).toFixed(0)}점</b></span>
                              <span>증거 강도: <b className="text-foreground">{(obj.aiValidation.evidenceStrength * 100).toFixed(0)}점</b></span>
                              <span>논리 일관성: <b className="text-foreground">{(obj.aiValidation.logicalCoherence * 100).toFixed(0)}점</b></span>
                              <span>종합 품질: <b className="text-foreground">{(obj.aiValidation.overallQuality * 100).toFixed(0)}점</b></span>
                            </div>
                            {obj.aiValidation.summaryForTeacher && (
                              <p className="text-xs text-muted-foreground border-t border-border/30 pt-2">{obj.aiValidation.summaryForTeacher}</p>
                            )}
                          </div>
                        )}

                        {/* Score override */}
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">최종 확정 점수 (선택 사항)</label>
                          <div className="flex items-center gap-4">
                            <input
                              type="range" min={-5} max={5} step={1}
                              value={scoreInput}
                              onChange={e => setReviewScores(prev => ({ ...prev, [obj.id]: parseInt(e.target.value) }))}
                              className="flex-1 accent-brand-500"
                            />
                            <ScoreBadge score={scoreInput} />
                          </div>
                        </div>

                        {/* Comment */}
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">코멘트 (학생에게 전달)</label>
                          <textarea
                            value={comments[obj.id] ?? ""}
                            onChange={e => setComments(prev => ({ ...prev, [obj.id]: e.target.value }))}
                            rows={2}
                            placeholder="학생에게 전달할 피드백..."
                            className="w-full p-3 bg-white/5 border border-border/50 rounded-xl text-sm resize-none focus:outline-none focus:border-brand-500/50 placeholder:text-muted-foreground/50"
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleDecision(obj.id, "accepted")}
                            disabled={isSubmittingThis}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                          >
                            <CheckIcon className="w-4 h-4" />
                            수용
                          </button>
                          <button
                            onClick={() => handleDecision(obj.id, "partial")}
                            disabled={isSubmittingThis}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-xl font-bold hover:bg-yellow-500/20 transition-colors disabled:opacity-50"
                          >
                            부분수용
                          </button>
                          <button
                            onClick={() => handleDecision(obj.id, "rejected")}
                            disabled={isSubmittingThis}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                          >
                            <XIcon className="w-4 h-4" />
                            거부
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <div className="space-y-4">
          {txLoading ? (
            <div className="glass p-8 text-center text-muted-foreground rounded-2xl animate-pulse">로딩 중...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <AlertCircleIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">대기 중인 포지션 변경 요청이 없어요</p>
            </div>
          ) : (
            transactions.map(tx => {
              const isSubmittingThis = txSubmitting[tx.id] ?? false;
              const date = tx.createdAt
                ? new Date((tx.createdAt as any).seconds * 1000).toLocaleDateString("ko-KR")
                : "-";
              return (
                <div key={tx.id} className="glass rounded-2xl p-5 border border-border/50 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">포지션 변경 요청</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{date}</p>
                    </div>
                    <span className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5" /> 검토 대기
                    </span>
                  </div>
                  {/* Before → After */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-2">변경 전</p>
                      {tx.before.map(a => (
                        <div key={a.sectorId} className="flex justify-between">
                          <span className="text-muted-foreground">{SECTOR_NAMES[a.sectorId] ?? a.sectorId}</span>
                          <span>{Math.round(a.weight * 100)}%</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-brand-500/10 rounded-xl p-3 border border-brand-500/20">
                      <p className="text-xs text-muted-foreground mb-2">변경 후</p>
                      {tx.after.map(a => (
                        <div key={a.sectorId} className="flex justify-between">
                          <span className="text-muted-foreground">{SECTOR_NAMES[a.sectorId] ?? a.sectorId}</span>
                          <span className="text-brand-300 font-semibold">{Math.round(a.weight * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {tx.rationale && (
                    <p className="text-sm text-muted-foreground bg-white/5 rounded-xl p-3 italic">
                      "{tx.rationale}"
                    </p>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">코멘트 (선택 사항)</label>
                    <textarea
                      value={txComments[tx.id] ?? ""}
                      onChange={e => setTxComments(prev => ({ ...prev, [tx.id]: e.target.value }))}
                      rows={2}
                      placeholder="학생에게 전달할 피드백..."
                      className="w-full p-3 bg-white/5 border border-border/50 rounded-xl text-sm resize-none focus:outline-none focus:border-brand-500/50 placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleTxDecision(tx.id, "approved")}
                      disabled={isSubmittingThis}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold hover:bg-emerald-500/30 transition-colors disabled:opacity-50"
                    >
                      <CheckIcon className="w-4 h-4" /> 승인
                    </button>
                    <button
                      onClick={() => handleTxDecision(tx.id, "rejected")}
                      disabled={isSubmittingThis}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      <XIcon className="w-4 h-4" /> 거부
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Domains Tab */}
      {activeTab === "domains" && (
        <div className="text-center py-16 text-muted-foreground">
          <AlertCircleIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>도메인 요청 컨펌은 곧 지원돼요</p>
        </div>
      )}
    </div>
  );
}
