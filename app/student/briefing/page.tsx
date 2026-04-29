"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpenIcon, UsersIcon, CheckCircle2Icon, ChevronRightIcon } from "lucide-react";
import { SectorCard } from "@/components/briefing/SectorCard";
import { BriefingStatusIndicator } from "@/components/leaderboard/BriefingStatusIndicator";
import Link from "next/link";
import { toast } from "sonner";

// Mock briefing data (will be replaced with Firestore subscription)
const MOCK_BRIEFING = {
  date: "2026년 4월 29일 (화)",
  status: "confirmed" as const,
  headline: "미국 수출 규제가 완화되면서 반도체가 웃고, 건설은 여전히 추워요!",
  classActivity: {
    sourceSubmissions: 12,
    objections: 9,
    pendingConfirm: 5,
  },
  sectors: [
    {
      sectorId: "semiconductor", sectorName: "반도체", sectorIcon: "💻",
      impactScore: 4, dailyReturn: 3.24, rankChange: 2, rank: 1,
      duration: "medium" as const, risk: "low" as const,
      tonedRationale: "미국이 반도체 수출 규제❓를 완화한대요. 삼성전자 같은 우리나라 반도체❓ 회사들이 해외에 더 많이 팔 수 있게 됐어요. 반도체 가격도 오르고 있어서 이중 호재예요!",
      objectionCount: 3, isMine: true,
    },
    {
      sectorId: "game", sectorName: "게임", sectorIcon: "🎮",
      impactScore: 3, dailyReturn: 2.11, rankChange: 1, rank: 2,
      duration: "short" as const, risk: "low" as const,
      tonedRationale: "국내 대형 게임사의 신작이 출시 첫날 100만 다운로드를 돌파했어요! 매출도 역대 최고를 기록했다고 해요.",
      objectionCount: 8, isMine: false,
    },
    {
      sectorId: "green_energy", sectorName: "친환경에너지", sectorIcon: "🌱",
      impactScore: 2, dailyReturn: 1.45, rankChange: 0, rank: 3,
      duration: "long" as const, risk: "low" as const,
      tonedRationale: "정부가 신재생 에너지❓ 보조금을 2배로 늘리기로 했대요. 태양광과 배터리 회사들에게 좋은 소식이에요.",
      objectionCount: 1, isMine: false,
    },
    {
      sectorId: "automotive", sectorName: "자동차", sectorIcon: "🚗",
      impactScore: 1, dailyReturn: 0.72, rankChange: -1, rank: 4,
      duration: "short" as const, risk: "mid" as const,
      tonedRationale: "전기차 판매량이 소폭 늘었지만, 원자재 가격도 같이 올라서 이익이 많이 안 늘었어요. 기대보다 약한 호재예요.",
      objectionCount: 2, isMine: true,
    },
    {
      sectorId: "travel", sectorName: "여행·관광", sectorIcon: "✈️",
      impactScore: 0, dailyReturn: -0.15, rankChange: 0, rank: 5,
      duration: "short" as const, risk: "mid" as const,
      tonedRationale: "해외 여행 수요가 예년과 비슷한 수준이에요. 특별히 좋지도 나쁘지도 않은 상황이에요.",
      objectionCount: 0, isMine: false,
    },
    {
      sectorId: "content", sectorName: "콘텐츠·연예", sectorIcon: "🎬",
      impactScore: -1, dailyReturn: -0.68, rankChange: -1, rank: 6,
      duration: "short" as const, risk: "mid" as const,
      tonedRationale: "주요 OTT❓ 플랫폼의 한국 가입자 증가세가 예상보다 느려졌어요. K-콘텐츠 열풍이 잠시 숨고르기 중이에요.",
      objectionCount: 0, isMine: false,
    },
    {
      sectorId: "global_trade", sectorName: "글로벌무역", sectorIcon: "🚢",
      impactScore: -2, dailyReturn: -1.23, rankChange: -2, rank: 7,
      duration: "medium" as const, risk: "mid" as const,
      tonedRationale: "해상 운임❓이 또 올랐어요. 물건을 배에 실어 보내는 비용이 비싸지면 수출하는 회사들이 힘들어져요.",
      objectionCount: 1, isMine: false,
    },
    {
      sectorId: "food", sectorName: "식품", sectorIcon: "🍔",
      impactScore: -3, dailyReturn: -2.14, rankChange: -1, rank: 8,
      duration: "medium" as const, risk: "high" as const,
      tonedRationale: "라면 재료로 쓰는 밀가루와 설탕 가격이 많이 올랐어요. 식품 회사들이 원재료❓를 더 비싸게 사야 해서 힘들어요.",
      objectionCount: 0, isMine: false,
    },
    {
      sectorId: "geopolitics", sectorName: "국제정세", sectorIcon: "🌐",
      impactScore: -4, dailyReturn: -3.67, rankChange: 0, rank: 9,
      duration: "long" as const, risk: "high" as const,
      tonedRationale: "미국과 중국 사이의 무역 갈등이 또 심해졌어요. 두 나라가 서로 관세❓를 올리겠다고 해서 시장이 긴장하고 있어요.",
      objectionCount: 5, isMine: false,
    },
    {
      sectorId: "construction", sectorName: "건설", sectorIcon: "🏗️",
      impactScore: -5, dailyReturn: -4.89, rankChange: -3, rank: 10,
      duration: "long" as const, risk: "high" as const,
      tonedRationale: "부동산❓ 부실 문제가 더 심각해졌어요. 아파트를 짓다 멈춘 곳이 늘고, 새 공사 수주도 크게 줄었어요. 건설 업계에 최악의 날이에요.",
      objectionCount: 9, isMine: false,
    },
  ],
};

