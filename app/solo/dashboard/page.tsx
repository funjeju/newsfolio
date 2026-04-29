"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUpIcon, TrendingDownIcon, ArrowRightIcon,
  NewspaperIcon, ZapIcon, TrophyIcon, ExternalLinkIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useUser } from "@/lib/hooks/useUser";
import { usePublicScores } from "@/lib/hooks/usePublicScores";
import { useSoloPortfolio } from "@/lib/hooks/useSoloPortfolio";
import { cn } from "@/lib/utils";

// Sector metadata (ID → display info)
const SECTOR_META: Record<string, { name: string; icon: string }> = {
  semiconductor: { name: "반도체",       icon: "💻" },
  automotive:    { name: "자동차",       icon: "🚗" },
  game:          { name: "게임",         icon: "🎮" },
  content:       { name: "콘텐츠",       icon: "🎬" },
  travel:        { name: "여행·항공",    icon: "✈️" },
  green_energy:  { name: "친환경에너지", icon: "🌱" },
  food:          { name: "식품",         icon: "🍔" },
  construction:  { name: "건설",         icon: "🏗️" },
  geopolitics:   { name: "국제정세",     icon: "🌐" },
  global_trade:  { name: "글로벌무역",   icon: "🚢" },
};

// Mock news per sector — shown until real news API is wired up
const MOCK_NEWS: Record<string, { title: string; source: string; time: string; url: string }[]> = {
  semiconductor: [
    { title: "삼성전자, HBM4 양산 속도 높여 엔비디아 공급 본격화", source: "조선비즈", time: "오전 7:30", url: "https://biz.chosun.com" },
    { title: "미국 상무부, 반도체 수출 규제 일부 완화…HBM 포함", source: "한국경제", time: "오전 8:10", url: "https://www.hankyung.com" },
    { title: "SK하이닉스, AI 서버용 HBM3E 글로벌 공급 계약 체결", source: "전자신문", time: "오전 9:00", url: "https://www.etnews.com" },
  ],
  automotive: [
    { title: "현대차, 북미 전기차 판매 올해 첫 분기 흑자 달성", source: "연합뉴스", time: "오전 8:00", url: "https://www.yna.co.kr" },
    { title: "기아, 2분기 해외 수출 역대 최대…EV9 인기 주도", source: "한국경제", time: "오전 9:30", url: "https://www.hankyung.com" },
  ],
  game: [
    { title: "넥슨 신작 글로벌 출시 첫날 매출 신기록", source: "게임메카", time: "오전 9:10", url: "https://www.gamemeca.com" },
    { title: "크래프톤 PUBG 모바일 동남아 MAU 3천만 돌파", source: "연합뉴스", time: "오전 10:00", url: "https://www.yna.co.kr" },
  ],
  content: [
    { title: "넷플릭스 K드라마 점유율 올해 최고치…'오징어게임3' 효과", source: "매일경제", time: "오전 9:00", url: "https://www.mk.co.kr" },
    { title: "SM·하이브, 글로벌 음원 수익 분기 최대 갱신", source: "한국경제", time: "오전 10:30", url: "https://www.hankyung.com" },
  ],
  travel: [
    { title: "대한항공, 2분기 국제선 탑승률 역대 최고 91%", source: "연합뉴스", time: "오전 8:30", url: "https://www.yna.co.kr" },
    { title: "일본·동남아 여름 여행 예약 급증…항공권 가격 강세", source: "조선비즈", time: "오전 9:45", url: "https://biz.chosun.com" },
  ],
  green_energy: [
    { title: "정부, 신재생에너지 보조금 2조 원 추가 편성", source: "매일경제", time: "오전 8:45", url: "https://www.mk.co.kr" },
    { title: "국내 태양광 설비 누적 30GW 돌파…역대 최대", source: "에너지경제", time: "오전 10:15", url: "https://www.ekn.kr" },
  ],
  food: [
    { title: "시카고 밀 선물 2주 만에 8% 급등…식품업계 원가 비상", source: "한국경제", time: "오전 9:30", url: "https://www.hankyung.com" },
    { title: "농심·오뚜기, 하반기 라면값 인상 검토 중", source: "매일경제", time: "오전 11:00", url: "https://www.mk.co.kr" },
  ],
  construction: [
    { title: "부동산 PF 부실 5조 원 확인…중소 건설사 위기", source: "매일경제", time: "오전 8:15", url: "https://www.mk.co.kr" },
    { title: "서울 아파트 미분양 3만 가구 육박…청약 미달 속출", source: "조선비즈", time: "오전 9:45", url: "https://biz.chosun.com" },
  ],
  geopolitics: [
    { title: "미·중 무역 협상 결렬…상호 관세 추가 부과 임박", source: "연합뉴스", time: "오전 7:55", url: "https://www.yna.co.kr" },
    { title: "NATO 긴급회의 소집…동유럽 안보 불안 고조", source: "조선비즈", time: "오전 9:00", url: "https://biz.chosun.com" },
  ],
  global_trade: [
    { title: "상하이 컨테이너 운임 2주 연속 하락…수요 둔화 우려", source: "연합뉴스", time: "오전 8:00", url: "https://www.yna.co.kr" },
    { title: "한국 무역수지 4개월 연속 흑자…반도체 수출 견인", source: "매일경제", time: "오전 10:00", url: "https://www.mk.co.kr" },
  ],
};

