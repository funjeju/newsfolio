"use client";

import { useState } from "react";
import { CheckIcon, InfoIcon, TrendingUpIcon, WalletIcon } from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ALL_SECTORS = [
  { id: "semi",    name: "반도체",   icon: "💻", desc: "메모리·시스템반도체·장비",   todayReturn: 2.1,  weekReturn: 4.2  },
  { id: "bio",     name: "바이오",   icon: "🧬", desc: "신약개발·의료기기·헬스케어", todayReturn: -0.8, weekReturn: -1.5 },
  { id: "fin",     name: "금융",     icon: "🏦", desc: "은행·증권·보험·핀테크",      todayReturn: 0.5,  weekReturn: 1.2  },
  { id: "energy",  name: "에너지",   icon: "⚡", desc: "재생에너지·원자력·ESS",       todayReturn: 1.3,  weekReturn: 3.1  },
  { id: "auto",    name: "자동차",   icon: "🚗", desc: "완성차·전기차·배터리",        todayReturn: -0.3, weekReturn: 0.8  },
  { id: "food",    name: "식품·소비", icon: "🛒", desc: "식음료·유통·화장품",         todayReturn: 0.2,  weekReturn: -0.4 },
  { id: "defense", name: "방산",     icon: "🛡️", desc: "무기·항공우주·방위산업",     todayReturn: 1.8,  weekReturn: 5.6  },
  { id: "media",   name: "미디어",   icon: "🎬", desc: "엔터·게임·콘텐츠·OTT",       todayReturn: -1.2, weekReturn: -2.8 },
  { id: "real",    name: "부동산",   icon: "🏢", desc: "건설·부동산개발·리츠",        todayReturn: 0.0,  weekReturn: -0.9 },
  { id: "infra",   name: "인프라",   icon: "🏗️", desc: "통신·유틸리티·플랫폼",       todayReturn: 0.6,  weekReturn: 1.8  },
];

const HISTORY = [
  { date: "4/22", value: 1000000 },
  { date: "4/23", value: 1012000 },
  { date: "4/24", value: 1008000 },
  { date: "4/25", value: 1025000 },
  { date: "4/28", value: 1019000 },
  { date: "4/29", value: 1038000 },
];

const MAX_SECTORS = 5;

export default function SoloPortfolio() {
  const [allocations, setAllocations] = useState<Record<string, number>>({
    semi: 40,
    bio: 35,
    fin: 15,
    // 나머지 10%는 자동으로 현금
  });
  const [isSaving, setIsSaving] = useState(false);

  const selectedIds = Object.keys(allocations);
  const sectorTotal = Object.values(allocations).reduce((s, v) => s + v, 0);
  // 현금은 항상 나머지를 채움
  const cashWeight = Math.max(0, 100 - sectorTotal);
  const isOver = sectorTotal > 100;
  const isValid = !isOver && selectedIds.length > 0;

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
      // 현금에서 가져와 새 섹터에 배분 (남은 현금의 절반)
      const giveAmount = Math.min(Math.floor(cashWeight / 2), 20);
      setAllocations({ ...allocations, [id]: Math.max(5, giveAmount) });
    }
  };

  const handleWeightChange = (id: string, value: number) => {
    setAllocations(prev => ({ ...prev, [id]: Math.min(100, Math.max(0, value)) }));
  };

  const handleAutoBalance = () => {
    if (selectedIds.length === 0) return;
    // 섹터에 80% 균등 배분, 현금 20% 유지
    const totalForSectors = 80;
    const per = Math.floor(totalForSectors / selectedIds.length);
    const remainder = totalForSectors - per * selectedIds.length;
    const next: Record<string, number> = {};
    selectedIds.forEach((id, i) => {
      next[id] = per + (i === 0 ? remainder : 0);
    });
    setAllocations(next);
    toast.success("섹터 80% · 현금 20%로 배분했어요");
  };

  const handleSave = async () => {
    if (!isValid) return;
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success(`포트폴리오 저장! 현금 ${cashWeight}% 포함`);
    setIsSaving(false);
  };

  // 차트 데이터 (섹터 + 현금)
  const barData = [
    ...ALL_SECTORS.filter(s => allocations[s.id] !== undefined).map(s => ({
      name: s.name, weight: allocations[s.id], isCash: false, return: s.todayReturn,
    })),
    ...(cashWeight > 0 ? [{ name: "현금", weight: cashWeight, isCash: true, return: 0 }] : []),
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800">섹터 투자 설정</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          투자할 섹터를 고르고 비중을 설정하세요. 남은 비중은 <span className="font-semibold text-slate-600">현금</span>으로 자동 보유됩니다.
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
                      <div className={cn(
                        "text-xs font-bold",
                        sector.todayReturn >= 0 ? "text-emerald-600" : "text-red-500"
                      )}>
                        {sector.todayReturn >= 0 ? "+" : ""}{sector.todayReturn.toFixed(1)}%
                      </div>
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
            <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm">
              <TrendingUpIcon className="w-4 h-4 text-emerald-500" /> 수익 추이
            </h2>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={HISTORY} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={v => `${(v / 10000).toFixed(0)}만`} width={36} />
                  <Tooltip
                    contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: any) => [`${(v as number).toLocaleString()}원`]}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#pg)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Allocation Bar — 현금 포함 */}
          {barData.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-slate-700 mb-1 text-sm">현재 배분</h2>
              <p className="text-xs text-slate-400 mb-3">
                회색 = 현금 · 초록/빨강 = 오늘 등락
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
                          fill={entry.isCash ? "#94a3b8" : entry.return >= 0 ? "#10b981" : "#f43f5e"}
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
