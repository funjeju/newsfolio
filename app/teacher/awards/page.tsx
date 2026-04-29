"use client";

import { useState } from "react";
import { AwardIcon, DownloadIcon, SparklesIcon, CheckIcon, TrophyIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useUser } from "@/lib/hooks/useUser";

const AWARD_TYPES = [
  { id: "weekly_winner", label: "주간 수익왕", icon: "🏆", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  { id: "monthly_winner", label: "월간 수익왕", icon: "🥇", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  { id: "best_analyst", label: "베스트 분석가", icon: "🔬", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { id: "best_collaboration", label: "협동왕", icon: "🤝", color: "text-green-400 bg-green-500/10 border-green-500/20" },
  { id: "rookie_award", label: "루키상", icon: "🌟", color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
  { id: "persistence_award", label: "끈기상", icon: "💪", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
];

const MOCK_AWARDS = [
  { id: "a1", type: "weekly_winner", recipientName: "이서연", period: "2026 4주차", awardDate: "2026-04-25", reason: "4주 연속 반도체 정확 예측으로 반 1위 수익 달성" },
  { id: "a2", type: "best_analyst", recipientName: "박지현", period: "2026 4주차", awardDate: "2026-04-25", reason: "AI 판단에 대한 3건 이의제기 모두 수용, 증거 품질 평균 92점" },
  { id: "a3", type: "persistence_award", recipientName: "최도윤", period: "2026 4주차", awardDate: "2026-04-25", reason: "21일 연속 분석 참여, 활동률 100%" },
];

export default function TeacherAwardsPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"issued" | "issue">("issued");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [reason, setReason] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownloadPDF = async (award: typeof MOCK_AWARDS[0]) => {
    setDownloading(award.id);
    try {
      const res = await fetch("/api/award-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          awardType: award.type,
          recipientName: award.recipientName,
          schoolName: "서울 미래중학교",
          className: "2학년 1반",
          period: award.period,
          reason: award.reason,
          teacherName: user?.displayName ?? "선생님",
          issuedAt: award.awardDate,
        }),
      });
      if (!res.ok) throw new Error("PDF 생성 실패");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `award_${award.recipientName}_${award.period}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("PDF 다운로드에 실패했어요.");
    } finally {
      setDownloading(null);
    }
  };

  const handleGenerateAndIssue = async () => {
    if (!selectedType || !recipientName.trim()) {
      toast.error("상장 유형과 수상자를 선택해주세요.");
      return;
    }
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 1200));
    toast.success(`${recipientName}에게 상장이 발행됐어요! 🎉`);
    setIsGenerating(false);
    setActiveTab("issued");
  };

  return (
    <div className="space-y-6 pb-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-display font-bold">상장 발행</h1>
          <p className="text-muted-foreground mt-1">수상자에게 PDF 상장을 발행해요</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white/5 border border-border/50 px-3 py-2 rounded-xl">
          <TrophyIcon className="w-4 h-4 text-yellow-400" />
          이번 주 발행: {MOCK_AWARDS.length}건
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/50">
        {[
          { id: "issued", label: "발행 내역" },
          { id: "issue", label: "새 상장 발행" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn("px-4 py-3 font-semibold border-b-2 transition-colors text-sm", activeTab === tab.id ? "border-brand-500 text-brand-300" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Issued Tab */}
      {activeTab === "issued" && (
        <div className="space-y-4">
          {MOCK_AWARDS.map(award => {
            const type = AWARD_TYPES.find(t => t.id === award.type);
            return (
              <div key={award.id} className={cn("glass rounded-2xl p-5 border flex items-center justify-between gap-4", type?.color ?? "border-border/50")}>
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{type?.icon}</span>
                  <div>
                    <div className="font-bold">{award.recipientName}</div>
                    <div className="text-sm text-muted-foreground">{type?.label} · {award.period}</div>
                    <div className="text-xs text-muted-foreground mt-1 max-w-xs truncate">"{award.reason}"</div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadPDF(award)}
                  disabled={downloading === award.id}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors flex-shrink-0 disabled:opacity-50"
                >
                  <DownloadIcon className="w-4 h-4" />
                  {downloading === award.id ? "생성 중..." : "PDF"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Issue Tab */}
      {activeTab === "issue" && (
        <div className="glass rounded-2xl p-6 border border-border/50 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold">상장 유형</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {AWARD_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all text-left",
                    selectedType === type.id ? cn("border-brand-500 bg-brand-500/20 text-brand-300") : "border-border/50 bg-white/5 hover:border-white/20"
                  )}
                >
                  <span className="text-xl">{type.icon}</span>
                  <span>{type.label}</span>
                  {selectedType === type.id && <CheckIcon className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">수상자 이름</label>
            <input
              type="text"
              value={recipientName}
              onChange={e => setRecipientName(e.target.value)}
              placeholder="학생 이름 입력"
              className="w-full p-3 bg-white/5 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-brand-500/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center justify-between">
              수상 이유
              <button
                onClick={() => setReason("4주 연속 우수한 섹터 분석으로 반 전체 포트폴리오 수익에 기여했어요.")}
                className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1"
              >
                <SparklesIcon className="w-3.5 h-3.5" /> AI 자동 생성
              </button>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              placeholder="수상 이유를 입력하거나 AI로 생성해요"
              className="w-full p-3 bg-white/5 border border-border/50 rounded-xl text-sm resize-none focus:outline-none focus:border-brand-500/50 placeholder:text-muted-foreground/50"
            />
          </div>

          <button
            onClick={handleGenerateAndIssue}
            disabled={isGenerating || !selectedType || !recipientName.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-500 text-white rounded-2xl font-bold disabled:opacity-40 hover:bg-brand-600 transition-colors"
          >
            {isGenerating ? "PDF 생성 중..." : <><AwardIcon className="w-5 h-5" /> 상장 발행하기</>}
          </button>
        </div>
      )}
    </div>
  );
}
