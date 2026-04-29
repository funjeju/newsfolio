"use client";

import { useState } from "react";
import * as motion from "framer-motion/client";
import { BookOpenIcon, CalendarIcon, TrendingUpIcon, TrendingDownIcon, MinusIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ReportType = "card_news" | "magazine" | "weekly_brief";

interface MockCardNews {
  id: string;
  type: ReportType;
  date: string;
  headline: string;
  summary: string;
  sectorId: string;
  sectorName: string;
  sectorIcon: string;
  impactScore: number;
  thumbnailColor: string;
}

const MOCK_REPORTS: MockCardNews[] = [
  {
    id: "cn1", type: "card_news", date: "2026-04-29",
    headline: "반도체 수출 규제 완화, 삼성·SK하이닉스 환호",
    summary: "미국이 대한민국 반도체 기업에 대한 수출 규제를 완화했어요. HBM 수요도 급증하면서 반도체 섹터가 크게 올랐어요.",
    sectorId: "semiconductor", sectorName: "반도체", sectorIcon: "💻",
    impactScore: 4, thumbnailColor: "from-indigo-500/30 to-purple-500/30",
  },
  {
    id: "cn2", type: "card_news", date: "2026-04-28",
    headline: "건설 PF 위기, 신규 수주 절반 이하로 뚝",
    summary: "부동산 PF 부실 우려가 현실로 다가오고 있어요. 주요 건설사들의 신규 수주가 작년 대비 절반 이하로 감소했어요.",
    sectorId: "construction", sectorName: "건설", sectorIcon: "🏗️",
    impactScore: -5, thumbnailColor: "from-red-500/30 to-rose-500/30",
  },
  {
    id: "cn3", type: "card_news", date: "2026-04-27",
    headline: "신작 게임 돌풍, 출시 첫날 100만 다운로드",
    summary: "국내 대형 게임사 신작이 글로벌 마켓에서 돌풍을 일으키고 있어요. 출시 첫날 100만 다운로드, 매출 역대 최고 기록!",
    sectorId: "game", sectorName: "게임", sectorIcon: "🎮",
    impactScore: 3, thumbnailColor: "from-pink-500/30 to-fuchsia-500/30",
  },
  {
    id: "cn4", type: "weekly_brief", date: "2026-04-25",
    headline: "이번 주 경제 브리핑: 무역 갈등 심화 vs 에너지 정책 호재",
    summary: "미중 무역 갈등이 다시 불거진 한 주였어요. 반면, 정부의 신재생 에너지 확대 정책은 친환경 섹터에 훈풍을 불었어요.",
    sectorId: "global_trade", sectorName: "글로벌무역", sectorIcon: "🚢",
    impactScore: -2, thumbnailColor: "from-sky-500/30 to-blue-500/30",
  },
  {
    id: "cn5", type: "card_news", date: "2026-04-24",
    headline: "밀·설탕 가격 폭등, 식품 업계 비상",
    summary: "국제 원자재 시장에서 밀과 설탕 가격이 폭등했어요. 원자재 가격이 오르면 라면, 빵 같은 식품 회사들이 힘들어져요.",
    sectorId: "food", sectorName: "식품", sectorIcon: "🍔",
    impactScore: -3, thumbnailColor: "from-amber-500/30 to-orange-500/30",
  },
  {
    id: "cn6", type: "magazine", date: "2026-04-22",
    headline: "섹터 매거진: 친환경에너지의 미래",
    summary: "정부의 탄소중립 선언 이후 친환경 에너지 섹터는 어떻게 변해왔을까요? AI가 분석한 친환경 에너지 트렌드를 소개해요.",
    sectorId: "green_energy", sectorName: "친환경에너지", sectorIcon: "🌱",
    impactScore: 2, thumbnailColor: "from-emerald-500/30 to-teal-500/30",
  },
];

const TYPE_LABELS: Record<ReportType, string> = {
  card_news: "카드뉴스",
  magazine: "매거진",
  weekly_brief: "주간 브리핑",
};

const TYPE_COLORS: Record<ReportType, string> = {
  card_news: "bg-brand-500/20 text-brand-300",
  magazine: "bg-purple-500/20 text-purple-300",
  weekly_brief: "bg-sky-500/20 text-sky-300",
};

function ScoreIndicator({ score }: { score: number }) {
  if (score > 0) return (
    <span className="flex items-center gap-0.5 text-score-up text-sm font-bold">
      <TrendingUpIcon className="w-3.5 h-3.5" />+{score}
    </span>
  );
  if (score < 0) return (
    <span className="flex items-center gap-0.5 text-score-down text-sm font-bold">
      <TrendingDownIcon className="w-3.5 h-3.5" />{score}
    </span>
  );
  return (
    <span className="flex items-center gap-0.5 text-muted-foreground text-sm">
      <MinusIcon className="w-3.5 h-3.5" />0
    </span>
  );
}

export default function StudentReportsPage() {
  const [filter, setFilter] = useState<"all" | ReportType>("all");

  const filtered = filter === "all" ? MOCK_REPORTS : MOCK_REPORTS.filter(r => r.type === filter);

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-bold mb-3 border border-brand-500/30">
          <BookOpenIcon className="w-3.5 h-3.5" />
          뉴스·리포트
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">카드뉴스 & 매거진</h1>
        <p className="text-sm text-muted-foreground mt-1">AI가 매일 생성하는 섹터별 뉴스 카드를 읽어보세요.</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["all", "card_news", "magazine", "weekly_brief"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors border",
              filter === f
                ? "bg-brand-500 text-white border-brand-500"
                : "bg-slate-100/70 text-muted-foreground border-border/50 hover:bg-slate-100"
            )}
          >
            {f === "all" ? "전체" : TYPE_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Card Grid */}
      <div className="space-y-3">
        {filtered.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="glass rounded-2xl border border-border/50 overflow-hidden hover:border-white/20 transition-all cursor-pointer group"
          >
            {/* Thumbnail stripe */}
            <div className={cn("h-2 bg-gradient-to-r", report.thumbnailColor)} />
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xl">{report.sectorIcon}</span>
                    <span className="text-xs text-muted-foreground">{report.sectorName}</span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", TYPE_COLORS[report.type])}>
                      {TYPE_LABELS[report.type]}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
                      <CalendarIcon className="w-3 h-3" />
                      {report.date}
                    </span>
                  </div>
                  <h3 className="font-bold text-base leading-snug mb-2 group-hover:text-brand-300 transition-colors">
                    {report.headline}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {report.summary}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <ScoreIndicator score={report.impactScore} />
                  <ChevronRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-brand-300 transition-colors" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass p-10 text-center text-muted-foreground rounded-2xl">
          <BookOpenIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">해당 유형의 리포트가 없어요</p>
        </div>
      )}
    </div>
  );
}
