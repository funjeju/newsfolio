"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ExternalLinkIcon, MessageCircleIcon, SendIcon,
  TrendingUpIcon, TrendingDownIcon, ArrowLeftIcon,
  SparklesIcon, AlertTriangleIcon, ChevronDownIcon, ChevronUpIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useUser } from "@/lib/hooks/useUser";
import { usePublicScores } from "@/lib/hooks/usePublicScores";
import { useNewsComments, addNewsComment } from "@/lib/hooks/useNewsComments";
import { cn } from "@/lib/utils";

// ── 섹터 메타 ──────────────────────────────────────────────────────
const SECTOR_META: Record<string, { name: string; icon: string }> = {
  semiconductor: { name: "반도체",       icon: "💻" },
  automotive:    { name: "자동차",       icon: "🚗" },
  game:          { name: "게임",         icon: "🎮" },
  content:       { name: "콘텐츠",       icon: "🎬" },
  travel:        { name: "여행·항공",    icon: "✈️" },
  green_energy:  { name: "친환경에너지", icon: "🌱" },
  food:          { name: "식품",         icon: "🍔" },
  construction:  { name: "건설",         icon: "🏗️" },
  geopolitics:   { name: "국제정세",     icon: "🌐" },
  global_trade:  { name: "글로벌무역",   icon: "🚢" },
};

// ── 날짜 (KST) ────────────────────────────────────────────────────
function getKSTDateStr() {
  const kst = new Date(Date.now() + 9 * 3600000);
  return kst.toISOString().split("T")[0];
}

