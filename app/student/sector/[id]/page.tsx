"use client";

import { use, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MOCK_SECTORS, MOCK_IMPACTS, MOCK_USER_PORTFOLIO } from "@/lib/mockData";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import {
  ArrowLeftIcon, ArrowUpIcon, ArrowDownIcon, MinusIcon,
  TrendingUpIcon, StarIcon, ZapIcon, PieChartIcon,
  BookOpenIcon, MessageSquarePlusIcon, SearchIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as motion from "framer-motion/client";
import Link from "next/link";
import {
  ResponsiveContainer, LineChart, Line, CartesianGrid,
  XAxis, YAxis, Tooltip,
} from "recharts";

// Mock sector daily history (past 7 days)
function generateSectorHistory(impactScore: number) {
  const base = impactScore * 0.5;
  return Array.from({ length: 7 }, (_, i) => ({
    date: `04-${22 + i}`,
    return: parseFloat((base + (Math.random() - 0.5) * 1.5).toFixed(2)),
  }));
}

const GLOSSARY_BY_SECTOR: Record<string, { term: string; summary: string }[]> = {
  semiconductor: [
    { term: "HBM", summary: "AI 서버에 쓰는 초고속 메모리 반도체예요." },
    { term: "수출 규제", summary: "다른 나라에 물건을 팔지 못하게 막는 규칙이에요." },
    { term: "공급망", summary: "물건이 만들어져서 우리 손에 올 때까지의 모든 과정이에요." },
  ],
  automotive: [
    { term: "전기차", summary: "전기로 움직이는 자동차예요. 배터리가 핵심이에요." },
    { term: "원자재", summary: "물건을 만드는 데 필요한 재료예요." },
  ],
  game: [
    { term: "OTT", summary: "인터넷으로 영상·게임을 즐기는 플랫폼이에요." },
    { term: "수익률", summary: "투자한 돈이 얼마나 늘었는지 퍼센트로 나타낸 거예요." },
  ],
  green_energy: [
    { term: "ESG", summary: "환경, 사회, 지배구조를 고려한 투자 방식이에요." },
    { term: "친환경에너지", summary: "태양·바람·물로 만드는 깨끗한 에너지예요." },
  ],
  construction: [
    { term: "부동산 PF", summary: "건물을 짓기 위해 빌린 돈이에요. 못 갚으면 위기가 와요." },
    { term: "금리", summary: "돈을 빌릴 때 내는 이자율이에요." },
  ],
  food: [
    { term: "원자재", summary: "물건을 만드는 데 필요한 재료예요." },
    { term: "인플레이션", summary: "물건 값이 전체적으로 오르는 현상이에요." },
  ],
  global_trade: [
    { term: "해상 운임", summary: "배로 물건을 실어나르는 비용이에요." },
    { term: "관세", summary: "다른 나라에서 온 물건에 추가로 내는 세금이에요." },
  ],
  geopolitics: [
    { term: "무역전쟁", summary: "두 나라가 서로 관세를 많이 매기며 싸우는 것이에요." },
    { term: "수출 규제", summary: "다른 나라에 물건을 팔지 못하게 막는 규칙이에요." },
  ],
  content: [
    { term: "OTT", summary: "인터넷으로 영상·게임을 즐기는 플랫폼이에요." },
    { term: "수익률", summary: "투자한 돈이 얼마나 늘었는지 퍼센트로 나타낸 거예요." },
  ],
  travel: [
    { term: "환율", summary: "나라와 나라 사이 돈의 교환 비율이에요." },
  ],
};

export default function SectorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "learn" ? "learn" : "analysis";
  const [tab, setTab] = useState<"analysis" | "history" | "learn">(initialTab as any);

  const sector = MOCK_SECTORS.find(s => s.id === id);
  const impact = MOCK_IMPACTS.find(i => i.sectorId === id);
  const isMine = MOCK_USER_PORTFOLIO.mySectors.includes(id);
  const myWeight = MOCK_USER_PORTFOLIO.myWeights[id];

  if (!sector || !impact) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-muted-foreground">섹터를 찾을 수 없습니다.</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-xl bg-brand-500/20 text-brand-400 font-bold hover:bg-brand-500/30 transition-colors"
        >
          돌아가기
        </button>
      </div>
    );
  }

  const isPositive = impact.dailyReturn > 0;
  const isNegative = impact.dailyReturn < 0;
  const isBigMover = Math.abs(impact.rankChange) >= 3;
  const sectorHistory = generateSectorHistory(impact.impactScore);
  const glossaryTerms = GLOSSARY_BY_SECTOR[id] ?? [];

  return (
    <main className="max-w-3xl mx-auto space-y-5 pb-10">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        돌아가기
      </button>

      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "glass p-6 md:p-8 rounded-3xl border relative overflow-hidden",
          isMine ? "border-brand-500/40" : isBigMover ? "border-amber-500/30" : "border-border/50"
        )}
      >
        {isMine && (
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        )}

        <div className="relative z-10">
          {/* Title */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{sector.icon}</div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-display font-bold">{sector.name}</h1>
                  {isBigMover && (
                    <span className="flex items-center gap-1 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                      <ZapIcon className="w-3 h-3" /> 오늘의 반전주
                    </span>
                  )}
                  {isMine && (
                    <span className="flex items-center gap-1 text-xs bg-brand-500/20 text-brand-400 border border-brand-500/30 px-2 py-0.5 rounded-full font-bold">
                      <StarIcon className="w-3 h-3 fill-brand-400" /> 내 섹터
                    </span>
                  )}
                </div>
                {isMine && myWeight !== undefined && (
                  <p className="text-sm text-brand-400 mt-0.5 font-medium">현재 비중 {myWeight}%</p>
                )}
              </div>
            </div>
            <ScoreBadge score={impact.impactScore} />
          </div>

          <ScoreGauge score={impact.impactScore} />

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2 mt-5">
            <div className="p-3 rounded-xl bg-white/5 border border-border/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">오늘 등락률</p>
              <p className={cn("text-xl font-bold", isPositive ? "text-score-up" : isNegative ? "text-score-down" : "text-muted-foreground")}>
                {isPositive ? "+" : ""}{impact.dailyReturn.toFixed(2)}%
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-border/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">영향도</p>
              <p className="text-xl font-bold">{impact.impactScore > 0 ? "+" : ""}{impact.impactScore}</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-border/50 text-center">
              <p className="text-xs text-muted-foreground mb-1">순위 변동</p>
              <div className="flex items-center justify-center gap-1 text-xl font-bold">
                {impact.rankChange > 0 ? (
                  <><ArrowUpIcon className="w-4 h-4 text-score-up" /><span className="text-score-up">+{impact.rankChange}</span></>
                ) : impact.rankChange < 0 ? (
                  <><ArrowDownIcon className="w-4 h-4 text-score-down" /><span className="text-score-down">{impact.rankChange}</span></>
                ) : (
                  <><MinusIcon className="w-4 h-4 text-muted-foreground" /><span className="text-muted-foreground text-sm">변동없음</span></>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
        {([
          { id: "analysis", label: "🔍 AI 분석", icon: SearchIcon },
          { id: "history", label: "📈 히스토리", icon: TrendingUpIcon },
          { id: "learn", label: "📚 학습", icon: BookOpenIcon },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-semibold transition-colors",
              tab === t.id ? "bg-brand-500 text-white" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Analysis Tab */}
      {tab === "analysis" && (
        <div className="space-y-4">
          <div className="glass p-5 rounded-2xl border border-brand-500/20 bg-brand-500/5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUpIcon className="w-4 h-4 text-brand-400" />
              <span className="text-sm font-bold text-brand-400">AI 분석 요약</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{impact.rationaleSummary}</p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href={`/student/objections/new?sector=${id}`}
              className="glass p-4 rounded-xl border border-border/50 hover:border-brand-500/30 transition-all group flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0 group-hover:bg-orange-500/25 transition-colors">
                <MessageSquarePlusIcon className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="font-bold text-sm">이의제기 하기</div>
                <div className="text-xs text-muted-foreground">AI 점수에 동의하지 않으면?</div>
              </div>
            </Link>
            <Link
              href="/student/portfolio"
              className="glass p-4 rounded-xl border border-border/50 hover:border-purple-500/30 transition-all group flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0 group-hover:bg-purple-500/25 transition-colors">
                <PieChartIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="font-bold text-sm">포트폴리오 조정</div>
                <div className="text-xs text-muted-foreground">{isMine ? `현재 비중 ${myWeight ?? 0}%` : "이 섹터를 담고 싶다면?"}</div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* History Tab */}
      {tab === "history" && (
        <div className="glass p-5 rounded-2xl space-y-3">
          <h3 className="font-bold">7일 등락률 추이</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sectorHistory} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `${v > 0 ? "+" : ""}${v}%`}
                  width={40}
                />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(v) => [`${Number(v) > 0 ? "+" : ""}${Number(v)}%`, "등락률"]}
                />
                <Line
                  type="monotone"
                  dataKey="return"
                  stroke={isPositive ? "#34d399" : "#f87171"}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: isPositive ? "#34d399" : "#f87171", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground text-center">※ 히스토리 데이터는 실시간 Firestore 연동 후 업데이트됩니다.</p>
        </div>
      )}

      {/* Learn Tab */}
      {tab === "learn" && (
        <div className="space-y-4">
          <div className="glass p-5 rounded-2xl border border-border/50">
            <h3 className="font-bold mb-1 flex items-center gap-2">
              <BookOpenIcon className="w-4 h-4 text-brand-400" />
              {sector.name} 섹터 핵심 개념
            </h3>
            <p className="text-xs text-muted-foreground mb-4">{sector.name} 섹터를 이해하는 데 도움이 되는 경제 용어를 알아봐요!</p>

            {glossaryTerms.length > 0 ? (
              <div className="space-y-3">
                {glossaryTerms.map((g, i) => (
                  <motion.div
                    key={g.term}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 p-3 bg-white/5 rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-300 font-bold text-sm shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{g.term}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{g.summary}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                이 섹터의 학습 콘텐츠가 곧 추가돼요!
              </p>
            )}
          </div>

          {/* Discussion Question */}
          <div className="glass p-5 rounded-2xl border border-purple-500/20 bg-purple-500/5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🤔</span>
              <span className="font-bold text-sm text-purple-300">오늘의 토론 질문</span>
            </div>
            <p className="text-sm leading-relaxed">
              {sector.name} 섹터의 오늘 영향도가 {impact.impactScore > 0 ? "호재" : impact.impactScore < 0 ? "악재" : "중립"}인 이유는 무엇일까요?
              AI 분석과 다른 관점이 있다면 이의제기해 보세요!
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
