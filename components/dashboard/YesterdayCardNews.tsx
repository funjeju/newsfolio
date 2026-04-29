import { ImageIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";

export function YesterdayCardNews() {
  return (
    <div className="glass p-5 flex flex-col h-full relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900/50 to-background/50 z-0" />
      
      <div className="relative z-10 flex justify-between items-start mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          오늘의 카드뉴스
        </h3>
        <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">1/5</span>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center items-center gap-4 py-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100/70 border border-white/10 flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform duration-500">
          <ImageIcon className="w-8 h-8" />
        </div>
        <div className="text-center">
          <h4 className="font-bold text-xl leading-tight">"전기차 시장<br/>성장세 둔화?"</h4>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">어제 자동차 섹터를 뒤흔든 핵심 이슈를 알아봐요.</p>
        </div>
      </div>

      <div className="relative z-10 mt-auto pt-4 border-t border-border/50 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">어제 발생한 주요 뉴스 요약</span>
        <Link href="/student/reports" className="text-sm font-medium text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
          더보기 <ChevronRightIcon className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
