"use client";

import { useState } from "react";
import { PortfolioDonut } from "@/components/student/PortfolioDonut";
import { PieChart, Save, Clock, HistoryIcon, TrendingUpIcon, ArrowRightIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/lib/hooks/useUser";
import { useMyPortfolios } from "@/lib/hooks/useMyPortfolios";
import { useMyTransactions } from "@/lib/hooks/useTransactions";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SectorAllocation } from "@/types/schema";
import { MOCK_PORTFOLIO_HISTORY } from "@/lib/mockData";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid,
  XAxis, YAxis, Tooltip, ReferenceLine,
} from "recharts";
import { cn } from "@/lib/utils";

const CLASS_SECTORS = [
  { id: "semiconductor", name: "반도체",     color: "#818CF8" },
  { id: "green_energy",  name: "친환경에너지", color: "#34D399" },
  { id: "game",          name: "게임",       color: "#F472B6" },
  { id: "automotive",    name: "자동차",      color: "#FBBF24" },
];

const TX_STATUS_STYLE: Record<string, string> = {
  pending:  "text-yellow-400",
  approved: "text-score-up",
  rejected: "text-score-down",
};

const TX_STATUS_LABEL: Record<string, string> = {
  pending:  "검토 중",
  approved: "승인됨",
  rejected: "거절됨",
};

