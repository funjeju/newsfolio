import { MOCK_SECTORS, MOCK_IMPACTS, MOCK_USER_PORTFOLIO } from "@/lib/mockData";
import { BriefingStatusIndicator } from "./BriefingStatusIndicator";
import { LeaderboardRow } from "./LeaderboardRow";
import { InfoIcon } from "lucide-react";
import type { Briefing } from "@/types/schema";

interface Props {
  briefing?: Briefing | null;
}

export function SectorLeaderboardHero({ briefing = null }: Props) {
  // Sort impacts by dailyReturn descending to get ranks
  const sortedImpacts = [...MOCK_IMPACTS].sort((a, b) => b.dailyReturn - a.dailyReturn);

  return (
    <div className="glass overflow-hidden flex flex-col relative">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-score-mega-up/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Header */}
      <div className="p-6 md:p-8 border-b border-border/50 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-display flex items-center gap-3">
              오늘의 섹터 순위 리더보드
              <button className="text-muted-foreground hover:text-white transition-colors" title="리더보드 안내">
                <InfoIcon className="w-5 h-5" />
              </button>
            </h1>
            <p className="text-muted-foreground">
              AI가 어제 뉴스를 분석한 결과예요.<br className="md:hidden" /> 당신의 판단으로 미래를 바꿔보세요!
            </p>
          </div>

          <div className="w-full md:w-auto md:min-w-[320px]">
            <BriefingStatusIndicator briefing={briefing} />
          </div>
        </div>
      </div>

      {/* Table Header (Desktop) */}
      <div className="hidden md:flex items-center gap-4 px-8 py-3 bg-white/5 border-b border-border/30 text-xs font-semibold tracking-wider text-muted-foreground uppercase relative z-10">
        <div className="w-8 text-center">순위</div>
        <div className="flex-1 min-w-[120px]">섹터</div>
        <div className="min-w-[140px] text-center">영향도</div>
        <div className="w-20 text-right">등락률</div>
        <div className="w-12 text-center">변동</div>
        <div className="flex-1 pl-4 hidden lg:block">AI 한줄 요약</div>
        <div className="w-6 text-center">⭐</div>
      </div>

      {/* Rows */}
      <div className="flex flex-col p-4 md:p-6 gap-2 relative z-10">
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

      {/* Footer Legend */}
      <div className="bg-black/20 p-4 md:px-8 border-t border-border/50 text-xs text-muted-foreground flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <span className="flex items-center gap-1"><span className="text-score-mega-up">🚀</span> 큰 호재 (+4~+5)</span>
          <span className="flex items-center gap-1"><span className="text-score-up">🟢</span> 호재 (+1~+3)</span>
          <span className="flex items-center gap-1"><span className="text-score-neutral">⚪</span> 평이 (0)</span>
          <span className="flex items-center gap-1"><span className="text-score-down">🔻</span> 악재 (-1~-3)</span>
          <span className="flex items-center gap-1"><span className="text-score-mega-down">💥</span> 큰 악재 (-4~-5)</span>
        </div>
        <p className="text-center sm:text-right">영향도는 AI 분석 결과이며, 투자 판단은 스스로!</p>
      </div>
    </div>
  );
}
