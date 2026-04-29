"use client";

import { useState, useEffect } from "react";
import { CheckIcon, InfoIcon, TrendingUpIcon, WalletIcon } from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/hooks/useUser";
import { usePublicScores } from "@/lib/hooks/usePublicScores";
import { useSoloPortfolio, saveSoloPortfolio } from "@/lib/hooks/useSoloPortfolio";

// Sector IDs match the daily cron pipeline
const ALL_SECTORS = [
  { id: "semiconductor", name: "반도체",      icon: "💻", desc: "메모리·시스템반도체·장비" },
  { id: "automotive",    name: "자동차",      icon: "🚗", desc: "완성차·전기차·배터리" },
  { id: "game",          name: "게임",        icon: "🎮", desc: "모바일·PC·콘솔게임" },
  { id: "content",       name: "콘텐츠",      icon: "🎬", desc: "엔터·OTT·K콘텐츠" },
  { id: "travel",        name: "여행·항공",   icon: "✈️", desc: "항공·여행·관광" },
  { id: "green_energy",  name: "친환경에너지", icon: "🌱", desc: "태양광·풍력·수소·ESS" },
  { id: "food",          name: "식품",        icon: "🍔", desc: "식음료·유통·원자재" },
  { id: "construction",  name: "건설",        icon: "🏗️", desc: "건설·부동산·PF" },
  { id: "geopolitics",   name: "국제정세",    icon: "🌐", desc: "미중갈등·지정학·관세" },
  { id: "global_trade",  name: "글로벌무역",  icon: "🚢", desc: "수출·해상운임·물류" },
];

const MAX_SECTORS = 5;

