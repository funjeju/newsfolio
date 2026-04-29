"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftIcon, ArrowRightIcon, CheckIcon,
  LinkIcon, SearchIcon, XIcon, AlertCircleIcon, TrendingUpIcon, TrendingDownIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { toast } from "sonner";
import { VirtualBrowserSheet } from "@/components/browser/VirtualBrowserSheet";
import { submitObjection } from "@/lib/hooks/useObjections";
import { useUser } from "@/lib/hooks/useUser";

const SECTORS = [
  { id: "semiconductor", name: "반도체", icon: "💻" },
  { id: "game", name: "게임", icon: "🎮" },
  { id: "green_energy", name: "친환경에너지", icon: "🌱" },
  { id: "automotive", name: "자동차", icon: "🚗" },
  { id: "travel", name: "여행·관광", icon: "✈️" },
  { id: "content", name: "콘텐츠·연예", icon: "🎬" },
  { id: "global_trade", name: "글로벌무역", icon: "🚢" },
  { id: "food", name: "식품", icon: "🍔" },
  { id: "geopolitics", name: "국제정세", icon: "🌐" },
  { id: "construction", name: "건설", icon: "🏗️" },
];

const AI_SCORES: Record<string, number> = {
  semiconductor: 4, game: 3, green_energy: 2, automotive: 1,
  travel: 0, content: -1, global_trade: -2, food: -3, geopolitics: -4, construction: -5,
};

interface Source {
  id: string;
  domain: string;
  headline: string;
  publishedAt: string;
  isValid: boolean;
}

