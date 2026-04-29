"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckIcon, XIcon, ClockIcon, ChevronDownIcon, ChevronUpIcon,
  SparklesIcon, AlertCircleIcon, RefreshCwIcon, ZapIcon,
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

  const totalPending = objections.length + transactions.length;

  return (
    <div className="space-y-6 pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="text-sm text-muted-foreground mb-1">교사 대시보드</div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-2">
            컨펌 큐
            {totalPending > 0 && (
              <span className="text-lg font-bold bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">
                {totalPending}건 대기
              </span>
            )}
          </h1>
        </div>
        <button className="flex items-center gap-2 bg-rose-50 text-rose-600 border border-rose-200 px-5 py-2.5 rounded-xl font-bold hover:bg-rose-100 transition-colors">
          <ClockIcon className="w-4 h-4" />
          오늘의 장 수동 마감
        </button>
      </div>

      {/* Daily Summary */}
      <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-4 font-bold text-slate-700">
          <ZapIcon className="w-5 h-5 text-amber-500" />
          오늘 종합 현황
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <div className="text-2xl font-bold text-amber-600">{isLoading ? "-" : objections.length}</div>
            <div className="text-xs text-slate-500 mt-1">이의제기 대기</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <div className="text-2xl font-bold text-emerald-600">0</div>
            <div className="text-xs text-slate-500 mt-1">오늘 처리 완료</div>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <div className="text-2xl font-bold text-indigo-600">{txLoading ? "-" : transactions.length}</div>
            <div className="text-xs text-slate-500 mt-1">포지션 변경</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {[
          { id: "objections", label: `이의제기`, count: objections.length },
          { id: "transactions", label: `포지션 변경`, count: transactions.length },
          { id: "domains", label: "도메인 요청", count: 0 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all",
              activeTab === tab.id
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-full font-bold",
                activeTab === tab.id ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-600"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Objections Tab */}
      {activeTab === "objections" && (
        <div className="space-y-3">
          {isLoading && (
            <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
              <RefreshCwIcon className="w-5 h-5 animate-spin" />
              이의제기를 불러오는 중...
            </div>
          )}

          {!isLoading && objections.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <CheckIcon className="w-14 h-14 mx-auto mb-3 text-emerald-300" />
              <p className="font-bold text-slate-600">검토할 이의제기가 없어요</p>
              <p className="text-sm mt-1 text-slate-400">오늘은 모두 처리됐거나 제출이 없었어요!</p>
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
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Row header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : obj.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2 font-bold text-slate-800">
                        {SECTOR_NAMES[obj.sectorId] ?? obj.sectorId}
                        <span className="text-sm text-slate-400 font-normal">· {obj.studentId}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <ScoreBadge score={obj.aiOriginalScore} />
                        <span className="text-slate-400 text-sm">→</span>
                        <ScoreBadge score={obj.proposedScore} />
                        <span className="text-xs text-slate-400">
                          ({obj.proposedScore - obj.aiOriginalScore > 0 ? "+" : ""}{obj.proposedScore - obj.aiOriginalScore})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 hidden sm:block">
                      출처 {obj.sourceNewsIds.length}개
                    </span>
                    {isExpanded
                      ? <ChevronUpIcon className="w-5 h-5 text-slate-400" />
                      : <ChevronDownIcon className="w-5 h-5 text-slate-300" />
                    }
                  </div>
                </button>

                {/* Expanded */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 overflow-hidden"
                    >
                      <div className="p-5 space-y-5 bg-slate-50/50">
                        {/* Logic */}
                        <div>
                          <h4 className="text-sm font-bold text-slate-700 mb-2">학생 논리</h4>
                          <div className="space-y-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl p-4">
                            {obj.logic.why && <p><span className="font-semibold text-slate-800">왜?</span> {obj.logic.why}</p>}
                            {obj.logic.keyEvidence && <p><span className="font-semibold text-slate-800">핵심 근거:</span> {obj.logic.keyEvidence}</p>}
                            {obj.logic.counterAcknowledgment && <p><span className="font-semibold text-slate-800">반대 인정:</span> {obj.logic.counterAcknowledgment}</p>}
                          </div>
                        </div>

                        {/* AI validation */}
                        {obj.aiValidation && (
                          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-bold text-indigo-700">
                              <SparklesIcon className="w-4 h-4" /> AI 논리 검증 결과
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                              <span>구조 완결성: <b className="text-slate-700">{(obj.aiValidation.structuralCompleteness * 100).toFixed(0)}점</b></span>
                              <span>증거 강도: <b className="text-slate-700">{(obj.aiValidation.evidenceStrength * 100).toFixed(0)}점</b></span>
                              <span>논리 일관성: <b className="text-slate-700">{(obj.aiValidation.logicalCoherence * 100).toFixed(0)}점</b></span>
                              <span>종합 품질: <b className="text-slate-700">{(obj.aiValidation.overallQuality * 100).toFixed(0)}점</b></span>
                            </div>
                            {obj.aiValidation.summaryForTeacher && (
                              <p className="text-xs text-indigo-700 border-t border-indigo-200 pt-2">{obj.aiValidation.summaryForTeacher}</p>
                            )}
                          </div>
                        )}

                        {/* Score override */}
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">최종 확정 점수 (선택 사항)</label>
                          <div className="flex items-center gap-4">
                            <input
                              type="range" min={-5} max={5} step={1}
                              value={scoreInput}
                              onChange={e => setReviewScores(prev => ({ ...prev, [obj.id]: parseInt(e.target.value) }))}
                              className="flex-1 accent-indigo-600"
                            />
                            <ScoreBadge score={scoreInput} />
                          </div>
                        </div>

                        {/* Comment */}
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700">코멘트 (학생에게 전달)</label>
                          <textarea
                            value={comments[obj.id] ?? ""}
                            onChange={e => setComments(prev => ({ ...prev, [obj.id]: e.target.value }))}
                            rows={2}
                            placeholder="학생에게 전달할 피드백..."
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-indigo-400 placeholder:text-slate-300"
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDecision(obj.id, "accepted")}
                            disabled={isSubmittingThis}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                          >
                            <CheckIcon className="w-4 h-4" />
                            수용
                          </button>
                          <button
                            onClick={() => handleDecision(obj.id, "partial")}
                            disabled={isSubmittingThis}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl font-bold hover:bg-amber-100 transition-colors disabled:opacity-50"
                          >
                            부분수용
                          </button>
                          <button
                            onClick={() => handleDecision(obj.id, "rejected")}
                            disabled={isSubmittingThis}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
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
        <div className="space-y-3">
          {txLoading ? (
            <div className="bg-white border border-slate-200 p-8 text-center text-slate-400 rounded-2xl">
              <RefreshCwIcon className="w-6 h-6 animate-spin mx-auto mb-2" />
              로딩 중...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <AlertCircleIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-bold text-slate-600">대기 중인 포지션 변경 요청이 없어요</p>
            </div>
          ) : (
            transactions.map(tx => {
              const isSubmittingThis = txSubmitting[tx.id] ?? false;
              const date = tx.createdAt
                ? new Date((tx.createdAt as any).seconds * 1000).toLocaleDateString("ko-KR")
                : "-";
              return (
                <div key={tx.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-800">포지션 변경 요청</p>
                      <p className="text-xs text-slate-400 mt-0.5">{date}</p>
                    </div>
                    <span className="text-xs text-amber-700 bg-amber-100 border border-amber-200 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5" /> 검토 대기
                    </span>
                  </div>
                  {/* Before → After */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-xs text-slate-400 mb-2 font-semibold">변경 전</p>
                      {tx.before.map(a => (
                        <div key={a.sectorId} className="flex justify-between text-slate-600">
                          <span>{SECTOR_NAMES[a.sectorId] ?? a.sectorId}</span>
                          <span>{Math.round(a.weight * 100)}%</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
                      <p className="text-xs text-indigo-500 mb-2 font-semibold">변경 후</p>
                      {tx.after.map(a => (
                        <div key={a.sectorId} className="flex justify-between">
                          <span className="text-slate-600">{SECTOR_NAMES[a.sectorId] ?? a.sectorId}</span>
                          <span className="text-indigo-700 font-bold">{Math.round(a.weight * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {tx.rationale && (
                    <p className="text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-xl p-3 italic">
                      "{tx.rationale}"
                    </p>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">코멘트 (선택 사항)</label>
                    <textarea
                      value={txComments[tx.id] ?? ""}
                      onChange={e => setTxComments(prev => ({ ...prev, [tx.id]: e.target.value }))}
                      rows={2}
                      placeholder="학생에게 전달할 피드백..."
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-indigo-400 placeholder:text-slate-300"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTxDecision(tx.id, "approved")}
                      disabled={isSubmittingThis}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    >
                      <CheckIcon className="w-4 h-4" /> 승인
                    </button>
                    <button
                      onClick={() => handleTxDecision(tx.id, "rejected")}
                      disabled={isSubmittingThis}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-colors disabled:opacity-50"
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
        <div className="text-center py-16 text-slate-400">
          <AlertCircleIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-bold text-slate-600">도메인 요청 컨펌은 곧 지원돼요</p>
        </div>
      )}
    </div>
  );
}
