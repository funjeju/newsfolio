"use client";

import { SectorLeaderboardHero } from "@/components/leaderboard/SectorLeaderboardHero";
import { PortfolioValueCard } from "@/components/dashboard/PortfolioValueCard";
import { RankingCard } from "@/components/dashboard/RankingCard";
import { BestAnalystSpotlight } from "@/components/dashboard/BestAnalystSpotlight";
import { StreakBanner } from "@/components/dashboard/StreakBanner";
import { BigMoverAlert } from "@/components/dashboard/BigMoverAlert";
import { YesterdayCardNews } from "@/components/dashboard/YesterdayCardNews";
import { TodaysTodos } from "@/components/dashboard/TodaysTodos";
import {
  MOCK_IMPACTS, MOCK_SECTORS, MOCK_USER_PORTFOLIO,
  MOCK_SPARKLINE_INDIVIDUAL, MOCK_SPARKLINE_GROUP, MOCK_STREAK,
} from "@/lib/mockData";
import { useUser } from "@/lib/hooks/useUser";
import { useTodayBriefing } from "@/lib/hooks/useTodayBriefing";
import { useMyPortfolios } from "@/lib/hooks/useMyPortfolios";

export default function StudentDashboard() {
  const { user } = useUser();
  const { briefing } = useTodayBriefing(user?.classId);
  const { individual, group, snapshots } = useMyPortfolios(user?.id, user?.groupId, user?.classId);

  // Use real data when available, fall back to mock
  const indivValue = individual?.currentValue ?? MOCK_USER_PORTFOLIO.totalValue;
  const indivDailyChange = snapshots[snapshots.length - 1]
    ? Math.round((snapshots[snapshots.length - 1].dailyReturn) * indivValue)
    : MOCK_USER_PORTFOLIO.dailyChange;
  const indivDailyChangePct = snapshots[snapshots.length - 1]
    ? parseFloat((snapshots[snapshots.length - 1].dailyReturn * 100).toFixed(2))
    : MOCK_USER_PORTFOLIO.dailyChangePercent;

  // Sparkline: use real snapshots if available (last 7), else mock
  const sparklineIndiv = snapshots.length >= 2
    ? snapshots.slice(-7).map(s => ({ date: s.date, value: s.value }))
    : MOCK_SPARKLINE_INDIVIDUAL;

  const bigMovers = MOCK_IMPACTS
    .filter(i => Math.abs(i.rankChange) >= 3)
    .map(i => {
      const sector = MOCK_SECTORS.find(s => s.id === i.sectorId)!;
      return {
        sectorId: i.sectorId,
        sectorName: sector.name,
        sectorIcon: sector.icon,
        rankChange: i.rankChange,
        impactScore: i.impactScore,
        dailyReturn: i.dailyReturn,
      };
    })
    .sort((a, b) => Math.abs(b.rankChange) - Math.abs(a.rankChange));

  return (
    <main className="space-y-4 max-w-7xl mx-auto">
      {/* Gamification Banners */}
      <StreakBanner streakDays={MOCK_STREAK.currentStreak} sectorName="반도체" />
      <BigMoverAlert movers={bigMovers} />

      {/* HERO: Leaderboard */}
      <SectorLeaderboardHero briefing={briefing} />

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PortfolioValueCard
          ownerType="individual"
          value={indivValue}
          dailyChange={indivDailyChange}
          dailyChangePercent={indivDailyChangePct}
          rank={MOCK_USER_PORTFOLIO.rank}
          totalParticipants={MOCK_USER_PORTFOLIO.totalStudents}
          sparkline={sparklineIndiv}
        />
        <PortfolioValueCard
          ownerType="group"
          value={group?.currentValue ?? MOCK_USER_PORTFOLIO.groupTotalValue}
          dailyChange={MOCK_USER_PORTFOLIO.groupDailyChange}
          dailyChangePercent={MOCK_USER_PORTFOLIO.groupDailyChangePercent}
          rank={MOCK_USER_PORTFOLIO.groupRank}
          totalParticipants={MOCK_USER_PORTFOLIO.totalGroups}
          name={MOCK_USER_PORTFOLIO.groupName}
          sparkline={MOCK_SPARKLINE_GROUP}
        />
        <RankingCard
          individualRank={MOCK_USER_PORTFOLIO.rank}
          totalStudents={MOCK_USER_PORTFOLIO.totalStudents}
          topPercent={MOCK_USER_PORTFOLIO.topPercent}
          groupRank={MOCK_USER_PORTFOLIO.groupRank}
          totalGroups={MOCK_USER_PORTFOLIO.totalGroups}
          groupName={MOCK_USER_PORTFOLIO.groupName}
          streakDays={MOCK_STREAK.currentStreak}
          accuracyRate={MOCK_STREAK.accuracyRate}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <BestAnalystSpotlight date="2026년 4월 28일" />
        </div>
        <div className="flex flex-col gap-4">
          <YesterdayCardNews />
          <TodaysTodos />
        </div>
      </div>
    </main>
  );
}