export default function StudentPortfolioPage() {
  const { user } = useUser();
  const { individual, snapshots } = useMyPortfolios(user?.id, user?.groupId, user?.classId);
  const { transactions } = useMyTransactions(user?.id);
  const [rationale, setRationale] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tab, setTab] = useState<"chart" | "allocations" | "history">("chart");

  const initialWeights = (() => {
    if (individual?.allocations?.length) {
      return Object.fromEntries(individual.allocations.map(a => [a.sectorId, Math.round(a.weight * 100)]));
    }
    return { semiconductor: 25, green_energy: 25, game: 25, automotive: 25 };
  })();

  const [weights, setWeights] = useState<Record<string, number>>(initialWeights);
  const totalValue = individual?.currentValue ?? 1000000;

  const handleWeightChange = (changedId: string, newValue: number) => {
    const clampedNew = Math.max(0, Math.min(100, newValue));
    const oldVal = weights[changedId];
    const diff = clampedNew - oldVal;
    if (diff === 0) return;

    const othersIds = CLASS_SECTORS.map(s => s.id).filter(id => id !== changedId);
    const othersSum = othersIds.reduce((sum, id) => sum + weights[id], 0);
    const nextWeights = { ...weights };
    nextWeights[changedId] = clampedNew;

    if (diff > 0 && othersSum === 0) { nextWeights[changedId] = oldVal; setWeights(nextWeights); return; }

    let remainingDiff = diff;
    othersIds.sort((a, b) => weights[a] - weights[b]);
    for (let i = 0; i < othersIds.length; i++) {
      const id = othersIds[i];
      const isLast = i === othersIds.length - 1;
      const adjust = othersSum > 0
        ? (isLast ? remainingDiff : Math.round(diff * (weights[id] / othersSum)))
        : (isLast ? remainingDiff : Math.round(diff / othersIds.length));
      let newOtherVal = weights[id] - adjust;
      if (newOtherVal < 0) { remainingDiff -= weights[id]; newOtherVal = 0; }
      else if (newOtherVal > 100) { remainingDiff -= (weights[id] - 100); newOtherVal = 100; }
      else { remainingDiff -= adjust; }
      nextWeights[id] = newOtherVal;
    }
    setWeights(nextWeights);
  };

  const submitChanges = async () => {
    if (!user?.id || !user?.classId || !individual?.id) {
      toast.error("포트폴리오 정보를 불러올 수 없어요.");
      return;
    }
    if (!rationale.trim()) {
      toast.error("변경 이유를 입력해주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      const beforeAllocations: SectorAllocation[] = individual.allocations;
      const afterAllocations: SectorAllocation[] = CLASS_SECTORS.map(s => ({
        sectorId: s.id,
        weight: weights[s.id] / 100,
      }));
      await addDoc(collection(db, "transactions"), {
        portfolioId: individual.id,
        ownerType: "individual",
        ownerId: user.id,
        classId: user.classId,
        requestedBy: user.id,
        changeType: "weight_adjust",
        before: beforeAllocations,
        after: afterAllocations,
        rationale: rationale.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
      });
      toast.success("포트폴리오 비중 변경 요청이 제출됐어요. 선생님 승인을 기다려요!");
      setRationale("");
    } catch (err: any) {
      toast.error(err.message || "제출에 실패했어요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanged = CLASS_SECTORS.some(s => {
    const currentWeight = individual?.allocations?.find(a => a.sectorId === s.id)?.weight ?? 0.25;
    return Math.abs(weights[s.id] / 100 - currentWeight) > 0.005;
  });

  // Chart data: real snapshots or mock
  const chartData = snapshots.length >= 2
    ? snapshots.map(s => ({ date: s.date, value: s.value, dailyReturn: s.dailyReturn }))
    : MOCK_PORTFOLIO_HISTORY;

  const startValue = chartData[0]?.value ?? 1000000;
  const cumulativeReturn = ((totalValue - startValue) / startValue * 100).toFixed(2);
  const isPositiveCumulative = parseFloat(cumulativeReturn) >= 0;

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-bold mb-3 border border-brand-500/30">
            <PieChart className="w-4 h-4" /> 내 포트폴리오
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">포트폴리오 관리</h1>
        </div>
        <div className="text-right">
          <p className="text-3xl font-display font-bold">₩{totalValue.toLocaleString()}</p>
          <p className={cn("text-sm font-medium mt-0.5", isPositiveCumulative ? "text-score-up" : "text-score-down")}>
            누적 {isPositiveCumulative ? "+" : ""}{cumulativeReturn}%
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
        {(["chart", "allocations", "history"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-semibold transition-colors",
              tab === t ? "bg-brand-500 text-white" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "chart" ? "📈 수익 차트" : t === "allocations" ? "🥧 비중 관리" : "📋 변경 이력"}
          </button>
        ))}
      </div>

      {/* CHART TAB */}
      {tab === "chart" && (
        <div className="glass p-5 space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <TrendingUpIcon className="w-4 h-4 text-brand-400" />
            30일 평가액 추이
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={Math.floor(chartData.length / 6)}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `${(v / 10000).toFixed(0)}만`}
                  width={48}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(val) => [`₩${Number(val).toLocaleString()}`, "평가액"]}
                />
                <ReferenceLine
                  y={startValue}
                  stroke="rgba(255,255,255,0.2)"
                  strokeDasharray="4 4"
                  label={{ value: "시작", fill: "var(--muted-foreground)", fontSize: 10 }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={isPositiveCumulative ? "#34d399" : "#f87171"}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Weekly N/3 summary */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/50">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">이번주 상승일</p>
              <p className="text-xl font-bold text-score-up">
                {chartData.slice(-5).filter(d => (d.dailyReturn ?? 0) > 0).length}
                <span className="text-sm font-normal text-muted-foreground">/5</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">최고 단일 수익</p>
              <p className="text-xl font-bold text-score-up">
                +{(Math.max(...chartData.map(d => d.dailyReturn ?? 0)) * 100).toFixed(2)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">총 변경 횟수</p>
              <p className="text-xl font-bold">{transactions.length}회</p>
            </div>
          </div>
        </div>
      )}

      {/* ALLOCATIONS TAB */}
      {tab === "allocations" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="glass rounded-2xl p-6 flex flex-col justify-center">
            <PortfolioDonut
              allocations={CLASS_SECTORS.map(s => ({ sectorId: s.id, color: s.color, weight: weights[s.id] }))}
              totalValue={totalValue}
            />
            <div className="mt-4 text-center text-sm text-muted-foreground">
              총 평가액 <span className="font-bold text-foreground">₩{totalValue.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <h3 className="text-base font-bold mb-5">비중 조절 (자동 밸런싱)</h3>
              <div className="space-y-5">
                {CLASS_SECTORS.map(sector => (
                  <div key={sector.id} className="space-y-2">
                    <div className="flex justify-between font-medium">
                      <span className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: sector.color }} />
                        {sector.name}
                      </span>
                      <span className="font-bold" style={{ color: sector.color }}>{weights[sector.id]}%</span>
                    </div>
                    <input
                      type="range" min="0" max="100" value={weights[sector.id]}
                      onChange={e => handleWeightChange(sector.id, parseInt(e.target.value))}
                      disabled={isSubmitting}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                      style={{
                        background: `linear-gradient(to right, ${sector.color} ${weights[sector.id]}%, var(--muted) ${weights[sector.id]}%)`,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {hasChanged && (
              <div className="glass rounded-2xl p-5 border border-brand-500/30 space-y-3">
                <label className="text-sm font-semibold">변경 이유 <span className="text-red-400">*</span></label>
                <textarea
                  value={rationale}
                  onChange={e => setRationale(e.target.value)}
                  rows={3}
                  placeholder="예: 최근 AI 서버 수요로 반도체 모멘텀이 강해서 비중을 높이고..."
                  className="w-full p-3 bg-white/5 border border-border/50 rounded-xl text-sm resize-none focus:outline-none focus:border-brand-500/50 placeholder:text-muted-foreground/50"
                />
                <button
                  onClick={submitChanges}
                  disabled={isSubmitting || !rationale.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-brand-600 transition-colors"
                >
                  {isSubmitting
                    ? <><Clock className="w-4 h-4 animate-spin" /> 제출 중...</>
                    : <><Save className="w-4 h-4" /> 변경 요청 제출</>
                  }
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HISTORY TAB */}
      {tab === "history" && (
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="glass p-10 text-center text-muted-foreground rounded-2xl">
              <HistoryIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">변경 이력이 없어요</p>
              <p className="text-sm mt-1">포트폴리오 비중을 변경하면 여기에 기록됩니다.</p>
            </div>
          ) : (
            transactions.map(tx => {
              const statusStyle = TX_STATUS_STYLE[tx.status] ?? "text-muted-foreground";
              const statusLabel = TX_STATUS_LABEL[tx.status] ?? tx.status;
              const date = tx.createdAt
                ? new Date((tx.createdAt as any).seconds * 1000).toLocaleDateString("ko-KR")
                : "-";
              return (
                <div key={tx.id} className="glass rounded-2xl p-5 border border-border/50 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">비중 변경 요청</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{date}</p>
                    </div>
                    <span className={cn("text-xs font-bold flex items-center gap-1", statusStyle)}>
                      {tx.status === "approved" ? <CheckCircle2Icon className="w-3.5 h-3.5" />
                        : tx.status === "rejected" ? <XCircleIcon className="w-3.5 h-3.5" />
                        : <Clock className="w-3.5 h-3.5" />}
                      {statusLabel}
                    </span>
                  </div>
                  {/* Before → After */}
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <div className="flex gap-1 flex-wrap">
                      {tx.before.map(a => (
                        <span key={a.sectorId} className="px-2 py-0.5 bg-white/5 rounded text-muted-foreground">
                          {a.sectorId} {Math.round(a.weight * 100)}%
                        </span>
                      ))}
                    </div>
                    <ArrowRightIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <div className="flex gap-1 flex-wrap">
                      {tx.after.map(a => (
                        <span key={a.sectorId} className="px-2 py-0.5 bg-brand-500/15 text-brand-300 rounded">
                          {a.sectorId} {Math.round(a.weight * 100)}%
                        </span>
                      ))}
                    </div>
                  </div>
                  {tx.rationale && (
                    <p className="text-xs text-muted-foreground bg-white/5 rounded-xl p-3 italic">
                      "{tx.rationale}"
                    </p>
                  )}
                  {tx.teacherComment && (
                    <p className="text-xs text-yellow-300 bg-yellow-500/10 rounded-xl p-3">
                      👨‍🏫 선생님: {tx.teacherComment}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
