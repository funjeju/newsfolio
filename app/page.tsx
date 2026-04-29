"use client";

import { useState } from "react";
import { MOCK_SECTORS, MOCK_IMPACTS } from "@/lib/mockData";
import Link from "next/link";
import {
  ArrowRightIcon, TrendingUpIcon, TrendingDownIcon,
  ExternalLinkIcon, LayoutDashboardIcon, SparklesIcon,
  ZapIcon, FlameIcon, TrophyIcon, ChevronDownIcon, ChevronUpIcon,
  NewspaperIcon,
} from "lucide-react";
import { useUser } from "@/lib/hooks/useUser";
import { cn } from "@/lib/utils";
import * as motion from "framer-motion/client";

// ── Mock Data ──────────────────────────────────────────────────

interface HeroNews {
  headline: string;
  summary: string;
  source: string;
  time: string;
  url: string;
  sectorName: string;
  sectorIcon: string;
  dailyReturn: number;
  impactScore: number;
}

const HOT_NEWS: HeroNews[] = [
  {
    headline: "미국 상무부, 반도체 수출 규제 완화 발표…HBM 포함",
    summary: "미 상무부가 HBM을 포함한 첨단 반도체 수출 규제를 일부 완화한다고 발표했다. 삼성·SK하이닉스 등 국내 기업들의 수혜가 예상된다.",
    source: "한국경제", time: "오전 7:30", url: "https://www.hankyung.com",
    sectorName: "반도체", sectorIcon: "💻", dailyReturn: 3.24, impactScore: 4,
  },
  {
    headline: "넥슨 신작 '아크 레이더스' 글로벌 출시 첫날 매출 신기록",
    summary: "넥슨의 신작 슈터 게임이 글로벌 서비스 첫날 역대 최고 동시 접속자 수를 기록했다.",
    source: "게임메카", time: "오전 9:10", url: "https://www.gamemeca.com",
    sectorName: "게임", sectorIcon: "🎮", dailyReturn: 2.11, impactScore: 3,
  },
  {
    headline: "정부, 신재생에너지 보조금 2조 원 추가 편성…태양광·ESS 수혜",
    summary: "정부가 친환경 에너지 전환 가속화를 위해 관련 기업 보조금을 2배로 늘리기로 했다.",
    source: "매일경제", time: "오전 8:45", url: "https://www.mk.co.kr",
    sectorName: "친환경에너지", sectorIcon: "🌱", dailyReturn: 1.45, impactScore: 2,
  },
];

const COLD_NEWS: HeroNews[] = [
  {
    headline: "부동산 PF 부실 5조 원 확인…중소 건설사 연쇄 위기 우려",
    summary: "금융권에서 확인된 부동산 PF 부실 규모가 5조 원을 넘어섰다. 중소 건설사 폐업 도미노 우려가 커지며 건설 섹터 전반이 압박을 받고 있다.",
    source: "매일경제", time: "오전 8:15", url: "https://www.mk.co.kr",
    sectorName: "건설", sectorIcon: "🏗️", dailyReturn: -4.89, impactScore: -5,
  },
  {
    headline: "미·중 무역 협상 결렬…상호 관세 추가 부과 임박",
    summary: "미국과 중국의 고위급 무역 협상이 합의 없이 종료됐다. 양측이 추가 관세를 예고하면서 글로벌 공급망 불안이 고조되고 있다.",
    source: "연합뉴스", time: "오전 7:55", url: "https://www.yna.co.kr",
    sectorName: "국제정세", sectorIcon: "🌐", dailyReturn: -3.67, impactScore: -4,
  },
  {
    headline: "시카고 밀 선물 2주 만에 8% 급등…국내 식품업계 원가 비상",
    summary: "국제 밀 가격이 급등하면서 라면·제분 업체들의 원가 부담이 크게 늘었다. 하반기 제품 가격 인상 가능성이 제기된다.",
    source: "한국경제", time: "오전 9:30", url: "https://www.hankyung.com",
    sectorName: "식품", sectorIcon: "🍔", dailyReturn: -2.14, impactScore: -3,
  },
];

