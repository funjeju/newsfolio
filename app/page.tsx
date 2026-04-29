"use client";

import { useState } from "react";
import { MOCK_SECTORS, MOCK_IMPACTS } from "@/lib/mockData";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import Link from "next/link";
import {
  ArrowRightIcon, TrendingUpIcon, BookOpenIcon, UsersIcon,
  ExternalLinkIcon, ChevronDownIcon, ChevronUpIcon,
  NewspaperIcon, LayoutDashboardIcon, SparklesIcon, ZapIcon,
} from "lucide-react";
import { useUser } from "@/lib/hooks/useUser";
import { cn } from "@/lib/utils";
import * as motion from "framer-motion/client";

// 섹터별 참조 뉴스 (mock)
const SECTOR_NEWS: Record<string, { title: string; source: string; url: string; time: string }[]> = {
  semiconductor: [
    { title: "미국 상무부, 반도체 수출 규제 완화 방침 발표…HBM 포함", source: "한국경제", url: "https://www.hankyung.com", time: "2시간 전" },
    { title: "삼성·SK하이닉스, HBM3E 글로벌 공급 계약 잇따라 체결", source: "조선비즈", url: "https://biz.chosun.com", time: "4시간 전" },
    { title: "AI 서버 수요 급증…글로벌 반도체 재고 빠르게 소진", source: "전자신문", url: "https://www.etnews.com", time: "6시간 전" },
  ],
  game: [
    { title: "넥슨 신작 '아크 레이더스', 글로벌 출시 첫날 매출 신기록", source: "게임메카", url: "https://www.gamemeca.com", time: "3시간 전" },
    { title: "크래프톤 'PUBG 모바일', 동남아 MAU 3000만 돌파", source: "연합뉴스", url: "https://www.yna.co.kr", time: "5시간 전" },
  ],
  green_energy: [
    { title: "정부, 신재생에너지 보조금 2조 원 추가 편성…태양광·풍력 집중", source: "매일경제", url: "https://www.mk.co.kr", time: "1시간 전" },
    { title: "한국전력, 해상풍력 3GW 프로젝트 본격 착공", source: "에너지경제", url: "https://www.ekn.kr", time: "4시간 전" },
  ],
  automotive: [
    { title: "현대차 전기차 유럽 판매 전월 대비 8% 증가…점유율 확대", source: "한국경제", url: "https://www.hankyung.com", time: "3시간 전" },
    { title: "기아 EV9, 미국 SUV 시장서 호평…3분기 추가 물량 투입 예정", source: "조선비즈", url: "https://biz.chosun.com", time: "7시간 전" },
  ],
  travel: [
    { title: "4월 해외 출국자 전년 동기 대비 5% 증가…일본·동남아 수요 견조", source: "연합뉴스", url: "https://www.yna.co.kr", time: "2시간 전" },
    { title: "항공권 가격 소폭 안정세…여름 성수기 예약률은 높아", source: "여행신문", url: "https://www.traveltimes.co.kr", time: "5시간 전" },
  ],
  content: [
    { title: "넷플릭스 1분기 가입자 증가세 둔화…국내 OTT도 타격 우려", source: "매일경제", url: "https://www.mk.co.kr", time: "2시간 전" },
    { title: "티빙·웨이브 합병 논의 재개…수익성 개선 시급", source: "조선비즈", url: "https://biz.chosun.com", time: "6시간 전" },
  ],
  global_trade: [
    { title: "홍해 사태 장기화…컨테이너 운임 4주 연속 상승세", source: "한국무역신문", url: "https://www.weeklytrade.co.kr", time: "1시간 전" },
    { title: "수출 중소기업, 해상 운임 상승에 채산성 악화 경고", source: "뉴시스", url: "https://www.newsis.com", time: "4시간 전" },
  ],
  food: [
    { title: "시카고 밀 선물, 2주 만에 8% 급등…국내 제분 업체 비용 압박", source: "연합뉴스", url: "https://www.yna.co.kr", time: "3시간 전" },
    { title: "설탕 국제 가격 3년래 최고치…국내 식품 업체 원가 부담 가중", source: "식품음료신문", url: "https://www.thinkfood.co.kr", time: "5시간 전" },
  ],
  geopolitics: [
    { title: "미·중 무역 협상 결렬…상호 관세 추가 부과 임박", source: "연합뉴스", url: "https://www.yna.co.kr", time: "1시간 전" },
    { title: "중동 긴장 고조, 유가 배럴당 90달러 돌파 가능성 제기", source: "한국경제", url: "https://www.hankyung.com", time: "3시간 전" },
    { title: "한·미·일 3국 안보 협력 강화 회의…시장 불확실성 지속", source: "매일경제", url: "https://www.mk.co.kr", time: "5시간 전" },
  ],
  construction: [
    { title: "부동산 PF 부실 5조 원 규모 확인…금융권 충당금 적립 압박", source: "한국경제", url: "https://www.hankyung.com", time: "2시간 전" },
    { title: "4월 건설 수주액 전년 대비 31% 급감…업계 위기감 고조", source: "건설경제", url: "https://www.cnews.co.kr", time: "4시간 전" },
    { title: "중소 건설사 연쇄 폐업 우려…정부 긴급 자금 지원 검토", source: "뉴시스", url: "https://www.newsis.com", time: "6시간 전" },
  ],
};

