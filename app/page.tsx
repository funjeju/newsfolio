import { MOCK_SECTORS, MOCK_IMPACTS } from "@/lib/mockData";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import Link from "next/link";
import { ArrowRightIcon, TrendingUpIcon, BookOpenIcon, UsersIcon } from "lucide-react";

export default function PublicLeaderboardPage() {
  const sorted = [...MOCK_IMPACTS].sort((a, b) => b.dailyReturn - a.dailyReturn);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-bold text-xl">
            <span>📰</span>
            <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">Newsfolio</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">로그인</Link>
            <Link
              href="/join"
              className="text-sm px-4 py-2 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition-colors"
            >
              시작하기
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-12">
        {/* Hero */}
        <section className="text-center space-y-5 pt-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-400 bg-brand-500/10 border border-brand-500/20 px-3 py-1.5 rounded-full">
            <TrendingUpIcon className="w-3.5 h-3.5" /> 오늘의 AI 경제 분석 공개 중
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">
            뉴스로 배우는<br />
            <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">경제 시뮬레이션</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            AI가 오늘 뉴스를 분석해서 섹터별 영향도를 점수로 알려줘요.<br />
            선생님과 함께하면 직접 이의제기하고 포트폴리오도 운영해볼 수 있어요!
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/join"
              className="flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-2xl font-bold hover:bg-brand-600 transition-colors shadow-[0_4px_20px_rgba(99,102,241,0.4)]"
            >
              학급 코드로 참여하기 <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-border/50 rounded-2xl font-medium hover:bg-white/10 transition-colors"
            >
              로그인
            </Link>
          </div>
        </section>

        {/* Live Leaderboard */}
        <section className="glass rounded-3xl border border-border/50 overflow-hidden">
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-bold">오늘의 섹터 순위</h2>
              <p className="text-sm text-muted-foreground mt-1">AI가 분석한 오늘의 뉴스 영향도 · 매일 오전 6시 업데이트</p>
            </div>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-full font-bold">LIVE</span>
          </div>

          {/* Table header */}
          <div className="hidden md:flex items-center gap-4 px-6 py-3 bg-white/5 border-b border-border/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="w-8 text-center">순위</div>
            <div className="flex-1">섹터</div>
            <div className="w-32 text-center">영향도</div>
            <div className="w-20 text-right">등락률</div>
          </div>

          <div className="divide-y divide-border/30">
            {sorted.map((impact, i) => {
              const sector = MOCK_SECTORS.find(s => s.id === impact.sectorId)!;
              const isPos = impact.dailyReturn > 0;
              return (
                <div key={sector.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors">
                  <div className="w-8 text-center font-bold">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span className="text-muted-foreground">{i + 1}</span>}
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-2xl">{sector.icon}</span>
                    <div>
                      <div className="font-bold">{sector.name}</div>
                      <div className="text-xs text-muted-foreground hidden sm:block truncate max-w-xs">{impact.rationaleSummary}</div>
                    </div>
                  </div>
                  <div className="w-32 hidden md:flex justify-center">
                    <ScoreBadge score={impact.impactScore} />
                  </div>
                  <div className={`w-20 text-right font-mono font-bold ${isPos ? "text-emerald-400" : impact.dailyReturn < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                    {isPos ? "+" : ""}{impact.dailyReturn.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-6 py-4 bg-white/5 border-t border-border/30 text-xs text-muted-foreground text-center">
            전체 기능은 선생님과 함께 학급 코드로 참여하면 이용할 수 있어요 🎓
          </div>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: <TrendingUpIcon className="w-6 h-6 text-brand-400" />, title: "AI 뉴스 분석", desc: "매일 오전 AI가 뉴스를 분석해서 섹터별 영향도를 점수로 알려줘요" },
            { icon: <BookOpenIcon className="w-6 h-6 text-purple-400" />, title: "이의제기로 배우기", desc: "AI 판단에 동의하지 않으면 뉴스 근거로 이의제기할 수 있어요" },
            { icon: <UsersIcon className="w-6 h-6 text-emerald-400" />, title: "조별 포트폴리오", desc: "팀원과 함께 포트폴리오를 운영하며 경제를 직접 경험해보세요" },
          ].map(f => (
            <div key={f.title} className="glass p-6 rounded-2xl border border-border/50 space-y-3">
              {f.icon}
              <h3 className="font-bold text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>

        <footer className="text-center text-xs text-muted-foreground pb-8">
          © 2026 Newsfolio · 선생님 문의: <Link href="/login" className="text-brand-400 hover:underline">교사 계정으로 시작하기</Link>
        </footer>
      </main>
    </div>
  );
}
