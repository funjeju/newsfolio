"use client";

import { useState } from "react";
import { XIcon, SearchIcon, BookmarkIcon, ExternalLinkIcon, CheckCircleIcon, AlertCircleIcon, ClockIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import * as motion from "framer-motion/client";
import { AnimatePresence } from "framer-motion";

interface NewsResult {
  id: string;
  domain: string;
  domainIcon: string;
  headline: string;
  summary: string;
  publishedAt: string;
  hoursAgo: number;
  isValid: boolean;
  url: string;
}

interface BookmarkedDomain {
  id: string;
  name: string;
  domain: string;
  icon: string;
  category: string;
}

const WHITELIST_DOMAINS: BookmarkedDomain[] = [
  { id: "d1", name: "한국경제", domain: "hankyung.com", icon: "📰", category: "경제" },
  { id: "d2", name: "매일경제", domain: "mk.co.kr", icon: "📊", category: "경제" },
  { id: "d3", name: "연합뉴스", domain: "yna.co.kr", icon: "🏛️", category: "종합" },
  { id: "d4", name: "조선일보", domain: "chosun.com", icon: "📋", category: "종합" },
  { id: "d5", name: "전자신문", domain: "etnews.com", icon: "💻", category: "IT" },
  { id: "d6", name: "ZDNet Korea", domain: "zdnet.co.kr", icon: "🔬", category: "IT" },
];

const MOCK_SEARCH_RESULTS: NewsResult[] = [
  {
    id: "r1", domain: "한국경제", domainIcon: "📰",
    headline: "반도체 수출 규제 완화…삼성·하이닉스 수혜 기대",
    summary: "미국 상무부가 반도체 수출 규제 일부를 완화하면서 국내 반도체 기업들의 수혜가 예상됩니다.",
    publishedAt: "2026-04-29 09:30", hoursAgo: 3, isValid: true, url: "#",
  },
  {
    id: "r2", domain: "매일경제", domainIcon: "📊",
    headline: "반도체 업계 환영…투자 확대 본격화될 듯",
    summary: "반도체 업계에서는 이번 규제 완화를 긍정적으로 받아들이며 투자 확대 계획을 검토 중입니다.",
    publishedAt: "2026-04-29 11:15", hoursAgo: 1, isValid: true, url: "#",
  },
  {
    id: "r3", domain: "연합뉴스", domainIcon: "🏛️",
    headline: "HBM 수요 급증…AI 서버 확대에 국내 기업 수혜",
    summary: "AI 서버 증설로 인한 HBM 수요 급증이 국내 반도체 기업들의 실적 개선으로 이어질 전망입니다.",
    publishedAt: "2026-04-28 18:00", hoursAgo: 18, isValid: false, url: "#",
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectSource: (source: { id: string; domain: string; headline: string; publishedAt: string; isValid: boolean }) => void;
  sectorName?: string;
}

export function VirtualBrowserSheet({ isOpen, onClose, onSelectSource, sectorName }: Props) {
  const [searchQuery, setSearchQuery] = useState(sectorName || "");
  const [results, setResults] = useState<NewsResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearched(false);
    await new Promise(r => setTimeout(r, 800));
    const filtered = selectedDomain
      ? MOCK_SEARCH_RESULTS.filter(r => r.domain === selectedDomain)
      : MOCK_SEARCH_RESULTS;
    setResults(filtered);
    setIsSearching(false);
    setSearched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:max-w-2xl md:bottom-auto md:top-1/2 md:-translate-y-1/2 z-50 bg-card border border-border/50 rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <span className="font-bold text-sm">뉴스 가상 브라우저</span>
                {sectorName && (
                  <span className="text-xs text-brand-400 bg-brand-500/15 px-2 py-0.5 rounded-full">
                    {sectorName} 섹터 검색 중
                  </span>
                )}
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Safety Notice */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-brand-500/5 border-b border-brand-500/15 text-xs text-brand-400 flex-shrink-0">
              <AlertCircleIcon className="w-3.5 h-3.5 flex-shrink-0" />
              화이트리스트 도메인만 검색 가능해요. 24시간 이내 기사만 출처로 사용할 수 있어요.
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Search Bar */}
              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-white/5 border border-border/50 rounded-xl px-3 py-2.5 focus-within:border-brand-500/50">
                    <SearchIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="검색어 입력 (예: 반도체 수출 규제)"
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-4 py-2.5 bg-brand-500 text-white rounded-xl font-bold text-sm hover:bg-brand-600 transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    {isSearching ? "검색 중..." : "검색"}
                  </button>
                </div>

                {/* Domain Bookmarks */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">허용 도메인 빠른 선택</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedDomain(null)}
                      className={cn(
                        "flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all",
                        !selectedDomain ? "bg-brand-500/20 border-brand-500/40 text-brand-300" : "bg-white/5 border-border/50 text-muted-foreground hover:border-white/20"
                      )}
                    >
                      전체
                    </button>
                    {WHITELIST_DOMAINS.map(d => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedDomain(selectedDomain === d.name ? null : d.name)}
                        className={cn(
                          "flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all",
                          selectedDomain === d.name
                            ? "bg-brand-500/20 border-brand-500/40 text-brand-300"
                            : "bg-white/5 border-border/50 text-muted-foreground hover:border-white/20"
                        )}
                      >
                        <span>{d.icon}</span>
                        {d.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Results */}
              {isSearching && (
                <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
                  <div className="w-5 h-5 border-2 border-brand-500/50 border-t-brand-500 rounded-full animate-spin" />
                  <span className="text-sm">뉴스 검색 중...</span>
                </div>
              )}

              {searched && !isSearching && (
                <div className="px-4 pb-4 space-y-2">
                  <p className="text-xs text-muted-foreground font-medium mb-3">
                    검색 결과 {results.length}건
                    <span className="ml-2 text-amber-400">✅ = 24시간 이내 사용 가능</span>
                  </p>
                  {results.map((result, i) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "p-4 rounded-xl border transition-all",
                        result.isValid
                          ? "bg-white/5 border-border/50 hover:border-brand-500/30"
                          : "bg-white/3 border-border/20 opacity-60"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-brand-400 font-bold text-sm">
                            {result.domainIcon} {result.domain}
                          </span>
                          {result.isValid ? (
                            <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                              <CheckCircleIcon className="w-2.5 h-2.5" /> 사용 가능
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded-full">
                              <ClockIcon className="w-2.5 h-2.5" /> {result.hoursAgo}시간 전 (기한 초과)
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                          {result.publishedAt}
                        </span>
                      </div>

                      <p className="font-semibold text-sm mb-1 leading-snug">{result.headline}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{result.summary}</p>

                      {result.isValid && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => {
                              onSelectSource({
                                id: result.id,
                                domain: result.domain,
                                headline: result.headline,
                                publishedAt: result.publishedAt,
                                isValid: result.isValid,
                              });
                              onClose();
                            }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-lg text-xs font-bold hover:bg-brand-500/30 transition-colors"
                          >
                            <BookmarkIcon className="w-3 h-3" /> 출처로 추가
                          </button>
                          <button className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-border/50 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">
                            <ExternalLinkIcon className="w-3 h-3" /> 전체 보기
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {!searched && !isSearching && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center px-8">
                  <div className="text-4xl">🔍</div>
                  <p className="text-sm font-medium">검색어를 입력하고 기사를 찾아보세요</p>
                  <p className="text-xs text-muted-foreground">허용된 언론사의 기사만 이의제기 출처로 사용할 수 있어요</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
