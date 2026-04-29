"use client";

import { useState } from "react";
import {
  PieChart as PieChartIcon, Save, Clock, HistoryIcon,
  TrendingUpIcon, ArrowRightIcon, CheckCircle2Icon,
  XCircleIcon, WalletIcon,
} from "lucide-react";
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
  PieChart, Pie, Cell,
} from "recharts";
import { cn } from "@/lib/utils";

const CLASS_SECTORS = [
  { id: "semiconductor", name: "반도체",      color: "#818CF8" },
  { id: "green_energy",  name: "친환경에너지", color: "#34D399" },
  { id: "game",          name: "게임",        color: "#F472B6" },
  { id: "automotive",    name: "자동차",       color: "#FBBF24" },
];

const TX_STATUS_STYLE: Record<string, string> = {
  pending:  "text-yellow-500",
  approved: "text-emerald-600",
  rejected: "text-red-500",
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
  const [tab, setTab] = useState<"chart" | "allocations" | "history">("allocations");

  const initialWeights = (() => {
    if (individual?.allocations?.length) {
      const w: Record<string, number> = {};
      for (const a of individual.allocations) {
        if (a.sectorId !== "cash") w[a.sectorId] = Math.round(a.weight * 100);
      }
      return w;
    }
    return { semiconductor: 25, green_energy: 25, game: 25, automotive: 25 };
  })();

  const [weights, setWeights] = useState<Record<string, number>>(initialWeights);
  const totalValue = individual?.currentValue ?? 1_000_000;

  const sectorTotal = Object.values(weights).reduce((s, v) => s + v, 0);
  const cashWeight = Math.max(0, 100 - sectorTotal);
  const isOver = sectorTotal > 100;

  const handleWeightChange = (id: string, value: number) => {
    const next = Math.max(0, Math.min(100, value));
    setWeights(prev => ({ ...prev, [id]: next }));
  };

  const submitChanges = async () => {
    if (isOver) { toast.error("비중 합계가 100%를 초과했어요. 줄여주세요."); return; }
    if (!user?.id || !user?.classId || !individual?.id) {
      toast.error("포트폴리오 정보를 불러올 수 없어요."); return;
    }
    if (!rationale.trim()) { toast.error("변경 이유를 입력해주세요."); return; }

    setIsSubmitting(true);
    try {
      const afterAllocations: SectorAllocation[] = [
        ...CLASS_SECTORS.map(s => ({ sectorId: s.id, weight: weights[s.id] / 100 })),
        ...(cashWeight > 0 ? [{ sectorId: "cash", weight: cashWeight / 100 }] : []),
      ];
      await addDoc(collection(db, "transactions"), {
        portfolioId: individual.id,
        ownerType: "individual",
        ownerId: user.id,
        classId: user.classId,
        requestedBy: user.id,
        changeType: "weight_adjust",
        before: individual.allocations,
        after: afterAllocations,
        rationale: rationale.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
      });
      toast.success("비중 변경 요청이 제출됐어요. 선생님 승인을 기다려요!");
      setRationale("");
    } catch (err: any) {
      toast.error(err.message || "제출에 실패했어요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanged = CLASS_SECTORS.some(s => {
    const cur = individual?.allocations?.find(a => a.sectorId === s.id)?.weight ?? 0.25;
    return Math.abs(weights[s.id] / 100 - cur) > 0.005;
  });

  // 차트 데이터
  const chartData = snapshots.length >= 2
    ? snapshots.map(s => ({ date: s.date, value: s.value, dailyReturn: s.dailyReturn }))
    : MOCK_PORTFOLIO_HISTORY;
  const startValue = chartData[0]?.value ?? 1_000_000;
  const cumulativeReturn = ((totalValue - startValue) / startValue * 100).toFixed(2);
  const isPositive = parseFloat(cumulativeReturn) >= 0;

  // 파이 차트 데이터 (섹터 + 현금)
  const pieData = [
    ...CLASS_SECTORS.map(s => ({ name: s.name, value: weights[s.id], color: s.color })),
    ...(cashWeight > 0 ? [{ name: "현금", value: cashWeight, color: "#CBD5E1" }] : []),
  ].filter(d => d.value > 0);

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-10">

      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold mb-3 border border-indigo-200">
            <PieChartIcon className="w-4 h-4" /> 내 포트폴리오
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-800">포트폴리오 관리</h1>
        </div>
        <div className="text-right">
          <p className="text-3xl font-display font-bold text-slate-800">₩{totalValue.toLocaleString()}</p>
          <p className={cn("text-sm font-medium mt-0.5", isPositive ? "text-emerald-600" : "text-red-500")}>
            누적 {isPositive ? "+" : ""}{cumulativeReturn}%
          </p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {(["allocations", "chart", "history"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-semibold transition-colors",
              tab === t
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t === "allocations" ? "🥧 비중 관리" : t === "chart" ? "📈 수익 차트" : "📋 변경 이력"}
          </button>
        ))}
      </div>

      {/* ── 비중 관리 탭 ── */}
      {tab === "allocations" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* 도넛 차트 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm">
            <div className="relative w-52 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: any) => [`${v}%`, ""]}
                    contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e2e8f0" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* 가운데 텍스트 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-slate-400">총 평가액</span>
                <span className="text-lg font-display font-bold text-slate-800">
                  {(totalValue / 10000).toFixed(0)}만원
                </span>
              </div>
            </div>

            {/* 범례 */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-4">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name} <span className="font-bold">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 비중 입력 */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-700">비중 조절</h3>
                <span className={cn(
                  "text-sm font-bold px-2 py-0.5 rounded-lg",
                  isOver
                    ? "bg-red-100 text-red-600"
                    : "bg-emerald-100 text-emerald-700"
                )}>
                  섹터 {sectorTotal}%
                </span>
              </div>

              <div className="space-y-4">
                {CLASS_SECTORS.map(sector => (
                  <div key={sector.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sector.color }} />
                        <span className="text-sm font-semibold text-slate-700">{sector.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={weights[sector.id]}
                          onChange={e => handleWeightChange(sector.id, Number(e.target.value))}
                          className="w-16 text-center text-sm font-bold p-1.5 rounded-lg border border-slate-200 focus:border-indigo-400 outline-none"
                          style={{ color: sector.color }}
                        />
                        <span className="text-sm text-slate-400">%</span>
                      </div>
                    </div>
                    {/* 슬라이더 — 트랙 명확히 표시 */}
                    <div className="relative h-3 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(weights[sector.id], 100)}%`,
                          backgroundColor: sector.color,
                        }}
                      />
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={weights[sector.id]}
                        onChange={e => handleWeightChange(sector.id, Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                ))}

                {/* 현금 — 자동 */}
                <div className={cn(
                  "rounded-xl border p-3 space-y-1.5",
                  cashWeight > 0 ? "bg-slate-50 border-slate-200" : "bg-red-50 border-red-200"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <WalletIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-sm font-semibold text-slate-600">현금 보유</span>
                      <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full">자동</span>
                    </div>
                    <span className={cn(
                      "text-base font-display font-bold",
                      cashWeight > 0 ? "text-slate-600" : "text-red-500"
                    )}>
                      {cashWeight}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", cashWeight > 0 ? "bg-slate-400" : "bg-red-400")}
                      style={{ width: `${cashWeight}%` }}
                    />
                  </div>
                  {isOver && (
                    <p className="text-[10px] text-red-500 font-semibold">⚠️ 섹터 합계가 100%를 초과했어요</p>
                  )}
                </div>
              </div>
            </div>

            {/* 변경 이유 + 제출 */}
            {hasChanged && (
              <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-sm space-y-3">
                <label className="text-sm font-semibold text-slate-700">
                  변경 이유 <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={rationale}
                  onChange={e => setRationale(e.target.value)}
                  rows={3}
                  placeholder="예: 최근 AI 서버 수요로 반도체 모멘텀이 강해서 비중을 높이고..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:border-indigo-400 placeholder:text-slate-400"
                />
                <button
                  onClick={submitChanges}
                  disabled={isSubmitting || !rationale.trim() || isOver}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-40 hover:bg-indigo-700 transition-colors"
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

      {/* ── 수익 차트 탭 ── */}
      {tab === "chart" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <TrendingUpIcon className="w-4 h-4 text-indigo-500" />
            30일 평가액 추이
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={Math.floor(chartData.length / 6)}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `${(v / 10000).toFixed(0)}만`}
                  width={40}
                />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                  formatter={(val) => [`₩${Number(val).toLocaleString()}`, "평가액"]}
                />
                <ReferenceLine y={startValue} stroke="#e2e8f0" strokeDasharray="4 4" />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={isPositive ? "#10b981" : "#f43f5e"}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">이번주 상승일</p>
              <p className="text-xl font-bold text-emerald-600">
                {chartData.slice(-5).filter(d => (d.dailyReturn ?? 0) > 0).length}
                <span className="text-sm font-normal text-slate-400">/5</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">최고 단일 수익</p>
              <p className="text-xl font-bold text-emerald-600">
                +{Math.max(...chartData.map(d => d.dailyReturn ?? 0)).toFixed(2)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">총 변경 횟수</p>
              <p className="text-xl font-bold text-slate-800">{transactions.length}회</p>
            </div>
          </div>
        </div>
      )}

      {/* ── 변경 이력 탭 ── */}
      {tab === "history" && (
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
              <HistoryIcon className="w-10 h-10 mx-auto mb-3 text-slate-200" />
              <p className="font-semibold text-slate-500">변경 이력이 없어요</p>
              <p className="text-sm text-slate-400 mt-1">포트폴리오 비중을 변경하면 여기에 기록됩니다.</p>
            </div>
          ) : (
            transactions.map(tx => {
              const statusStyle = TX_STATUS_STYLE[tx.status] ?? "text-slate-400";
              const statusLabel = TX_STATUS_LABEL[tx.status] ?? tx.status;
              const date = tx.createdAt
                ? new Date((tx.createdAt as any).seconds * 1000).toLocaleDateString("ko-KR")
                : "-";
              return (
                <div key={tx.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">비중 변경 요청</p>
                      <p className="text-xs text-slate-400 mt-0.5">{date}</p>
                    </div>
                    <span className={cn("text-xs font-bold flex items-center gap-1", statusStyle)}>
                      {tx.status === "approved" ? <CheckCircle2Icon className="w-3.5 h-3.5" />
                        : tx.status === "rejected" ? <XCircleIcon className="w-3.5 h-3.5" />
                        : <Clock className="w-3.5 h-3.5" />}
                      {statusLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <div className="flex gap-1 flex-wrap">
                      {tx.before.map(a => (
                        <span key={a.sectorId} className="px-2 py-0.5 bg-slate-100 rounded text-slate-500">
                          {a.sectorId} {Math.round(a.weight * 100)}%
                        </span>
                      ))}
                    </div>
                    <ArrowRightIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div className="flex gap-1 flex-wrap">
                      {tx.after.map(a => (
                        <span key={a.sectorId} className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded font-semibold">
                          {a.sectorId} {Math.round(a.weight * 100)}%
                        </span>
                      ))}
                    </div>
                  </div>
                  {tx.rationale && (
                    <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3 italic">
                      "{tx.rationale}"
                    </p>
                  )}
                  {tx.teacherComment && (
                    <p className="text-xs text-amber-700 bg-amber-50 rounded-xl p-3">
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