const SECTOR_NEWS: Record<string, { title: string; source: string; url: string; time: string }[]> = {
  semiconductor: [
    { title: "미국 상무부, 반도체 수출 규제 완화…HBM 포함", source: "한국경제", url: "https://www.hankyung.com", time: "2시간 전" },
    { title: "삼성·SK하이닉스, HBM3E 글로벌 공급 계약 체결", source: "조선비즈", url: "https://biz.chosun.com", time: "4시간 전" },
    { title: "AI 서버 수요 급증…글로벌 반도체 재고 빠르게 소진", source: "전자신문", url: "https://www.etnews.com", time: "6시간 전" },
  ],
  game: [
    { title: "넥슨 신작 '아크 레이더스', 글로벌 출시 첫날 매출 신기록", source: "게임메카", url: "https://www.gamemeca.com", time: "3시간 전" },
    { title: "크래프톤 'PUBG 모바일', 동남아 MAU 3000만 돌파", source: "연합뉴스", url: "https://www.yna.co.kr", time: "5시간 전" },
  ],
  green_energy: [
    { title: "정부, 신재생에너지 보조금 2조 원 추가 편성", source: "매일경제", url: "https://www.mk.co.kr", time: "1시간 전" },
    { title: "한국전력, 해상풍력 3GW 프로젝트 본격 착공", source: "에너지경제", url: "https://www.ekn.kr", time: "4시간 전" },
  ],
  automotive: [
    { title: "현대차 전기차 유럽 판매 전월 대비 8% 증가", source: "한국경제", url: "https://www.hankyung.com", time: "3시간 전" },
    { title: "기아 EV9, 미국 SUV 시장서 호평…3분기 추가 물량 투입", source: "조선비즈", url: "https://biz.chosun.com", time: "7시간 전" },
  ],
  travel: [
    { title: "4월 해외 출국자 전년 대비 5% 증가…일본·동남아 수요 견조", source: "연합뉴스", url: "https://www.yna.co.kr", time: "2시간 전" },
    { title: "항공권 가격 소폭 안정세…여름 성수기 예약률은 높아", source: "여행신문", url: "https://www.traveltimes.co.kr", time: "5시간 전" },
  ],
  content: [
    { title: "넷플릭스 1분기 가입자 증가세 둔화…국내 OTT 타격 우려", source: "매일경제", url: "https://www.mk.co.kr", time: "2시간 전" },
    { title: "티빙·웨이브 합병 논의 재개…수익성 개선 시급", source: "조선비즈", url: "https://biz.chosun.com", time: "6시간 전" },
  ],
  global_trade: [
    { title: "홍해 사태 장기화…컨테이너 운임 4주 연속 상승세", source: "한국무역신문", url: "https://www.weeklytrade.co.kr", time: "1시간 전" },
    { title: "수출 중소기업, 해상 운임 상승에 채산성 악화 경고", source: "뉴시스", url: "https://www.newsis.com", time: "4시간 전" },
  ],
  food: [
    { title: "시카고 밀 선물, 2주 만에 8% 급등…국내 제분 업체 비용 압박", source: "연합뉴스", url: "https://www.yna.co.kr", time: "3시간 전" },
    { title: "설탕 국제 가격 3년래 최고치…식품 업체 원가 부담 가중", source: "식품음료신문", url: "https://www.thinkfood.co.kr", time: "5시간 전" },
  ],
  geopolitics: [
    { title: "미·중 무역 협상 결렬…상호 관세 추가 부과 임박", source: "연합뉴스", url: "https://www.yna.co.kr", time: "1시간 전" },
    { title: "중동 긴장 고조, 유가 배럴당 90달러 돌파 가능성", source: "한국경제", url: "https://www.hankyung.com", time: "3시간 전" },
  ],
  construction: [
    { title: "부동산 PF 부실 5조 원 규모 확인…금융권 충당금 적립 압박", source: "한국경제", url: "https://www.hankyung.com", time: "2시간 전" },
    { title: "4월 건설 수주액 전년 대비 31% 급감…업계 위기감 고조", source: "건설경제", url: "https://www.cnews.co.kr", time: "4시간 전" },
    { title: "중소 건설사 연쇄 폐업 우려…정부 긴급 자금 지원 검토", source: "뉴시스", url: "https://www.newsis.com", time: "6시간 전" },
  ],
};

