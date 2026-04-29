"use client";

import { useState } from "react";
import { TrendingUpIcon, TrendingDownIcon, SearchIcon, TrophyIcon } from "lucide-react";
import { useUser } from "@/lib/hooks/useUser";

type Period = "daily" | "weekly" | "monthly" | "alltime";

const MOCK_RANKING = [
  { rank: 1,   name: "투자왕김철수",   value: 1182000, cumReturn: 18.2,  dailyReturn: 2.4,  sectors: ["반도체", "방산", "에너지"] },
  { rank: 2,   name: "뉴스읽는사람",   value: 1153000, cumReturn: 15.3,  dailyReturn: 1.8,  sectors: ["방산", "에너지"] },
  { rank: 3,   name: "섹터분석가",     value: 1141000, cumReturn: 14.1,  dailyReturn: 1.1,  sectors: ["반도체", "인프라"] },
  { rank: 4,   name: "경제유튜버fan",  value: 1120000, cumReturn: 12.0,  dailyReturn: 0.9,  sectors: ["바이오", "에너지"] },
  { rank: 5,   name: "금리맞힌사람",   value: 1098000, cumReturn: 9.8,   dailyReturn: -0.2, sectors: ["금융", "부동산"] },
  { rank: 6,   name: "뉴스포트리오",   value: 1087000, cumReturn: 8.7,   dailyReturn: 0.5,  sectors: ["반도체", "자동차"] },
  { rank: 7,   name: "개미투자자",     value: 1075000, cumReturn: 7.5,   dailyReturn: 1.2,  sectors: ["방산"] },
  { rank: 8,   name: "경제공부중",     value: 1063000, cumReturn: 6.3,   dailyReturn: -0.8, sectors: ["바이오", "미디어"] },
  { rank: 142, name: "나 (현재 접속)", value: 1038000, cumReturn: 3.8,   dailyReturn: 1.86, sectors: ["반도체", "바이오", "금융"], isMe: true },
  { rank: 143, name: "주식공부시작",   value: 1037000, cumReturn: 3.7,   dailyReturn: 0.3,  sectors: ["에너지"] },
  { rank: 144, name: "뉴스읽기싫어",   value: 1035000, cumReturn: 3.5,   dailyReturn: -0.1, sectors: ["자동차"] },
  { rank: 145, name: "초보투자자123",  value: 1031000, cumReturn: 3.1,   dailyReturn: 0.7,  sectors: ["금융", "식품·소비"] },
];

const PERIOD_LABELS: Record<Period, string> = {
  daily: "오늘",
  weekly: "이번 주",
  monthly: "이번 달",
  alltime: "전체 기간",
};

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return <span className="text-sm font-bold text-muted-foreground w-7 text-center">{rank}</span>;
}

