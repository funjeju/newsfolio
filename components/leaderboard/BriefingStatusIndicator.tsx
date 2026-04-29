import { cn } from "@/lib/utils";
import type { Briefing } from "@/types/schema";

interface Props {
  briefing: Briefing | null;
  confirmDeadline?: string; // "16:00"
}

function deriveStatus(briefing: Briefing | null): 'analyzing' | 'reviewing' | 'confirmed' {
  if (!briefing) return 'analyzing';
  if (briefing.status === 'approved' || briefing.status === 'auto_approved') return 'confirmed';
  if (briefing.status === 'pending_review') return 'reviewing';
  return 'analyzing';
}

export function BriefingStatusIndicator({ briefing, confirmDeadline = "16:00" }: Props) {
  const status = deriveStatus(briefing);

  const steps = [
    { id: 'analyzing', icon: '🤖', label: 'AI 분석 중', time: 'AM 06:00' },
    { id: 'reviewing', icon: '👨‍🏫', label: '교사 검토 중', time: 'PM 02:30' },
    { id: 'confirmed', icon: '✓', label: '오늘 확정', time: `PM ${confirmDeadline.replace(':', ':')}` },
  ];

  const currentIndex = steps.findIndex(s => s.id === status);

  return (
    <div className="flex items-center justify-between max-w-md w-full mx-auto relative px-4">
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0" />
      <div
        className="absolute top-1/2 left-0 h-0.5 bg-brand-500 -translate-y-1/2 z-0 transition-all duration-500"
        style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
      />

      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isPast = index < currentIndex;
        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 transition-colors",
              isActive ? "bg-brand-500 border-brand-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                : isPast ? "bg-brand-900 border-brand-500 text-brand-300"
                : "bg-card border-border text-muted-foreground"
            )}>
              {step.icon}
            </div>
            <div className="text-center">
              <p className={cn("text-sm font-semibold", isActive ? "text-brand-400" : "text-muted-foreground")}>{step.label}</p>
              <p className="text-[10px] text-muted-foreground">{step.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