const MOCK_RANKING = [
  { rank: 1,  name: "투●●",  portfolio: 1_182_000, cumReturn: 18.2,  today: 2.4,  sectors: ["반도체", "방산"] },
  { rank: 2,  name: "김●●",  portfolio: 1_153_000, cumReturn: 15.3,  today: 1.8,  sectors: ["방산", "에너지"] },
  { rank: 3,  name: "이●●",  portfolio: 1_141_000, cumReturn: 14.1,  today: 1.1,  sectors: ["반도체"] },
  { rank: 4,  name: "박●●",  portfolio: 1_120_000, cumReturn: 12.0,  today: 0.9,  sectors: ["바이오", "에너지"] },
  { rank: 5,  name: "정●●",  portfolio: 1_098_000, cumReturn: 9.8,   today: -0.2, sectors: ["금융"] },
  { rank: 6,  name: "최●●",  portfolio: 1_087_000, cumReturn: 8.7,   today: 0.5,  sectors: ["반도체", "자동차"] },
  { rank: 7,  name: "강●●",  portfolio: 1_075_000, cumReturn: 7.5,   today: 1.2,  sectors: ["방산"] },
  { rank: 8,  name: "조●●",  portfolio: 1_063_000, cumReturn: 6.3,   today: -0.8, sectors: ["바이오"] },
  { rank: 9,  name: "윤●●",  portfolio: 1_051_000, cumReturn: 5.1,   today: 0.3,  sectors: ["금융"] },
  { rank: 10, name: "장●●",  portfolio: 1_039_000, cumReturn: 3.9,   today: 0.7,  sectors: ["식품"] },
];

