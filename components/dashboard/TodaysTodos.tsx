import { cn } from "@/lib/utils";
import { CheckCircleIcon, CircleIcon, SparklesIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";

interface Todo {
  id: string;
  label: string;
  completedCount: number;
  totalCount: number;
  href?: string;
}

export function TodaysTodos() {
  const todos: Todo[] = [
    { id: 'news', label: '섹터 뉴스 확인하기', completedCount: 0, totalCount: 10, href: '/student/briefing' },
    { id: 'portfolio', label: '내 포트폴리오 점검', completedCount: 1, totalCount: 1, href: '/student/portfolio' },
    { id: 'objection', label: '섹터 영향도 검증 (이의)', completedCount: 0, totalCount: 3, href: '/student/briefing' },
    { id: 'discussion', label: '조 토론 참여', completedCount: 0, totalCount: 1, href: '/student/group' },
  ];

  const isAllDone = todos.every(t => t.completedCount >= t.totalCount);

  return (
    <div className="glass p-5 flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          오늘 할 일
        </h3>
      </div>

      <div className="space-y-3 flex-1">
        {todos.map((todo, i) => {
          const isDone = todo.completedCount >= todo.totalCount;
          return (
            <div key={todo.id} className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {isDone ? (
                  <CheckCircleIcon className="w-5 h-5 text-brand-400" />
                ) : (
                  <CircleIcon className="w-5 h-5 text-muted-foreground/50" />
                )}
              </div>
              <div className={cn("flex-1 text-sm font-medium", isDone ? "text-muted-foreground line-through" : "text-foreground")}>
                {i + 1}. {todo.label}
              </div>
              <div className={cn("text-xs font-mono", isDone ? "text-brand-400" : "text-muted-foreground")}>
                {todo.completedCount}/{todo.totalCount}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className="text-muted-foreground">모두 완료 시</span>
          <span className="font-bold flex items-center gap-1 text-yellow-400">
            <SparklesIcon className="w-4 h-4" /> +100P
          </span>
        </div>
        
        <Link 
          href="/student/briefing"
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all",
            isAllDone 
              ? "bg-brand-500/20 text-brand-300 cursor-default" 
              : "bg-brand-500 text-white hover:bg-brand-600 shadow-[0_4px_14px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)]"
          )}
        >
          {isAllDone ? '미션 완료!' : '미션 시작하기'}
          {!isAllDone && <ChevronRightIcon className="w-4 h-4" />}
        </Link>
      </div>
    </div>
  );
}