export default function SoloRanking() {
  const { user } = useUser();
  const [period, setPeriod] = useState<Period>("alltime");
  const [search, setSearch] = useState("");

  const myEntry = MOCK_RANKING.find(r => r.isMe);
  const topThree = MOCK_RANKING.filter(r => r.rank <= 3);
  const filtered = MOCK_RANKING.filter(r =>
    !r.isMe || search === ""
      ? r.name.includes(search) || search === ""
      : true
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold">개인 랭킹</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          전국 개인 투자자들과 수익률을 비교해보세요
        </p>
      </div>

      {/* My Position Banner */}
      {myEntry && (
        <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-4">
          <div className="text-3xl font-display font-bold text-emerald-400">{myEntry.rank}위</div>
          <div className="flex-1">
            <div className="font-bold">{user?.displayName ?? myEntry.name}</div>
            <div className="text-sm text-muted-foreground">
              {myEntry.value.toLocaleString()}원 · 누적 +{myEntry.cumReturn.toFixed(1)}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">상위</div>
            <div className="text-lg font-bold text-emerald-400">
              {((myEntry.rank / 3841) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-3">
        {[topThree[1], topThree[0], topThree[2]].map((entry, i) => {
          if (!entry) return null;
          const heights = ["h-24", "h-32", "h-20"];
          return (
            <div key={entry.rank} className="flex flex-col items-center gap-2">
              <div className="text-center">
                <div className="font-bold text-xs text-foreground truncate max-w-[80px]">{entry.name}</div>
                <div className={`text-xs font-bold ${entry.cumReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  +{entry.cumReturn.toFixed(1)}%
                </div>
              </div>
              <div
                className={`${heights[i]} w-full rounded-t-2xl flex items-end justify-center pb-2 ${
                  i === 1 ? "bg-gradient-to-t from-yellow-500/30 to-yellow-500/10 border border-yellow-500/30" :
                  i === 0 ? "bg-gradient-to-t from-slate-400/30 to-slate-400/10 border border-slate-400/30" :
                  "bg-gradient-to-t from-amber-600/30 to-amber-600/10 border border-amber-600/30"
                }`}
              >
                <RankBadge rank={entry.rank} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Period Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
          {(["daily", "weekly", "monthly", "alltime"] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                period === p ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
        <div className="relative sm:w-52">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="닉네임 검색"
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-card border border-border text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Ranking List */}
      <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[2rem_1fr_auto_auto] gap-3 px-5 py-3 border-b border-border/50 text-xs font-bold text-muted-foreground uppercase tracking-wide">
          <div>#</div>
          <div>투자자</div>
          <div className="text-right">포트폴리오</div>
          <div className="text-right">수익률</div>
        </div>
        <div className="divide-y divide-border/30">
          {filtered.slice(0, 8).map(entry => (
            <div
              key={entry.rank}
              className={`grid grid-cols-[2rem_1fr_auto_auto] gap-3 px-5 py-3.5 items-center transition-colors ${
                entry.isMe ? "bg-emerald-500/10" : "hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center justify-center">
                <RankBadge rank={entry.rank} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate flex items-center gap-1.5">
                  {entry.name}
                  {entry.isMe && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-bold">나</span>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {entry.sectors.join(" · ")}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">{entry.value.toLocaleString()}원</div>
                <div className={`text-xs flex items-center justify-end gap-0.5 ${entry.dailyReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {entry.dailyReturn >= 0
                    ? <TrendingUpIcon className="w-3 h-3" />
                    : <TrendingDownIcon className="w-3 h-3" />}
                  오늘 {entry.dailyReturn >= 0 ? "+" : ""}{entry.dailyReturn.toFixed(2)}%
                </div>
              </div>
              <div className={`text-right font-bold text-sm ${entry.cumReturn >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {entry.cumReturn >= 0 ? "+" : ""}{entry.cumReturn.toFixed(1)}%
              </div>
            </div>
          ))}
          {/* Always show "me" if not in current range */}
          {myEntry && !filtered.slice(0, 8).some(r => r.isMe) && (
            <>
              <div className="px-5 py-2 text-center text-xs text-muted-foreground">···</div>
              <div className="grid grid-cols-[2rem_1fr_auto_auto] gap-3 px-5 py-3.5 items-center bg-emerald-500/10">
                <div className="flex items-center justify-center">
                  <RankBadge rank={myEntry.rank} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold truncate flex items-center gap-1.5">
                    {user?.displayName ?? myEntry.name}
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-bold">나</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {myEntry.sectors.join(" · ")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{myEntry.value.toLocaleString()}원</div>
                  <div className="text-xs flex items-center justify-end gap-0.5 text-emerald-400">
                    <TrendingUpIcon className="w-3 h-3" />
                    오늘 +{myEntry.dailyReturn.toFixed(2)}%
                  </div>
                </div>
                <div className="text-right font-bold text-sm text-emerald-400">
                  +{myEntry.cumReturn.toFixed(1)}%
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: "전체 참여자", value: "3,841명" },
          { label: "평균 수익률", value: "+2.1%" },
          { label: "최고 수익률", value: "+18.2%" },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border/50 rounded-xl py-3">
            <div className="text-lg font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