// ── Main Component ─────────────────────────────────────────────
export default function PublicLeaderboardPage() {
  const { user, isLoading } = useUser();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = [...MOCK_IMPACTS].sort((a, b) => b.dailyReturn - a.dailyReturn);
  const top3 = sorted.slice(0, 3);
  const dashboardHref =
    user?.role === "teacher" ? "/teacher/dashboard" :
    user?.role === "solo" ? "/solo/dashboard" :
    "/student/dashboard";

  return (
    <div className="min-h-screen bg-background">

      {/* ── 헤더 ── */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-bold text-xl">
            <span>📰</span>
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Newsfolio
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            {!isLoading && user ? (
              <Link
                href={dashboardHref}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <LayoutDashboardIcon className="w-4 h-4" />
                내 대시보드 <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-slate-500 hover:text-slate-800 font-medium">
                  로그인
                </Link>
                <Link href="/join" className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                  시작하기
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* ── 히어로 타이틀 ── */}
        <section className="text-center space-y-3 pt-2">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            2026년 4월 29일 · AI 분석 완료
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl md:text-4xl font-display font-bold"
          >
            오늘 어떤 뉴스가{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              경제를 움직였나요?
            </span>
          </motion.h1>
        </section>

        {/* ── TOP 3 상승 섹터 ── */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 px-1">
            <TrendingUpIcon className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide">🚀 오늘 TOP 3 상승 섹터</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {top3.map((impact, i) => {
              const sector = MOCK_SECTORS.find(s => s.id === impact.sectorId)!;
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <motion.div
                  key={sector.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={cn(
                    "relative rounded-2xl p-4 overflow-hidden border",
                    i === 0
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white"
                      : i === 1
                      ? "bg-gradient-to-br from-emerald-400 to-emerald-500 border-emerald-300 text-white"
                      : "bg-gradient-to-br from-teal-400 to-emerald-400 border-teal-300 text-white"
                  )}
                >
                  <div className="absolute top-2 right-3 text-2xl opacity-80">{sector.icon}</div>
                  <div className="text-xs font-bold opacity-80 mb-1">{medals[i]} {i + 1}위</div>
                  <div className="font-bold text-base md:text-lg leading-tight">{sector.name}</div>
                  <div className="text-2xl md:text-3xl font-display font-bold mt-1">
                    +{impact.dailyReturn.toFixed(2)}%
                  </div>
                  <div className="text-xs opacity-70 mt-0.5 line-clamp-1 hidden sm:block">
                    {impact.rationaleSummary}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── 메인 그리드: 강력한 한방 + 섹터 전체 순위 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* 오늘의 강력한 한방 (상승) */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3 rounded-2xl overflow-hidden border border-amber-200 shadow-md"
          >
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold">
                <FlameIcon className="w-5 h-5" />
                오늘의 강력한 한방 🔥
              </div>
              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                TOP {HOT_NEWS.length}
              </span>
            </div>
            <div className="bg-white divide-y divide-slate-100">
              {HOT_NEWS.map((news, idx) => (
                <div key={idx} className={cn("p-4 space-y-1.5", idx === 0 ? "p-5" : "")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <span className={cn(
                        "flex-shrink-0 font-bold text-amber-500 mt-0.5",
                        idx === 0 ? "text-base" : "text-sm"
                      )}>
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                      </span>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full mr-1.5">
                          {news.sectorIcon} {news.sectorName}
                        </span>
                        <h3 className={cn(
                          "font-bold text-slate-800 leading-snug mt-1",
                          idx === 0 ? "text-base md:text-lg" : "text-sm"
                        )}>
                          {news.headline}
                        </h3>
                        {idx === 0 && (
                          <p className="text-sm text-slate-500 leading-relaxed mt-1.5">{news.summary}</p>
                        )}
                      </div>
                    </div>
                    <span className={cn(
                      "font-display font-bold text-emerald-600 whitespace-nowrap flex-shrink-0",
                      idx === 0 ? "text-2xl" : "text-base"
                    )}>
                      +{news.dailyReturn.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between pl-7">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="font-semibold text-indigo-600">{news.source}</span>
                      <span>·</span>
                      <span>{news.time}</span>
                    </div>
                    <a
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-800 transition-colors"
                    >
                      보기 <ExternalLinkIcon className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 섹터 전체 순위 (compact) */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 }}
            className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                <ZapIcon className="w-4 h-4 text-indigo-500" />
                오늘의 섹터 순위
              </h3>
              <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                LIVE
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {sorted.map((impact, i) => {
                const sector = MOCK_SECTORS.find(s => s.id === impact.sectorId)!;
                const isUp = impact.dailyReturn > 0;
                const news = SECTOR_NEWS[impact.sectorId] ?? [];
                const isExp = expandedId === impact.sectorId;
                return (
                  <div key={sector.id}>
                    <button
                      onClick={() => setExpandedId(isExp ? null : impact.sectorId)}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 transition-colors text-left"
                    >
                      <span className="text-sm font-bold text-slate-400 w-4 text-center flex-shrink-0">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                      </span>
                      <span className="text-base">{sector.icon}</span>
                      <span className="text-sm font-semibold text-slate-700 flex-1 truncate">{sector.name}</span>
                      <span className={cn(
                        "text-sm font-bold font-mono flex-shrink-0",
                        isUp ? "text-emerald-600" : impact.dailyReturn < 0 ? "text-red-500" : "text-slate-400"
                      )}>
                        {isUp ? "+" : ""}{impact.dailyReturn.toFixed(2)}%
                      </span>
                      {news.length > 0 && (
                        isExp
                          ? <ChevronUpIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          : <ChevronDownIcon className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                      )}
                    </button>
                    {isExp && news.length > 0 && (
                      <div className="px-4 pb-3 space-y-1.5 bg-slate-50">
                        {news.slice(0, 2).map((n, ni) => (
                          <a
                            key={ni}
                            href={n.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-slate-600 hover:text-indigo-600 transition-colors"
                          >
                            <NewspaperIcon className="w-3 h-3 flex-shrink-0 text-slate-400" />
                            <span className="line-clamp-1">{n.title}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* ── 아래로 한방 + 수익률 랭킹 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* 오늘의 아래로 한방 (하락) */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18 }}
            className="lg:col-span-3 rounded-2xl overflow-hidden border border-rose-200 shadow-md"
          >
            <div className="bg-gradient-to-r from-rose-500 to-red-600 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold">
                <TrendingDownIcon className="w-5 h-5" />
                오늘의 아래로 한방 💥
              </div>
              <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                TOP {COLD_NEWS.length}
              </span>
            </div>
            <div className="bg-white divide-y divide-slate-100">
              {COLD_NEWS.map((news, idx) => (
                <div key={idx} className={cn("p-4 space-y-1.5", idx === 0 ? "p-5" : "")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <span className={cn(
                        "flex-shrink-0 font-bold text-rose-400 mt-0.5",
                        idx === 0 ? "text-base" : "text-sm"
                      )}>
                        {idx === 0 ? "💥" : idx === 1 ? "🔻" : "📉"}
                      </span>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-full mr-1.5">
                          {news.sectorIcon} {news.sectorName}
                        </span>
                        <h3 className={cn(
                          "font-bold text-slate-800 leading-snug mt-1",
                          idx === 0 ? "text-base md:text-lg" : "text-sm"
                        )}>
                          {news.headline}
                        </h3>
                        {idx === 0 && (
                          <p className="text-sm text-slate-500 leading-relaxed mt-1.5">{news.summary}</p>
                        )}
                      </div>
                    </div>
                    <span className={cn(
                      "font-display font-bold text-red-500 whitespace-nowrap flex-shrink-0",
                      idx === 0 ? "text-2xl" : "text-base"
                    )}>
                      {news.dailyReturn.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between pl-7">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="font-semibold text-indigo-600">{news.source}</span>
                      <span>·</span>
                      <span>{news.time}</span>
                    </div>
                    <a
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors"
                    >
                      보기 <ExternalLinkIcon className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 수익률 랭킹 TOP10 */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-1.5 text-sm">
                  <TrophyIcon className="w-4 h-4" />
                  오늘의 수익률 랭킹
                </h3>
                <span className="text-[10px] text-white/70">전체 참여자 {(3841).toLocaleString()}명</span>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {MOCK_RANKING.map((entry) => {
                const medals: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
                const isTop = entry.rank <= 3;
                return (
                  <div
                    key={entry.rank}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5",
                      isTop ? "bg-indigo-50/60" : "hover:bg-slate-50"
                    )}
                  >
                    <div className="w-6 text-center flex-shrink-0">
                      {medals[entry.rank] ?? (
                        <span className="text-xs font-bold text-slate-400">{entry.rank}</span>
                      )}
                    </div>
                    {/* 이름 블러 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-800">{entry.name}</span>
                        <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                          {entry.sectors.slice(0, 2).join("·")}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">{entry.portfolio.toLocaleString()}원</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={cn(
                        "text-sm font-bold",
                        entry.cumReturn >= 0 ? "text-emerald-600" : "text-red-500"
                      )}>
                        +{entry.cumReturn.toFixed(1)}%
                      </div>
                      <div className={cn(
                        "text-[10px] font-medium",
                        entry.today >= 0 ? "text-emerald-500" : "text-red-400"
                      )}>
                        오늘 {entry.today >= 0 ? "+" : ""}{entry.today.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-3 border-t border-slate-100 text-center">
              <Link href="/join" className="text-xs text-indigo-600 font-bold hover:underline">
                랭킹에 참여하기 →
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ── 참여 CTA (비로그인) ── */}
        {!isLoading && !user && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white text-center space-y-4"
          >
            <div className="text-2xl font-display font-bold">
              직접 참여해서 포트폴리오를 운영해보세요 🚀
            </div>
            <p className="text-white/80 text-sm">
              AI 분석에 이의제기하고, 팀원들과 섹터를 선택해서 누가 가장 정확히 예측하는지 겨뤄봐요.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/join" className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-sm">
                학급 코드로 참여하기 <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link href="/join" className="flex items-center gap-2 px-5 py-3 bg-white/20 rounded-xl font-semibold hover:bg-white/30 transition-colors text-sm">
                혼자 참여하기
              </Link>
            </div>
          </motion.section>
        )}

        <footer className="text-center text-xs text-slate-400 pb-6 pt-2">
          © 2026 Newsfolio · 이름은 개인정보 보호를 위해 블러 처리됩니다 ·{" "}
          <Link href="/login" className="text-indigo-500 hover:underline">교사 계정으로 시작하기</Link>
        </footer>
      </main>
    </div>
  );
}