const SCORE_COLOR = (score: number) => {
  if (score >= 3) return "text-emerald-400";
  if (score >= 1) return "text-emerald-300";
  if (score === 0) return "text-slate-400";
  if (score >= -2) return "text-red-300";
  return "text-red-500";
};

const RETURN_COLOR = (r: number) =>
  r > 0 ? "text-emerald-400" : r < 0 ? "text-red-400" : "text-slate-400";

export default function PublicLeaderboardPage() {
  const { user, isLoading } = useUser();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = [...MOCK_IMPACTS].sort((a, b) => b.dailyReturn - a.dailyReturn);
  const dashboardHref = user?.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard";

  return (
    <div className="min-h-screen bg-background">
      {/* ── 헤더 ── */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-bold text-xl">
            <span>📰</span>
            <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
              Newsfolio
            </span>
          </div>

          <div className="flex items-center gap-3">
            {!isLoading && user ? (
              // 로그인 상태
              <Link
                href={dashboardHref}
                className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl text-sm font-bold hover:bg-brand-600 transition-colors"
              >
                <LayoutDashboardIcon className="w-4 h-4" />
                내 대시보드
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            ) : (
              // 비로그인 상태
              <>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  로그인
                </Link>
                <Link
                  href="/join"
                  className="text-sm px-4 py-2 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition-colors"
                >
                  시작하기
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-12">
        {/* ── 히어로 ── */}
        <section className="text-center space-y-5 pt-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-400 bg-brand-500/10 border border-brand-500/20 px-3 py-1.5 rounded-full"
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            오늘의 AI 경제 분석 공개 중
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl md:text-5xl font-display font-bold leading-tight"
          >
            뉴스로 배우는<br />
            <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
              경제 시뮬레이션
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed"
          >
            AI가 어제 뉴스를 분석해 섹터별 영향도를 매일 아침 점수로 알려줘요.<br />
            선생님과 함께하면 직접 이의제기하고 포트폴리오도 운영할 수 있어요!
          </motion.p>

          {!isLoading && !user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="flex items-center justify-center gap-3 flex-wrap"
            >
              <Link
                href="/join"
                className="flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-2xl font-bold hover:bg-brand-600 transition-colors shadow-[0_4px_20px_rgba(99,102,241,0.4)]"
              >
                학급 코드로 참여하기 <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-border/50 rounded-2xl font-medium hover:bg-white/10 transition-colors"
              >
                로그인
              </Link>
            </motion.div>
          )}
        </section>

        {/* ── 섹터 리더보드 ── */}
        <section className="glass rounded-3xl border border-border/50 overflow-hidden">
          {/* 헤더 */}
          <div className="p-5 border-b border-border/50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <ZapIcon className="w-5 h-5 text-yellow-400" />
                오늘의 섹터 순위
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                AI가 분석한 어제 뉴스 영향도 · 매일 오전 6시 업데이트
              </p>
            </div>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold animate-pulse">
              LIVE
            </span>
          </div>

          {/* 테이블 헤더 */}
          <div className="hidden md:grid grid-cols-[2.5rem_1fr_8rem_6rem_9rem] gap-4 px-6 py-2.5 bg-white/5 border-b border-border/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="text-center">#</div>
            <div>섹터</div>
            <div className="text-center">AI 영향도</div>
            <div className="text-right">등락률</div>
            <div className="text-center">뉴스 근거</div>
          </div>

          <div className="divide-y divide-border/20">
            {sorted.map((impact, i) => {
              const sector = MOCK_SECTORS.find(s => s.id === impact.sectorId)!;
              const news = SECTOR_NEWS[impact.sectorId] ?? [];
              const isExpanded = expandedId === impact.sectorId;
              const rankChange = impact.rankChange;

              return (
                <motion.div
                  key={sector.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  {/* 섹터 행 */}
                  <div className="grid grid-cols-[2.5rem_1fr_auto] md:grid-cols-[2.5rem_1fr_8rem_6rem_9rem] gap-3 md:gap-4 px-4 md:px-6 py-4 items-center hover:bg-white/5 transition-colors">
                    {/* 순위 */}
                    <div className="text-center text-lg font-bold">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (
                        <span className="text-sm text-muted-foreground">{i + 1}</span>
                      )}
                    </div>

                    {/* 섹터명 + AI 요약 */}
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{sector.icon}</span>
                      <div className="min-w-0">
                        <div className="font-bold flex items-center gap-2">
                          {sector.name}
                          {rankChange !== 0 && (
                            <span className={cn("text-xs font-semibold", rankChange > 0 ? "text-emerald-400" : "text-red-400")}>
                              {rankChange > 0 ? `▲${rankChange}` : `▼${Math.abs(rankChange)}`}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">
                          {impact.rationaleSummary}
                        </div>
                      </div>
                    </div>

                    {/* AI 영향도 뱃지 */}
                    <div className="hidden md:flex justify-center">
                      <ScoreBadge score={impact.impactScore} />
                    </div>

                    {/* 등락률 */}
                    <div className={cn("hidden md:block text-right font-mono font-bold text-sm", RETURN_COLOR(impact.dailyReturn))}>
                      {impact.dailyReturn > 0 ? "+" : ""}{impact.dailyReturn.toFixed(2)}%
                    </div>

                    {/* 뉴스 보기 버튼 */}
                    <div className="flex items-center justify-end md:justify-center">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : impact.sectorId)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                          isExpanded
                            ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                            : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground border border-border/40"
                        )}
                      >
                        <NewspaperIcon className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">뉴스 {news.length}건</span>
                        {isExpanded
                          ? <ChevronUpIcon className="w-3.5 h-3.5" />
                          : <ChevronDownIcon className="w-3.5 h-3.5" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* 뉴스 펼침 */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 md:px-6 pb-4 bg-white/3 border-t border-border/20"
                    >
                      <p className="text-xs text-muted-foreground pt-3 pb-2 flex items-center gap-1.5">
                        <SparklesIcon className="w-3 h-3 text-brand-400" />
                        AI가 이 뉴스들을 참조해 점수를 산정했어요
                      </p>
                      <div className="space-y-2">
                        {news.map((item, ni) => (
                          <a
                            key={ni}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start justify-between gap-3 p-3 rounded-xl bg-white/5 border border-border/30 hover:bg-white/10 hover:border-brand-500/30 transition-colors group"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium leading-snug group-hover:text-brand-300 transition-colors line-clamp-2">
                                {item.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-xs text-brand-400 font-semibold">{item.source}</span>
                                <span className="text-xs text-muted-foreground">·</span>
                                <span className="text-xs text-muted-foreground">{item.time}</span>
                              </div>
                            </div>
                            <ExternalLinkIcon className="w-4 h-4 text-muted-foreground group-hover:text-brand-400 transition-colors shrink-0 mt-0.5" />
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="px-6 py-4 bg-white/5 border-t border-border/30 text-xs text-muted-foreground text-center">
            {user
              ? <span>📊 포트폴리오에서 내 섹터 성과를 확인해보세요 · <Link href={dashboardHref} className="text-brand-400 hover:underline">대시보드 바로가기 →</Link></span>
              : <span>🎓 전체 기능은 학급 코드로 참여하면 이용할 수 있어요 · <Link href="/join" className="text-brand-400 hover:underline">지금 참여하기 →</Link></span>
            }
          </div>
        </section>

        {/* ── 피처 카드 ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: <TrendingUpIcon className="w-6 h-6 text-brand-400" />,
              title: "AI 뉴스 분석",
              desc: "매일 오전 AI가 뉴스를 분석해 섹터별 영향도를 점수로 알려줘요. 어떤 뉴스가 왜 이 점수인지도 확인할 수 있어요.",
            },
            {
              icon: <BookOpenIcon className="w-6 h-6 text-purple-400" />,
              title: "이의제기로 배우기",
              desc: "AI 판단에 동의하지 않으면 뉴스 근거를 찾아 직접 이의제기할 수 있어요. 논리가 맞으면 점수가 바뀌어요!",
            },
            {
              icon: <UsersIcon className="w-6 h-6 text-emerald-400" />,
              title: "조별 포트폴리오",
              desc: "팀원들과 함께 섹터를 선택하고 포트폴리오를 운영해요. 누가 가장 정확히 예측하는지 겨뤄봐요.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="glass p-6 rounded-2xl border border-border/50 space-y-3 hover:border-brand-500/30 transition-colors"
            >
              {f.icon}
              <h3 className="font-bold text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </section>

        <footer className="text-center text-xs text-muted-foreground pb-8">
          © 2026 Newsfolio · 선생님 문의:{" "}
          <Link href="/login" className="text-brand-400 hover:underline">
            교사 계정으로 시작하기
          </Link>
        </footer>
      </main>
    </div>
  );
}