// ── Mock 뉴스 (크론 데이터 없을 때 fallback) ──────────────────────
const MOCK_NEWS: Record<string, { title: string; summary: string; source: string; time: string; url: string }[]> = {
  semiconductor: [
    { title: "삼성전자, HBM4 양산 속도 높여 엔비디아 공급 본격화", summary: "삼성전자가 HBM4 양산 일정을 앞당겨 엔비디아향 공급을 본격화한다. 업계에서는 올해 하반기부터 공급량이 크게 늘어날 것으로 전망한다.", source: "조선비즈", time: "오전 7:30", url: "https://biz.chosun.com" },
    { title: "미국 상무부, 반도체 수출 규제 일부 완화…HBM 포함", summary: "미 상무부가 첨단 반도체 수출 규제를 조정했다. HBM 일부 품목이 제외 대상에 오르며 국내 기업들의 수혜가 기대된다.", source: "한국경제", time: "오전 8:10", url: "https://www.hankyung.com" },
    { title: "SK하이닉스, AI 서버용 HBM3E 글로벌 공급 계약 체결", summary: "SK하이닉스가 북미 클라우드 업체와 대규모 HBM3E 공급 계약을 맺었다고 밝혔다. 연간 수조 원 규모로 알려졌다.", source: "전자신문", time: "오전 9:00", url: "https://www.etnews.com" },
  ],
  automotive: [
    { title: "현대차, 북미 전기차 판매 올해 첫 분기 흑자 달성", summary: "현대차의 북미 전기차 부문이 올해 1분기 처음으로 흑자를 기록했다. 아이오닉6 판매 호조가 주요 원인이다.", source: "연합뉴스", time: "오전 8:00", url: "https://www.yna.co.kr" },
    { title: "기아, 2분기 해외 수출 역대 최대…EV9 인기 주도", summary: "기아의 2분기 해외 수출량이 역대 최대를 기록했다. EV9의 글로벌 인기가 수출 증가를 이끌었다.", source: "한국경제", time: "오전 9:30", url: "https://www.hankyung.com" },
  ],
  game: [
    { title: "넥슨 신작 글로벌 출시 첫날 매출 신기록", summary: "넥슨의 신작 '아크 레이더스'가 글로벌 서비스 첫날 역대 최고 동시 접속자 수와 매출을 동시에 달성했다.", source: "게임메카", time: "오전 9:10", url: "https://www.gamemeca.com" },
    { title: "크래프톤 PUBG 모바일 동남아 MAU 3천만 돌파", summary: "크래프톤의 PUBG 모바일이 동남아시아 월간 활성 이용자 3000만 명을 돌파했다. 동남아 시장에서의 영향력이 더욱 확대되고 있다.", source: "연합뉴스", time: "오전 10:00", url: "https://www.yna.co.kr" },
  ],
  content: [
    { title: "넷플릭스 K드라마 점유율 올해 최고치…오징어게임 효과", summary: "넷플릭스에서 K드라마 콘텐츠 점유율이 올해 최고치를 기록했다. 오징어게임 시즌3 기대감이 구독자 유지에 기여한 것으로 분석된다.", source: "매일경제", time: "오전 9:00", url: "https://www.mk.co.kr" },
    { title: "SM·하이브, 글로벌 음원 수익 분기 최대 갱신", summary: "주요 K팝 기획사들의 글로벌 음원 수익이 2분기 사상 최고를 기록했다. 미국·유럽 시장에서의 K팝 인기가 지속되고 있다.", source: "한국경제", time: "오전 10:30", url: "https://www.hankyung.com" },
  ],
  travel: [
    { title: "대한항공, 2분기 국제선 탑승률 역대 최고 91%", summary: "대한항공이 2분기 국제선 평균 탑승률 91%를 기록해 사상 최고치를 경신했다. 일본·동남아 노선이 특히 강세를 보였다.", source: "연합뉴스", time: "오전 8:30", url: "https://www.yna.co.kr" },
    { title: "일본·동남아 여름 여행 예약 급증…항공권 가격 강세", summary: "여름 성수기 일본과 동남아 여행 예약이 전년 대비 30% 이상 증가했다. 항공권 가격도 덩달아 오르고 있다.", source: "조선비즈", time: "오전 9:45", url: "https://biz.chosun.com" },
  ],
  green_energy: [
    { title: "정부, 신재생에너지 보조금 2조 원 추가 편성", summary: "정부가 친환경 에너지 전환 가속화를 위해 신재생에너지 보조금 2조 원을 추가 편성했다. 태양광·ESS 업체들이 주요 수혜 대상이다.", source: "매일경제", time: "오전 8:45", url: "https://www.mk.co.kr" },
    { title: "국내 태양광 설비 누적 30GW 돌파…역대 최대", summary: "국내 태양광 발전 설비 누적 용량이 30GW를 돌파해 역대 최대 기록을 세웠다. 정부 목표치를 앞당겨 달성했다는 평가다.", source: "에너지경제", time: "오전 10:15", url: "https://www.ekn.kr" },
  ],
  food: [
    { title: "시카고 밀 선물 2주 만에 8% 급등…식품업계 원가 비상", summary: "국제 밀 선물 가격이 2주 만에 8% 급등했다. 국내 제분·라면 업체들의 원가 부담이 크게 늘어날 것으로 우려된다.", source: "한국경제", time: "오전 9:30", url: "https://www.hankyung.com" },
    { title: "농심·오뚜기, 하반기 라면값 인상 검토 중", summary: "농심과 오뚜기가 하반기 라면 가격 인상을 내부 검토 중인 것으로 알려졌다. 원자재 비용 상승이 가격 인상 압력으로 작용하고 있다.", source: "매일경제", time: "오전 11:00", url: "https://www.mk.co.kr" },
  ],
  construction: [
    { title: "부동산 PF 부실 5조 원 확인…중소 건설사 위기", summary: "금융권에서 확인된 부동산 PF 부실 규모가 5조 원을 넘어섰다. 중소 건설사 폐업 도미노 우려가 현실화될 수 있다는 경고가 나온다.", source: "매일경제", time: "오전 8:15", url: "https://www.mk.co.kr" },
    { title: "서울 아파트 미분양 3만 가구 육박…청약 미달 속출", summary: "서울 내 아파트 미분양 가구 수가 3만 가구에 육박하고 있다. 고금리·경기 침체로 인한 수요 감소가 주된 원인으로 꼽힌다.", source: "조선비즈", time: "오전 9:45", url: "https://biz.chosun.com" },
    { title: "중소 건설사 연쇄 폐업 우려…정부 긴급 자금 지원 검토", summary: "건설업계의 위기가 중소 업체를 중심으로 확산되면서 정부가 긴급 자금 지원 방안을 검토하고 있다.", source: "뉴시스", time: "오전 11:00", url: "https://www.newsis.com" },
  ],
  geopolitics: [
    { title: "미·중 무역 협상 결렬…상호 관세 추가 부과 임박", summary: "미국과 중국의 고위급 무역 협상이 합의 없이 끝났다. 양측이 추가 관세 부과를 예고하며 글로벌 공급망 불안이 고조되고 있다.", source: "연합뉴스", time: "오전 7:55", url: "https://www.yna.co.kr" },
    { title: "NATO 긴급회의 소집…동유럽 안보 불안 고조", summary: "나토가 동유럽 긴장 고조를 이유로 긴급 회의를 소집했다. 회원국들은 방위비 추가 분담에 합의할 것으로 전망된다.", source: "조선비즈", time: "오전 9:00", url: "https://biz.chosun.com" },
  ],
  global_trade: [
    { title: "상하이 컨테이너 운임 2주 연속 하락…수요 둔화 우려", summary: "상하이발 컨테이너 운임이 2주 연속 하락했다. 글로벌 교역량 둔화 우려가 해운 시장에 반영된 것으로 분석된다.", source: "연합뉴스", time: "오전 8:00", url: "https://www.yna.co.kr" },
    { title: "한국 무역수지 4개월 연속 흑자…반도체 수출 견인", summary: "한국의 무역수지가 4개월 연속 흑자를 이어갔다. 반도체 수출 호조가 전체 수출 증가를 이끌었다.", source: "매일경제", time: "오전 10:00", url: "https://www.mk.co.kr" },
  ],
};

