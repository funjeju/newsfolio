import { MOCK_SECTORS, MOCK_IMPACTS, MOCK_USER_PORTFOLIO } from "@/lib/mockData";
import { BriefingStatusIndicator } from "./BriefingStatusIndicator";
import { LeaderboardRow } from "./LeaderboardRow";
import { InfoIcon } from "lucide-react";
import type { Briefing } from "@/types/schema";

interface Props {
  briefing?: Briefing | null;
}

export function SectorLeaderboardHero({ briefing = null }: Props) {
  const sortedImpacts = [...MOCK_IMPACTS].sort((a, b) => b.dailyReturn - a.dailyReturn);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

      {/* ── Stadium Header ── */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 md:px-8 py-6 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            {/* LIVE badge */}
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 text-white px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              LIVE · AI 분석 완료
            </span>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white flex items-center gap-2">
              📊 오늘의 섹터 순위
            </h1>
            <p className="text-white/70 text-sm">
              어제 뉴스를 분석한 섹터별 등락률이에요 · 내 판단으로 미래를 바꿔보세요!
            </p>
          </div>

          <div className="w-full md:w-auto md:min-w-[300px]">
            <BriefingStatusIndicator briefing={briefing} />
          </div>
        </div>
      </div>

      {/* ── Column Header ── */}
      <div className="hidden md:flex items-center gap-4 px-8 py-2.5 bg-slate-50 border-b border-slate-200 text-xs font-bold tracking-wider text-slate-500 uppercase">
        <div className="w-8 text-center">#</div>
        <div className="flex-1 min-w-[120px]">섹터</div>
        <div className="min-w-[140px] text-center">영향도</div>
        <div className="w-20 text-right">등락률</div>
        <div className="w-12 text-center">변동</div>
        <div className="flex-1 pl-4 hidden lg:block">AI 한줄 요약</div>
        <div className="w-6 text-center">⭐</div>
      </div>

      {/* ── Rows ── */}
      <div className="flex flex-col p-4 md:p-6 gap-1.5">
        {sortedImpacts.map((impact, index) => {
          const sector = MOCK_SECTORS.find(s => s.id === impact.sectorId)!;
          const isMine = MOCK_USER_PORTFOLIO.mySectors.includes(sector.id);
          const myWeight = MOCK_USER_PORTFOLIO.myWeights[sector.id];
          return (
            <LeaderboardRow
              key={sector.id}
              rank={index + 1}
              sector={sector}
              impact={impact}
              isMine={isMine}
              myWeight={myWeight}
              index={index}
            />
          );
        })}
      </div>

      {/* ── Legend Footer ── */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 md:px-8 py-3 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <span className="flex items-center gap-1">🚀 큰 호재 (+4~+5)</span>
          <span className="flex items-center gap-1">🟢 호재 (+1~+3)</span>
          <span className="flex items-center gap-1">⚪ 평이 (0)</span>
          <span className="flex items-center gap-1">🔻 악재 (-1~-3)</span>
          <span className="flex items-center gap-1">💥 큰 악재 (-4~-5)</span>
        </div>
        <p className="text-center sm:text-right text-slate-400">AI 분석 결과이며, 투자 판단은 스스로!</p>
      </div>
    </div>
  );
}