export default function StudentBriefingPage() {
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    if (completed) return;
    setCompleted(true);
    toast.success("🎉 오늘의 브리핑 읽기 완료! +10P");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="pt-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-300 text-sm font-bold border border-brand-500/30">
            <BookOpenIcon className="w-4 h-4" />
            오늘의 뉴스 브리핑
          </div>
          <span className="text-sm text-muted-foreground">{MOCK_BRIEFING.date}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold leading-snug">
          {MOCK_BRIEFING.headline}
        </h1>
      </div>

      {/* Briefing Status Indicator */}
      <div className="glass p-5 rounded-2xl border border-border/50">
        <p className="text-sm text-muted-foreground text-center mb-6">오늘 브리핑 진행 상태</p>
        <BriefingStatusIndicator briefing={null} />
      </div>

      {/* Sector Cards */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold px-1 flex items-center gap-2">
          섹터별 영향도 분석
          <span className="text-sm font-normal text-muted-foreground">(10개 섹터)</span>
        </h2>
        <div className="space-y-3">
          {MOCK_BRIEFING.sectors.map((sector, index) => (
            <SectorCard key={sector.sectorId} impact={sector} index={index} />
          ))}
        </div>
      </div>

      {/* Class Activity Summary */}
      <div className="glass rounded-2xl p-5 border border-border/50">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <UsersIcon className="w-4 h-4 text-brand-400" />
          우리 반 활동 현황
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-brand-400">{MOCK_BRIEFING.classActivity.sourceSubmissions}</div>
            <div className="text-xs text-muted-foreground mt-1">출처 제출</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-400">{MOCK_BRIEFING.classActivity.objections}</div>
            <div className="text-xs text-muted-foreground mt-1">이의제기</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">{MOCK_BRIEFING.classActivity.pendingConfirm}</div>
            <div className="text-xs text-muted-foreground mt-1">컨펌 대기</div>
          </div>
        </div>
      </div>

      {/* Complete Button */}
      <div className="flex flex-col items-center gap-4 pt-4">
        {!completed ? (
          <button
            onClick={handleComplete}
            className="flex items-center gap-3 px-8 py-4 bg-brand-500 text-white rounded-2xl font-bold hover:bg-brand-600 transition-all shadow-[0_4px_20px_rgba(99,102,241,0.4)] hover:shadow-[0_6px_28px_rgba(99,102,241,0.5)]"
          >
            <CheckCircle2Icon className="w-5 h-5" />
            다 읽었어요!
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-brand-400 font-bold bg-brand-500/10 px-6 py-3 rounded-full border border-brand-500/30">
              <CheckCircle2Icon className="w-5 h-5" />
              오늘 브리핑 완료! 🎉
            </div>
            <Link href="/student/objections/new" className="flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-2xl font-bold hover:bg-muted transition-colors">
              이의제기 작성하기 <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
