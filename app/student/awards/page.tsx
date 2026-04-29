"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { TrophyIcon, StarIcon, BadgeIcon, CalendarIcon, DownloadIcon } from "lucide-react";
import * as motion from "framer-motion/client";
import { toast } from "sonner";

interface Award {
  id: string;
  type: string;
  emoji: string;
  title: string;
  date: string;
  reason: string;
  isNew?: boolean;
}

interface Badge {
  id: string;
  emoji: string;
  label: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
}

const MOCK_AWARDS: Award[] = [
  {
    id: "a1",
    type: "weekly_winner",
    emoji: "🥇",
    title: "주간 우승",
    date: "2026년 4월 25일",
    reason: "4주차 개인 포트폴리오 수익률 1위 달성!",
    isNew: true,
  },
  {
    id: "a2",
    type: "best_analyst",
    emoji: "🔭",
    title: "베스트 애널리스트",
    date: "2026년 4월 22일",
    reason: "반도체 섹터 이의제기 논리성·증거력 최고점 달성",
  },
];

const MOCK_BADGES: Badge[] = [
  { id: "b1", emoji: "🔥", label: "끈기왕", description: "7일 연속 예측 적중", earned: true, earnedAt: "2026.04.21" },
  { id: "b2", emoji: "🎯", label: "명사수", description: "예측 적중률 70% 이상", earned: true, earnedAt: "2026.04.15" },
  { id: "b3", emoji: "🚀", label: "로켓 출발", description: "첫 이의제기 승인", earned: true, earnedAt: "2026.04.10" },
  { id: "b4", emoji: "👑", label: "주간 챔피언", description: "주간 우승 3회 달성", earned: false },
  { id: "b5", emoji: "🌐", label: "글로벌 마인드", description: "5개 이상 섹터 이의제기", earned: false },
  { id: "b6", emoji: "💎", label: "다이아몬드", description: "시즌 TOP 5% 달성", earned: false },
];

export default function AwardsPage() {
  const earnedBadges = MOCK_BADGES.filter(b => b.earned);
  const lockedBadges = MOCK_BADGES.filter(b => !b.earned);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownloadPDF = async (award: Award) => {
    setDownloading(award.id);
    try {
      const res = await fetch("/api/award-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          awardType: award.type,
          recipientName: "나",
          schoolName: "서울 미래중학교",
          className: "2학년 1반",
          period: "2026 4주차",
          reason: award.reason,
          teacherName: "선생님",
          issuedAt: award.date,
        }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `award_${award.title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("PDF 다운로드에 실패했어요.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <main className="max-w-3xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <TrophyIcon className="w-7 h-7 text-yellow-400" />
        <h1 className="text-2xl font-display font-bold">상장 & 뱃지</h1>
      </div>

      {/* Awards Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <TrophyIcon className="w-5 h-5 text-yellow-400" />
          받은 상장
          <span className="text-sm font-normal text-muted-foreground">{MOCK_AWARDS.length}개</span>
        </h2>

        {MOCK_AWARDS.length === 0 ? (
          <div className="glass p-8 rounded-2xl text-center text-muted-foreground">
            아직 받은 상장이 없어요. 열심히 도전해보세요!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MOCK_AWARDS.map((award, index) => (
              <motion.div
                key={award.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={cn(
                  "glass p-5 rounded-2xl border relative overflow-hidden",
                  award.isNew ? "border-yellow-500/40" : "border-border/50"
                )}
              >
                {award.isNew && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded-full">
                    NEW
                  </span>
                )}
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{award.emoji}</div>
                  <button
                    onClick={() => handleDownloadPDF(award)}
                    disabled={downloading === award.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <DownloadIcon className="w-3.5 h-3.5" />
                    {downloading === award.id ? "생성 중..." : "PDF"}
                  </button>
                </div>
                <div className="font-display font-bold text-lg">{award.title}</div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 mb-3">
                  <CalendarIcon className="w-3 h-3" />
                  {award.date}
                </div>
                <p className="text-sm text-foreground/70 leading-relaxed">{award.reason}</p>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Badges Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <StarIcon className="w-5 h-5 text-brand-400" />
          획득한 뱃지
          <span className="text-sm font-normal text-muted-foreground">{earnedBadges.length}/{MOCK_BADGES.length}</span>
        </h2>

        {/* Earned Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {earnedBadges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.06 }}
              className="glass p-4 rounded-2xl border border-brand-500/30 flex flex-col items-center text-center gap-2"
            >
              <div className="text-4xl">{badge.emoji}</div>
              <div className="font-bold text-sm">{badge.label}</div>
              <div className="text-xs text-muted-foreground">{badge.description}</div>
              {badge.earnedAt && (
                <div className="text-[10px] text-brand-400 font-medium">{badge.earnedAt} 획득</div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Locked Badges */}
        {lockedBadges.length > 0 && (
          <>
            <h3 className="text-sm font-bold text-muted-foreground flex items-center gap-2 mt-4">
              <BadgeIcon className="w-4 h-4" /> 아직 잠긴 뱃지
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {lockedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="glass p-4 rounded-2xl border border-border/30 flex flex-col items-center text-center gap-2 opacity-50 grayscale"
                >
                  <div className="text-4xl">{badge.emoji}</div>
                  <div className="font-bold text-sm">{badge.label}</div>
                  <div className="text-xs text-muted-foreground">{badge.description}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>


    </main>
  );
}