// ── 댓글 컴포넌트 ──────────────────────────────────────────────────
function DiscussionSection({
  date, sectorId, newsIdx, user,
}: {
  date: string;
  sectorId: string;
  newsIdx: number;
  user: { id: string; displayName: string; role: string } | null;
}) {
  const { comments, isLoading } = useNewsComments(date, sectorId, newsIdx);
  const [body, setBody] = useState("");
  const [type, setType] = useState<"comment" | "rebuttal">("comment");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) { toast.error("로그인이 필요해요."); return; }
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await addNewsComment({
        date, sectorId, newsIdx,
        userId: user.id,
        displayName: user.displayName,
        body: body.trim(),
        type,
      });
      setBody("");
      toast.success(type === "rebuttal" ? "반박 의견이 등록됐어요" : "댓글이 등록됐어요");
    } catch {
      toast.error("등록에 실패했어요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      {/* 기존 댓글 */}
      {!isLoading && comments.length > 0 && (
        <div className="space-y-2">
          {comments.map(c => (
            <div key={c.id} className={cn(
              "flex gap-2.5 p-3 rounded-xl text-sm",
              c.type === "rebuttal"
                ? "bg-amber-50 border border-amber-100"
                : "bg-slate-50 border border-slate-100"
            )}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold bg-indigo-100 text-indigo-600">
                {c.displayName?.[0] ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-slate-700 text-xs">{c.displayName}</span>
                  {c.type === "rebuttal" && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 rounded-full">반박</span>
                  )}
                </div>
                <p className="text-slate-600 leading-relaxed">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {!isLoading && comments.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-2">아직 의견이 없어요. 첫 번째로 남겨보세요!</p>
      )}

      {/* 입력 */}
      {user ? (
        <div className="space-y-2">
          <div className="flex gap-1.5">
            <button
              onClick={() => setType("comment")}
              className={cn(
                "text-xs px-3 py-1 rounded-full font-bold border transition-colors",
                type === "comment"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300"
              )}
            >
              💬 댓글
            </button>
            <button
              onClick={() => setType("rebuttal")}
              className={cn(
                "text-xs px-3 py-1 rounded-full font-bold border transition-colors",
                type === "rebuttal"
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-white text-slate-500 border-slate-200 hover:border-amber-300"
              )}
            >
              ⚔️ 반박
            </button>
          </div>
          <div className="flex gap-2">
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder={type === "rebuttal" ? "AI의 해석에 반박하는 근거를 작성하세요..." : "이 뉴스에 대한 의견을 남겨보세요..."}
              rows={2}
              className="flex-1 text-sm p-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 outline-none resize-none bg-white"
            />
            <button
              onClick={handleSubmit}
              disabled={submitting || !body.trim()}
              className="px-3 py-2 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-40 hover:bg-indigo-700 transition-colors flex-shrink-0"
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <Link
          href="/login"
          className="block text-center text-xs text-indigo-600 hover:underline py-1"
        >
          로그인하고 의견 남기기 →
        </Link>
      )}
    </div>
  );
}

// ── 뉴스 아이템 카드 ──────────────────────────────────────────────
function NewsCard({
  news, idx, sectorId, date, user,
}: {
  news: { title: string; summary: string; source: string; time: string; url: string };
  idx: number;
  sectorId: string;
  date: string;
  user: { id: string; displayName: string; role: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const { comments } = useNewsComments(date, sectorId, idx);

  const objectionUrl = `/student/objections/new?sectorId=${sectorId}&newsTitle=${encodeURIComponent(news.title)}&newsSource=${encodeURIComponent(news.source)}&newsUrl=${encodeURIComponent(news.url)}`;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <span className="text-sm font-bold text-slate-300 mt-1 w-5 flex-shrink-0">{idx + 1}</span>
          <div className="flex-1 min-w-0">
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <h3 className="font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors text-base">
                {news.title}
                <ExternalLinkIcon className="inline w-3.5 h-3.5 ml-1.5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
              </h3>
            </a>
            <p className="text-sm text-slate-500 leading-relaxed mt-1.5">{news.summary}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold text-indigo-600">{news.source}</span>
              <span className="text-xs text-slate-300">·</span>
              <span className="text-xs text-slate-400">{news.time}</span>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-2 mt-3 pl-8">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-indigo-50"
          >
            <MessageCircleIcon className="w-3.5 h-3.5" />
            토론 {comments.length > 0 && <span className="text-indigo-600">({comments.length})</span>}
            {open ? <ChevronUpIcon className="w-3 h-3" /> : <ChevronDownIcon className="w-3 h-3" />}
          </button>

          {user?.role === "student" && (
            <Link
              href={objectionUrl}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-800 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-amber-50"
            >
              <AlertTriangleIcon className="w-3.5 h-3.5" />
              이의제기 근거로 사용
            </Link>
          )}
        </div>
      </div>

      {/* 토론 영역 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-100 bg-slate-50/50 px-5 pb-4 pt-3"
          >
            <DiscussionSection
              date={date}
              sectorId={sectorId}
              newsIdx={idx}
              user={user}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── 메인 페이지 ────────────────────────────────────────────────────
export default function NewsPage() {
  const { user } = useUser();
  const { scores } = usePublicScores();
  const today = getKSTDateStr();

  const [activeSector, setActiveSector] = useState("semiconductor");

  // 섹터 탭 목록 (publicScores 있으면 등락률 반영)
  const sectorTabs = useMemo(() => {
    const ORDER = Object.keys(SECTOR_META);
    if (scores?.sectorScores?.length) {
      return [...scores.sectorScores]
        .sort((a, b) => b.impactScore - a.impactScore)
        .map(s => ({
          id: s.sectorId,
          name: SECTOR_META[s.sectorId]?.name ?? s.sectorName,
          icon: SECTOR_META[s.sectorId]?.icon ?? "📊",
          dailyReturn: s.dailyReturn,
          rationale: s.rationale,
        }));
    }
    return ORDER.map(id => ({
      id,
      name: SECTOR_META[id].name,
      icon: SECTOR_META[id].icon,
      dailyReturn: null as number | null,
      rationale: "",
    }));
  }, [scores]);

  const activeTab = sectorTabs.find(s => s.id === activeSector) ?? sectorTabs[0];

  // 뉴스 목록: Firestore에 저장된 실데이터 우선, 없으면 mock
  const activeNews = useMemo(() => {
    const firestoreNews = (scores as any)?.sectorNews?.[activeSector];
    if (firestoreNews?.length) return firestoreNews;
    return MOCK_NEWS[activeSector] ?? [];
  }, [scores, activeSector]);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* 헤더 */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-slate-700 transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <SparklesIcon className="w-4 h-4 text-indigo-500" />
            오늘의 섹터별 뉴스
          </div>
          <span className="text-xs text-slate-400 ml-auto">{today}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* 섹터 탭 */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex overflow-x-auto scrollbar-none border-b border-slate-100">
            {sectorTabs.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSector(s.id)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-3 flex-shrink-0 border-b-2 transition-all",
                  activeSector === s.id
                    ? "border-indigo-500 bg-indigo-50/60 text-indigo-700"
                    : "border-transparent text-slate-500 hover:bg-slate-50"
                )}
              >
                <span className="text-xl">{s.icon}</span>
                <span className="text-xs font-bold whitespace-nowrap">{s.name}</span>
                {s.dailyReturn !== null && (
                  <span className={cn(
                    "text-[10px] font-bold",
                    s.dailyReturn >= 0 ? "text-emerald-600" : "text-red-500"
                  )}>
                    {s.dailyReturn >= 0 ? "+" : ""}{s.dailyReturn.toFixed(1)}%
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* AI 해석 */}
          {activeTab?.rationale && (
            <div className="px-5 py-3.5 flex items-start gap-2.5 bg-indigo-50/50">
              <SparklesIcon className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-indigo-600 mb-0.5">AI의 해석</div>
                <p className="text-sm text-slate-600 leading-relaxed">{activeTab.rationale}</p>
              </div>
            </div>
          )}
        </div>

        {/* 섹터 반환률 배너 */}
        {activeTab?.dailyReturn !== null && (
          <div className={cn(
            "flex items-center gap-3 px-5 py-3 rounded-2xl border",
            (activeTab.dailyReturn ?? 0) >= 0
              ? "bg-emerald-50 border-emerald-200"
              : "bg-red-50 border-red-200"
          )}>
            {(activeTab.dailyReturn ?? 0) >= 0
              ? <TrendingUpIcon className="w-5 h-5 text-emerald-600" />
              : <TrendingDownIcon className="w-5 h-5 text-red-500" />
            }
            <div>
              <span className="font-bold text-slate-800">{activeTab.name}</span>
              <span className="text-sm text-slate-500 ml-2">오늘</span>
            </div>
            <span className={cn(
              "ml-auto text-2xl font-display font-bold",
              (activeTab.dailyReturn ?? 0) >= 0 ? "text-emerald-600" : "text-red-500"
            )}>
              {(activeTab.dailyReturn ?? 0) >= 0 ? "+" : ""}{activeTab.dailyReturn?.toFixed(2)}%
            </span>
          </div>
        )}

        {/* 뉴스 목록 */}
        <div className="space-y-3">
          {activeNews.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
              <p className="text-slate-400 text-sm">해당 섹터 뉴스를 준비 중이에요</p>
            </div>
          )}
          {activeNews.map((news: any, idx: number) => (
            <NewsCard
              key={idx}
              news={news}
              idx={idx}
              sectorId={activeSector}
              date={today}
              user={user as any}
            />
          ))}
        </div>

        {/* 이의제기 안내 (학생 비로그인) */}
        {!user && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center space-y-2">
            <p className="text-sm font-bold text-amber-700">
              뉴스에 이의제기하고 싶으신가요?
            </p>
            <p className="text-xs text-amber-600">학생 계정으로 로그인하면 AI 해석에 반박 근거를 제출할 수 있어요</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:underline mt-1"
            >
              로그인하기 <ArrowLeftIcon className="w-3 h-3 rotate-180" />
            </Link>
          </div>
        )}

      </main>
    </div>
  );
}