export default function ObjectionNewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const initialSector = searchParams.get("sector") || "semiconductor";

  const [step, setStep] = useState(1);
  const [selectedSector, setSelectedSector] = useState(initialSector);
  const [proposedScore, setProposedScore] = useState(AI_SCORES[initialSector] || 0);
  const [sources, setSources] = useState<Source[]>([]);
  const [logic1, setLogic1] = useState("");
  const [logic2, setLogic2] = useState("");
  const [logic3, setLogic3] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);

  const aiScore = AI_SCORES[selectedSector] || 0;
  const sector = SECTORS.find(s => s.id === selectedSector);
  const diff = proposedScore - aiScore;

  const MOCK_SOURCES: Source[] = [
    { id: "s1", domain: "한경", headline: "반도체 수출 규제 완화 확인…삼성·하이닉스 수혜", publishedAt: "2026-04-29 09:30", isValid: true },
    { id: "s2", domain: "매경", headline: "반도체 업계 환영…투자 확대 본격화", publishedAt: "2026-04-29 11:15", isValid: true },
    { id: "s3", domain: "연합뉴스", headline: "美 상무부, 반도체 수출 규제 세부 완화 조치 발표", publishedAt: "2026-04-28 18:00", isValid: false },
  ];

  const addSource = (src: Source) => {
    if (sources.find(s => s.id === src.id)) return;
    setSources(prev => [...prev, src]);
    toast.success(`${src.domain} 기사를 출처로 추가했어요!`);
  };

  const removeSource = (id: string) => setSources(prev => prev.filter(s => s.id !== id));

  const handleSubmit = async () => {
    if (!user?.classId || !user?.id) {
      toast.error("학급 정보를 불러올 수 없어요. 다시 로그인해 주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      const todayKST = new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
      await submitObjection({
        briefingDateRef: todayKST,
        classId: user.classId,
        sectorId: selectedSector,
        studentId: user.id,
        groupId: user.groupId,
        aiOriginalScore: aiScore,
        proposedScore,
        sourceNewsIds: sources.map(s => s.id),
        logic: {
          why: logic1,
          keyEvidence: logic2,
          counterAcknowledgment: logic3,
        },
      });
      toast.success("이의제기가 제출됐어요! 선생님 검토를 기다려요.");
      router.push("/student/briefing");
    } catch (err: any) {
      toast.error(err.message || "제출에 실패했어요. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canGoNext = () => {
    if (step === 1) return proposedScore !== aiScore;
    if (step === 2) return sources.some(s => s.isValid);
    if (step === 3) return logic1.length >= 10 && logic2.length >= 10;
    return true;
  };

  const estimatedImpact = (() => {
    const currentValue = 12450000;
    const dailyChangePerPoint = 0.005;
    const change = (proposedScore - aiScore) * dailyChangePerPoint;
    return { change, newValue: Math.round(currentValue * (1 + change)) };
  })();

  return (
    <div className="max-w-xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between py-4 mb-6">
        <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeftIcon className="w-4 h-4" />
          {step > 1 ? "이전" : "뒤로"}
        </button>
        <div>
          <span className="font-bold text-lg">이의제기 작성</span>
          <span className="text-muted-foreground ml-2">Step {step}/4</span>
        </div>
        <div className="flex gap-1">
          {[1,2,3,4].map(s => (
            <div key={s} className={cn("w-6 h-1.5 rounded-full transition-colors", s <= step ? "bg-brand-500" : "bg-white/10")} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: 섹터 & 점수 선택 */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
            <div className="glass rounded-2xl p-6 border border-border/50">
              <h2 className="text-xl font-bold mb-4">어떤 섹터에 이의가 있나요?</h2>

              {/* Sector Grid */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {SECTORS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedSector(s.id); setProposedScore(AI_SCORES[s.id]); }}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all",
                      selectedSector === s.id ? "bg-brand-500/20 border-brand-500 text-brand-300" : "bg-white/5 border-border/50 hover:border-white/20"
                    )}
                  >
                    <span className="text-lg">{s.icon}</span>
                    <span>{s.name}</span>
                    {selectedSector === s.id && <CheckIcon className="w-4 h-4 ml-auto" />}
                  </button>
                ))}
              </div>

              {sector && (
                <>
                  <div className="flex justify-between items-center mb-4 p-3 bg-white/5 rounded-xl">
                    <span className="text-sm text-muted-foreground">AI 원안</span>
                    <ScoreBadge score={aiScore} />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">내가 제안하는 수치</span>
                      <ScoreBadge score={proposedScore} />
                    </div>
                    <input
                      type="range" min={-5} max={5} step={1}
                      value={proposedScore}
                      onChange={e => setProposedScore(parseInt(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-brand-500"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>-5 (큰 악재)</span>
                      <span>0</span>
                      <span>+5 (큰 호재)</span>
                    </div>
                    {proposedScore !== aiScore && (
                      <div className={cn(
                        "text-sm font-medium text-center p-2 rounded-lg",
                        diff > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      )}>
                        {diff > 0 ? `AI보다 ${diff}점 더 긍정적으로 보는군요! 🚀` : `AI보다 ${Math.abs(diff)}점 더 부정적으로 보는군요! 🔻`}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 2: 출처 */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
            <div className="glass rounded-2xl p-6 border border-border/50">
              <h2 className="text-xl font-bold mb-2">근거 출처를 추가해요</h2>
              <p className="text-sm text-muted-foreground mb-5">24시간 이내의 기사만 사용 가능해요. 최대 3개까지 추가할 수 있어요.</p>

              <button
                onClick={() => setIsBrowserOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-500/20 text-brand-300 border border-brand-500/30 hover:bg-brand-500/30 transition-colors font-medium mb-4"
              >
                <SearchIcon className="w-4 h-4" />
                가상 브라우저로 찾기
              </button>

              {/* Added Sources */}
              {sources.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-sm font-semibold">추가된 출처 ({sources.length}/3)</p>
                  {sources.map(src => (
                    <div key={src.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-brand-400 font-bold">{src.domain}</span>
                        <span className="text-muted-foreground">{src.publishedAt}</span>
                      </div>
                      <button onClick={() => removeSource(src.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Available Sources */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">오늘 뉴스에서 고르기</p>
                {MOCK_SOURCES.map(src => (
                  <div key={src.id} className={cn(
                    "p-3 rounded-xl border text-sm",
                    src.isValid ? "border-border/50 bg-white/5" : "border-transparent bg-white/3 opacity-50"
                  )}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("font-bold", src.isValid ? "text-brand-400" : "text-muted-foreground")}>{src.domain}</span>
                        <span className="text-muted-foreground text-xs">{src.publishedAt}</span>
                        {src.isValid ? (
                          <span className="text-xs bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">✅ 사용 가능</span>
                        ) : (
                          <span className="text-xs bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded">⛔ 24h 초과</span>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground truncate">{src.headline}</p>
                    {src.isValid && !sources.find(s => s.id === src.id) && sources.length < 3 && (
                      <button
                        onClick={() => addSource(src)}
                        className="mt-2 flex items-center gap-1.5 text-brand-400 hover:text-brand-300 text-xs font-medium transition-colors"
                      >
                        <LinkIcon className="w-3 h-3" /> + 출처로 추가
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: 논리 */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
            <div className="glass rounded-2xl p-6 border border-border/50 space-y-6">
              <h2 className="text-xl font-bold">내 논리를 설명해요</h2>

              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <span className="w-6 h-6 bg-brand-500/20 text-brand-300 rounded-full flex items-center justify-center text-xs">①</span>
                  왜 AI와 다르게 봤나요?
                </label>
                <textarea
                  value={logic1}
                  onChange={e => setLogic1(e.target.value)}
                  placeholder="예: AI가 단순 규제 완화만 반영했는데, 추가로 HBM 수요도 폭발적으로 늘고 있어서..."
                  rows={3}
                  className="w-full p-3 bg-white/5 border border-border/50 rounded-xl text-sm resize-none focus:outline-none focus:border-brand-500/50 placeholder:text-muted-foreground/50"
                />
                <div className="text-right text-xs text-muted-foreground">{logic1.length}/200</div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <span className="w-6 h-6 bg-brand-500/20 text-brand-300 rounded-full flex items-center justify-center text-xs">②</span>
                  가장 중요한 근거는?
                </label>
                <textarea
                  value={logic2}
                  onChange={e => setLogic2(e.target.value)}
                  placeholder="첨부한 출처 중 어떤 사실이 가장 결정적인가요?"
                  rows={3}
                  className="w-full p-3 bg-white/5 border border-border/50 rounded-xl text-sm resize-none focus:outline-none focus:border-brand-500/50 placeholder:text-muted-foreground/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <span className="w-6 h-6 bg-brand-500/20 text-brand-300 rounded-full flex items-center justify-center text-xs">③</span>
                  반대 가능성도 인정한다면?
                </label>
                <textarea
                  value={logic3}
                  onChange={e => setLogic3(e.target.value)}
                  placeholder="예: 다만 중국의 보복 조치 가능성이 남아있어서 불확실성이 완전히 사라진 건 아니에요."
                  rows={3}
                  className="w-full p-3 bg-white/5 border border-border/50 rounded-xl text-sm resize-none focus:outline-none focus:border-brand-500/50 placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Preview & Submit */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
            <div className="glass rounded-2xl p-6 border border-border/50 space-y-5">
              <h2 className="text-xl font-bold">최종 확인 후 제출해요</h2>

              {/* Score Preview */}
              <div className="bg-white/5 rounded-2xl p-4 space-y-3">
                <p className="text-sm font-semibold text-muted-foreground">내 의견이 채택된다면…</p>
                <div className="flex items-center justify-center gap-4 text-2xl font-bold">
                  <span className="flex items-center gap-1">{sector?.icon} <ScoreBadge score={aiScore} /></span>
                  <span className="text-muted-foreground">→</span>
                  <span className="flex items-center gap-1">{sector?.icon} <ScoreBadge score={proposedScore} /></span>
                </div>
              </div>

              {/* Portfolio Impact */}
              <div className="bg-white/5 rounded-2xl p-4">
                <p className="text-sm font-semibold text-muted-foreground mb-3">내 포트폴리오 영향 (시뮬레이션)</p>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">현재</div>
                    <div className="text-xl font-bold">₩12,450,000</div>
                  </div>
                  <div className={cn("text-lg font-bold", diff > 0 ? "text-score-up" : "text-score-down")}>
                    {diff > 0 ? <TrendingUpIcon className="w-6 h-6 mx-auto" /> : <TrendingDownIcon className="w-6 h-6 mx-auto" />}
                    {diff > 0 ? "+" : ""}{((estimatedImpact.newValue - 12450000) / 12450000 * 100).toFixed(2)}%
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">채택 후</div>
                    <div className="text-xl font-bold">₩{estimatedImpact.newValue.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <AlertCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-400" />
                  <span>교사 컨펌 후 최종 점수에 반영됩니다. 컨펌 마감은 오후 4시예요.</span>
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-4 bg-brand-500 text-white rounded-2xl font-bold hover:bg-brand-600 transition-all disabled:opacity-50 shadow-[0_4px_20px_rgba(99,102,241,0.4)]"
              >
                {isSubmitting ? "제출 중..." : "🚀 이의제기 제출하기"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next Button */}
      {step < 4 && (
        <button
          onClick={() => setStep(s => s + 1)}
          disabled={!canGoNext()}
          className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 bg-brand-500 text-white rounded-2xl font-bold hover:bg-brand-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          다음 <ArrowRightIcon className="w-4 h-4" />
        </button>
      )}

      <VirtualBrowserSheet
        isOpen={isBrowserOpen}
        onClose={() => setIsBrowserOpen(false)}
        sectorName={sector?.name}
        onSelectSource={(src) => {
          if (sources.length < 3 && !sources.find(s => s.id === src.id)) {
            setSources(prev => [...prev, src]);
            toast.success(`${src.domain} 기사를 출처로 추가했어요!`);
          }
        }}
      />
    </div>
  );
}