export default function SoloDashboard() {
  const { user, firebaseUid } = useUser();
  const userId = user?.id ?? firebaseUid;
  const { scores } = usePublicScores();
  const { portfolio, snapshots } = useSoloPortfolio(userId);

  const startingValue = 1_000_000;
  const currentValue = portfolio?.currentValue ?? startingValue;

  // Today's return from last snapshot, or 0 if not yet run
  const dailyReturn = useMemo(() => {
    if (snapshots.length === 0) return 0;
    return snapshots[snapshots.length - 1].dailyReturn;
  }, [snapshots]);

  const cumReturn = ((currentValue / startingValue) - 1) * 100;

  // Chart history
  const chartData = useMemo(() => {
    if (snapshots.length > 0) {
      return snapshots.map(s => ({ v: s.value }));
    }
    return [{ v: currentValue }];
  }, [snapshots, currentValue]);

  // My sectors from portfolio allocations
  const mySectors = useMemo(() => {
    if (!portfolio?.allocations) return [];
    return portfolio.allocations
      .filter(a => a.sectorId !== "cash" && a.weight > 0)
      .map(a => {
        const meta = SECTOR_META[a.sectorId] ?? { name: a.sectorId, icon: "📊" };
        const score = scores?.sectorScores?.find(s => s.sectorId === a.sectorId);
        return {
          id: a.sectorId,
          name: meta.name,
          icon: meta.icon,
          weight: Math.round(a.weight * 100),
          dailyReturn: score?.dailyReturn ?? 0,
        };
      });
  }, [portfolio, scores]);

  // Today's sector movers from publicScores (top 3 by abs return)
  const todayMovers = useMemo(() => {
    if (!scores?.sectorScores?.length) return [];
    return [...scores.sectorScores]
      .sort((a, b) => b.impactScore - a.impactScore)
      .slice(0, 5)
      .map(s => ({
        name: SECTOR_META[s.sectorId]?.name ?? s.sectorName,
        icon: SECTOR_META[s.sectorId]?.icon ?? "📊",
        return: s.dailyReturn,
        rank: s.rank,
      }));
  }, [scores]);

  // News tabs — use publicScores order if available, otherwise default order
  const newsTabSectors = useMemo(() => {
    const SECTOR_ORDER = Object.keys(SECTOR_META);
    if (scores?.sectorScores?.length) {
      return [...scores.sectorScores]
        .sort((a, b) => b.impactScore - a.impactScore)
        .map(s => ({
          id: s.sectorId,
          name: SECTOR_META[s.sectorId]?.name ?? s.sectorName,
          icon: SECTOR_META[s.sectorId]?.icon ?? "📊",
          todayReturn: s.dailyReturn,
        }));
    }
    return SECTOR_ORDER.map(id => ({
      id,
      name: SECTOR_META[id].name,
      icon: SECTOR_META[id].icon,
      todayReturn: 0,
    }));
  }, [scores]);

  const [activeNewsTab, setActiveNewsTab] = useState<string>("semiconductor");

  const rank = 0;
  const totalUsers = 3841;

  return (
    <div className="space-y-5 max-w-5xl mx-auto">

      {/* Greeting */}
      <div className="pt-1">
        <h1 className="text-2xl font-display font-bold text-slate-800">
          안녕하세요, {user?.displayName ?? "투자자"}님 👋
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">오늘 뉴스를 보고 섹터에 투자해보세요</p>
      </div>

      {/* Portfolio Value Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20"
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm opacity-80">내 포트폴리오</div>
            <div className="text-4xl font-display font-bold mt-1">
              {currentValue.toLocaleString()}원
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className={cn(
                "flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-full",
                dailyReturn >= 0 ? "bg-white/20" : "bg-red-400/30"
              )}>
                {dailyReturn >= 0 ? <TrendingUpIcon className="w-3.5 h-3.5" /> : <TrendingDownIcon className="w-3.5 h-3.5" />}
                오늘 {dailyReturn >= 0 ? "+" : ""}{dailyReturn.toFixed(2)}%
              </span>
              <span className="text-sm opacity-80">
                누적 {cumReturn >= 0 ? "+" : ""}{cumReturn.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-80 flex items-center gap-1 justify-end">
              <TrophyIcon className="w-3.5 h-3.5" /> 전체 랭킹
            </div>
            <div className="text-2xl font-display font-bold mt-1">
              {rank > 0 ? `${rank}위` : "-"}
            </div>
            <div className="text-xs opacity-70 mt-0.5">
              {rank > 0 ? `/${totalUsers.toLocaleString()}명` : "투자 후 집계"}
            </div>
          </div>
        </div>
        <div className="mt-4 h-14 opacity-70">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="soloGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="#fff" strokeWidth={2} fill="url(#soloGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 오늘 투자하기 CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="bg-white border-2 border-emerald-200 rounded-2xl p-5 flex items-center justify-between shadow-sm"
      >
        <div>
          <div className="font-bold text-slate-800 text-base flex items-center gap-2">
            <ZapIcon className="w-4 h-4 text-emerald-500" />
            오늘 섹터 투자하기
          </div>
          <div className="text-sm text-slate-500 mt-0.5">
            뉴스를 보고 어떤 섹터가 오를지 예측해서 비중을 설정하세요
          </div>
        </div>
        <Link
          href="/solo/portfolio"
          className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors whitespace-nowrap shadow-sm shadow-emerald-200"
        >
          투자하기 <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </motion.div>

      {/* My Sectors + Today's Movers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* My Sectors */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-700 text-sm flex items-center gap-2">
              <ZapIcon className="w-4 h-4 text-emerald-500" />
              현재 내 섹터 배분
            </h2>
            <Link
              href="/solo/portfolio"
              className="text-xs text-emerald-600 hover:underline font-semibold flex items-center gap-1"
            >
              변경 <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>
          {mySectors.length > 0 ? (
            <div className="space-y-3">
              {mySectors.map(s => (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-xl w-8 text-center">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                      <span className={cn(
                        "text-xs font-bold",
                        s.dailyReturn >= 0 ? "text-emerald-600" : "text-red-500"
                      )}>
                        {scores ? (s.dailyReturn >= 0 ? "+" : "") + s.dailyReturn.toFixed(1) + "%" : "-"}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${s.weight}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 w-8 text-right font-medium">{s.weight}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-sm text-slate-400">아직 투자 배분이 없어요</p>
              <Link href="/solo/portfolio" className="mt-2 inline-block text-xs text-emerald-600 font-semibold hover:underline">
                지금 투자하기 →
              </Link>
            </div>
          )}
        </div>

        {/* Today's Movers */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-slate-700 text-sm flex items-center gap-2 mb-4">
            오늘의 섹터 현황
            {!scores && <span className="text-[10px] text-slate-400 font-normal">장 마감 후 업데이트</span>}
          </h2>
          {todayMovers.length > 0 ? (
            <div className="space-y-2">
              {todayMovers.map((m, i) => (
                <div
                  key={m.name}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                    i === 0 ? "bg-emerald-50 border border-emerald-100" : "bg-slate-50 hover:bg-slate-100"
                  )}
                >
                  <span className="text-base w-6 text-center">{m.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-700">{m.name}</div>
                    <div className="text-xs text-slate-400">{m.rank}위</div>
                  </div>
                  <span className={cn(
                    "text-sm font-bold",
                    m.return >= 0 ? "text-emerald-600" : "text-red-500"
                  )}>
                    {m.return >= 0 ? "+" : ""}{m.return.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(SECTOR_META).slice(0, 5).map(([id, meta], i) => (
                <div key={id} className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl",
                  i === 0 ? "bg-slate-100" : "bg-slate-50"
                )}>
                  <span className="text-base w-6 text-center">{meta.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-700">{meta.name}</div>
                    <div className="text-xs text-slate-400">집계 전</div>
                  </div>
                  <span className="text-sm font-bold text-slate-300">-</span>
                </div>
              ))}
            </div>
          )}
          <Link
            href="/solo/portfolio"
            className="mt-3 flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors"
          >
            전체 섹터 보기 <ArrowRightIcon className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Today's News — 섹터별 탭 */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* 헤더 */}
        <div className="px-5 pt-4 pb-0">
          <h2 className="font-bold text-slate-700 text-sm flex items-center gap-2 mb-3">
            <NewspaperIcon className="w-4 h-4 text-indigo-500" />
            오늘의 주요 뉴스
          </h2>
          {/* 섹터 탭 */}
          <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-none">
            {newsTabSectors.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveNewsTab(s.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-bold whitespace-nowrap transition-all border-b-2",
                  activeNewsTab === s.id
                    ? "bg-slate-50 border-indigo-500 text-indigo-700"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                )}
              >
                <span>{s.icon}</span>
                <span>{s.name}</span>
                {scores && (
                  <span className={cn(
                    "text-[10px] font-bold",
                    s.todayReturn >= 0 ? "text-emerald-600" : "text-red-500"
                  )}>
                    {s.todayReturn >= 0 ? "+" : ""}{s.todayReturn.toFixed(1)}%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 뉴스 목록 */}
        <div className="bg-slate-50 border-t border-slate-100 divide-y divide-slate-100">
          {(MOCK_NEWS[activeNewsTab] ?? []).map((n, i) => (
            <a
              key={i}
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 px-5 py-3 hover:bg-slate-100 transition-colors group"
            >
              <span className="text-xs font-bold text-slate-400 mt-0.5 w-4 flex-shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {n.title}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{n.source} · {n.time}</div>
              </div>
              <ExternalLinkIcon className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors flex-shrink-0 mt-0.5" />
            </a>
          ))}
          {(MOCK_NEWS[activeNewsTab] ?? []).length === 0 && (
            <div className="px-5 py-6 text-center text-sm text-slate-400">
              해당 섹터 뉴스를 준비 중이에요
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