export default function SoloPortfolio() {
  const { user, firebaseUid } = useUser();
  const userId = user?.id ?? firebaseUid;
  const { scores } = usePublicScores();
  const { portfolio, snapshots } = useSoloPortfolio(userId);

  const [allocations, setAllocations] = useState<Record<string, number>>({
    semiconductor: 40,
    game: 35,
    green_energy: 15,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load saved allocations from Firestore on first load
  useEffect(() => {
    if (!loaded && portfolio?.allocations) {
      const next: Record<string, number> = {};
      for (const alloc of portfolio.allocations) {
        if (alloc.sectorId !== "cash") {
          next[alloc.sectorId] = Math.round(alloc.weight * 100);
        }
      }
      if (Object.keys(next).length > 0) {
        setAllocations(next);
      }
      setLoaded(true);
    }
  }, [portfolio, loaded]);

  const selectedIds = Object.keys(allocations);
  const sectorTotal = Object.values(allocations).reduce((s, v) => s + v, 0);
  const cashWeight = Math.max(0, 100 - sectorTotal);
  const isOver = sectorTotal > 100;
  const isValid = !isOver && selectedIds.length > 0;

  // Merge real dailyReturn from publicScores
  const getSectorReturn = (id: string): number => {
    if (scores?.sectorScores) {
      return scores.sectorScores.find(s => s.sectorId === id)?.dailyReturn ?? 0;
    }
    return 0;
  };

  const handleToggleSector = (id: string) => {
    if (allocations[id] !== undefined) {
      const next = { ...allocations };
      delete next[id];
      setAllocations(next);
    } else {
      if (selectedIds.length >= MAX_SECTORS) {
        toast.error(`최대 ${MAX_SECTORS}개 섹터까지 선택할 수 있어요.`);
        return;
      }
      const giveAmount = Math.min(Math.floor(cashWeight / 2), 20);
      setAllocations({ ...allocations, [id]: Math.max(5, giveAmount) });
    }
  };

  const handleWeightChange = (id: string, value: number) => {
    setAllocations(prev => ({ ...prev, [id]: Math.min(100, Math.max(0, value)) }));
  };

  const handleAutoBalance = () => {
    if (selectedIds.length === 0) return;
    const per = Math.floor(80 / selectedIds.length);
    const remainder = 80 - per * selectedIds.length;
    const next: Record<string, number> = {};
    selectedIds.forEach((id, i) => {
      next[id] = per + (i === 0 ? remainder : 0);
    });
    setAllocations(next);
    toast.success("섹터 80% · 현금 20%로 배분했어요");
  };

  const handleSave = async () => {
    if (!isValid) return;
    if (!userId) { toast.error("로그인이 필요해요."); return; }
    setIsSaving(true);
    try {
      const allocs = [
        ...selectedIds.map(id => ({ sectorId: id, weight: allocations[id] / 100 })),
        ...(cashWeight > 0 ? [{ sectorId: "cash", weight: cashWeight / 100 }] : []),
      ];
      await saveSoloPortfolio(userId, allocs);
      toast.success(`포트폴리오 저장 완료! 현금 ${cashWeight}% 포함`);
    } catch {
      toast.error("저장에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  // History chart data
  const historyData = snapshots.length > 0
    ? snapshots.map(s => ({ date: s.date.slice(5), value: s.value }))
    : [{ date: "시작", value: portfolio?.currentValue ?? 1_000_000 }];

  // Bar chart (sectors + cash)
  const barData = [
    ...ALL_SECTORS.filter(s => allocations[s.id] !== undefined).map(s => ({
      name: s.name, weight: allocations[s.id], isCash: false, return: getSectorReturn(s.id),
    })),
    ...(cashWeight > 0 ? [{ name: "현금", weight: cashWeight, isCash: true, return: 0 }] : []),
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800">섹터 투자 설정</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          투자할 섹터를 고르고 비중을 설정하세요. 남은 비중은{" "}
          <span className="font-semibold text-slate-600">현금</span>으로 자동 보유됩니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Left */}
        <div className="lg:col-span-3 space-y-4">

          {/* Sector Grid */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-700">섹터 선택 ({selectedIds.length}/{MAX_SECTORS})</h2>
              <span className="text-xs text-slate-400">최대 5개</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALL_SECTORS.map(sector => {
                const isSelected = allocations[sector.id] !== undefined;
                const todayReturn = getSectorReturn(sector.id);
                const hasRealReturn = scores !== null;
                return (
                  <button
                    key={sector.id}
                    onClick={() => handleToggleSector(sector.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                      isSelected
                        ? "border-emerald-200 bg-emerald-50 ring-1 ring-emerald-200"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300"
                    )}
                  >
                    <span className="text-xl w-7 text-center">{sector.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-800">{sector.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{sector.desc}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {hasRealReturn ? (
                        <div className={cn(
                          "text-xs font-bold",
                          todayReturn >= 0 ? "text-emerald-600" : "text-red-500"
                        )}>
                          {todayReturn >= 0 ? "+" : ""}{todayReturn.toFixed(1)}%
                        </div>
                      ) : (
                        <div className="text-xs text-slate-300">-</div>
                      )}
                      {isSelected && <CheckIcon className="w-4 h-4 text-emerald-500 ml-auto mt-0.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weight Sliders */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-700">비중 배분</h2>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-sm font-bold",
                  isOver ? "text-red-500" : "text-emerald-600"
                )}>
                  섹터 {sectorTotal}%
                </span>
                <button
                  onClick={handleAutoBalance}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors font-medium text-slate-600"
                >
                  균등 배분
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {selectedIds.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">섹터를 선택하면 비중을 설정할 수 있어요</p>
              )}

              {selectedIds.map(id => {
                const sector = ALL_SECTORS.find(s => s.id === id)!;
                return (
                  <div key={id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{sector.icon}</span>
                        <span className="text-sm font-semibold text-slate-700">{sector.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={allocations[id]}
                          onChange={e => handleWeightChange(id, Number(e.target.value))}
                          className="w-14 text-center text-sm p-1 rounded-lg bg-slate-100 border border-slate-200 focus:border-emerald-400 outline-none font-bold text-slate-800"
                        />
                        <span className="text-sm text-slate-400">%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={allocations[id]}
                      onChange={e => handleWeightChange(id, Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5"
                    />
                  </div>
                );
              })}

              {/* 현금 — 항상 표시 */}
              <div className={cn(
                "rounded-xl border p-3 space-y-1.5",
                cashWeight > 0 ? "bg-slate-50 border-slate-200" : "bg-red-50 border-red-200"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <WalletIcon className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-700">현금 보유</span>
                    <span className="text-[10px] text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded-full">자동</span>
                  </div>
                  <span className={cn(
                    "text-lg font-display font-bold",
                    cashWeight > 0 ? "text-slate-700" : "text-red-500"
                  )}>
                    {cashWeight}%
                  </span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      cashWeight > 0 ? "bg-slate-400" : "bg-red-400"
                    )}
                    style={{ width: `${cashWeight}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {cashWeight > 0
                    ? "섹터 하락 시 현금이 손실을 줄여줘요 📦"
                    : "⚠️ 섹터 비중이 100%를 초과했어요"}
                </p>
              </div>
            </div>

            {isOver && (
              <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
                <InfoIcon className="w-3.5 h-3.5 flex-shrink-0" />
                섹터 합계가 100%를 넘었어요. 비중을 줄여주세요.
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={!isValid || isSaving}
              className="mt-4 w-full py-3 bg-emerald-600 text-white rounded-2xl font-bold disabled:opacity-40 hover:bg-emerald-700 transition-colors shadow-sm"
            >
              {isSaving ? "저장 중..." : `저장 (섹터 ${sectorTotal}% · 현금 ${cashWeight}%)`}
            </button>
          </div>
        </div>

        {/* Right: Charts */}
        <div className="lg:col-span-2 space-y-4">

          {/* Portfolio History */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-slate-700 mb-1 flex items-center gap-2 text-sm">
              <TrendingUpIcon className="w-4 h-4 text-emerald-500" /> 수익 추이
            </h2>
            <div className="text-2xl font-display font-bold text-slate-800 mb-3">
              {(portfolio?.currentValue ?? 1_000_000).toLocaleString()}원
            </div>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickFormatter={v => `${(v / 10000).toFixed(0)}만`}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: any) => [`${(v as number).toLocaleString()}원`]}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#pg)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Allocation Bar */}
          {barData.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-slate-700 mb-1 text-sm">현재 배분</h2>
              <p className="text-xs text-slate-400 mb-3">
                {scores ? "회색 = 현금 · 초록/빨강 = 오늘 등락" : "회색 = 현금 · 등락은 장 마감 후 표시"}
              </p>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} unit="%" width={28} />
                    <Tooltip
                      contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                      formatter={(v: any) => [`${v}%`]}
                    />
                    <Bar dataKey="weight" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={
                            entry.isCash ? "#94a3b8"
                              : scores === null ? "#10b981"
                              : entry.return >= 0 ? "#10b981" : "#f43f5e"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
