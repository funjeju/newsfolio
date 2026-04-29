"use client";

import { useState } from "react";
import { CheckIcon, InfoIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";
import { toast } from "sonner";

const ALL_SECTORS = [
  { id: "semi",    name: "반도체",   icon: "💻", desc: "메모리·시스템반도체·장비",       todayReturn: 2.1,  weekReturn: 4.2  },
  { id: "bio",     name: "바이오",   icon: "🧬", desc: "신약개발·의료기기·헬스케어",      todayReturn: -0.8, weekReturn: -1.5 },
  { id: "fin",     name: "금융",     icon: "🏦", desc: "은행·증권·보험·핀테크",          todayReturn: 0.5,  weekReturn: 1.2  },
  { id: "energy",  name: "에너지",   icon: "⚡", desc: "재생에너지·원자력·ESS",           todayReturn: 1.3,  weekReturn: 3.1  },
  { id: "auto",    name: "자동차",   icon: "🚗", desc: "완성차·전기차·배터리",            todayReturn: -0.3, weekReturn: 0.8  },
  { id: "food",    name: "식품·소비", icon: "🛒", desc: "식음료·유통·화장품",             todayReturn: 0.2,  weekReturn: -0.4 },
  { id: "defense", name: "방산",     icon: "🛡️", desc: "무기·항공우주·방위산업",         todayReturn: 1.8,  weekReturn: 5.6  },
  { id: "media",   name: "미디어",   icon: "🎬", desc: "엔터·게임·콘텐츠·OTT",           todayReturn: -1.2, weekReturn: -2.8 },
  { id: "real",    name: "부동산",   icon: "🏢", desc: "건설·부동산개발·리츠",            todayReturn: 0.0,  weekReturn: -0.9 },
  { id: "infra",   name: "인프라",   icon: "🏗️", desc: "통신·유틸리티·플랫폼",           todayReturn: 0.6,  weekReturn: 1.8  },
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
    fin: 25,
  });
  const [isSaving, setIsSaving] = useState(false);

  const selectedIds = Object.keys(allocations);
  const totalWeight = Object.values(allocations).reduce((s, v) => s + v, 0);
  const isValid = totalWeight === 100 && selectedIds.length > 0;

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
      const remaining = 100 - totalWeight;
      setAllocations({ ...allocations, [id]: Math.max(0, remaining) });
    }
  };

  const handleWeightChange = (id: string, value: number) => {
    setAllocations(prev => ({ ...prev, [id]: value }));
  };

  const handleAutoBalance = () => {
    if (selectedIds.length === 0) return;
    const per = Math.floor(100 / selectedIds.length);
    const remainder = 100 - per * selectedIds.length;
    const next: Record<string, number> = {};
    selectedIds.forEach((id, i) => {
      next[id] = per + (i === 0 ? remainder : 0);
    });
    setAllocations(next);
  };

  const handleSave = async () => {
    if (!isValid) return;
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success("포트폴리오가 저장됐어요!");
    setIsSaving(false);
  };

  const barData = ALL_SECTORS
    .filter(s => allocations[s.id] !== undefined)
    .map(s => ({ name: s.name, weight: allocations[s.id], return: s.todayReturn }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold">포트폴리오 설정</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          투자할 섹터를 고르고 비중을 배분하세요. 매일 뉴스 기반 수익률이 반영됩니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Sector List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card border border-border/50 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">섹터 선택 ({selectedIds.length}/{MAX_SECTORS})</h2>
              <span className="text-xs text-muted-foreground">최대 5개</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALL_SECTORS.map(sector => {
                const isSelected = allocations[sector.id] !== undefined;
                return (
                  <button
                    key={sector.id}
                    onClick={() => handleToggleSector(sector.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      isSelected
                        ? "border-emerald-500/40 bg-emerald-500/10"
                        : "border-border/50 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-xl w-7 text-center">{sector.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold">{sector.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{sector.desc}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-xs font-bold ${sector.todayReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {sector.todayReturn >= 0 ? "+" : ""}{sector.todayReturn.toFixed(1)}%
                      </div>
                      {isSelected && <CheckIcon className="w-4 h-4 text-emerald-400 ml-auto mt-0.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weight Adjustment */}
          {selectedIds.length > 0 && (
            <div className="bg-card border border-border/50 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold">비중 배분</h2>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${totalWeight === 100 ? "text-emerald-400" : totalWeight > 100 ? "text-red-400" : "text-yellow-400"}`}>
                    합계 {totalWeight}%
                  </span>
                  <button
                    onClick={handleAutoBalance}
                    className="text-xs px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/70 transition-colors font-medium"
                  >
                    균등 배분
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                {selectedIds.map(id => {
                  const sector = ALL_SECTORS.find(s => s.id === id)!;
                  return (
                    <div key={id} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{sector.icon}</span>
                          <span className="text-sm font-medium">{sector.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={allocations[id]}
                            onChange={e => handleWeightChange(id, Number(e.target.value))}
                            className="w-14 text-center text-sm p-1 rounded-lg bg-muted border border-border focus:border-emerald-500 outline-none font-bold"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
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
              </div>

              {totalWeight !== 100 && (
                <div className="mt-3 flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 rounded-xl">
                  <InfoIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  합계가 정확히 100%가 되어야 저장할 수 있어요.
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={!isValid || isSaving}
                className="mt-4 w-full py-3 bg-emerald-500 text-white rounded-2xl font-bold disabled:opacity-40 hover:bg-emerald-600 transition-colors"
              >
                {isSaving ? "저장 중..." : "포트폴리오 저장"}
              </button>
            </div>
          )}
        </div>

        {/* Right: Charts */}
        <div className="lg:col-span-2 space-y-4">
          {/* Portfolio History */}
          <div className="bg-card border border-border/50 rounded-2xl p-5">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUpIcon className="w-4 h-4 text-emerald-400" /> 수익 추이
            </h2>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={HISTORY} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickFormatter={v => `${(v / 10000).toFixed(0)}만`} width={36} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    formatter={(v: any) => [`${(v as number).toLocaleString()}원`]}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#pg)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Allocation Bar */}
          {barData.length > 0 && (
            <div className="bg-card border border-border/50 rounded-2xl p-5">
              <h2 className="font-bold mb-4">현재 배분</h2>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} unit="%" width={28} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                      formatter={(v: any) => [`${v}%`]}
                    />
                    <Bar dataKey="weight" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={entry.return >= 0 ? "#10b981" : "#f43f5e"} />
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
