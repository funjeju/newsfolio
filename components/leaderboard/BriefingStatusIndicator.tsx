import { cn } from "@/lib/utils";
import type { Briefing } from "@/types/schema";

interface Props {
  briefing: Briefing | null;
  confirmDeadline?: string;
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
    { id: 'confirmed', icon: '✓', label: '오늘 확정', time: `PM ${confirmDeadline}` },
  ];

  const currentIndex = steps.findIndex(s => s.id === status);

  return (
    <div className="flex items-center justify-between max-w-md w-full mx-auto relative px-4">
      {/* track */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 z-0" />
      <div
        className="absolute top-5 left-0 h-0.5 bg-indigo-500 z-0 transition-all duration-500"
        style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
      />

      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isPast = index < currentIndex;
        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold border-2 transition-colors",
              isActive
                ? "bg-indigo-600 border-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                : isPast
                ? "bg-indigo-100 border-indigo-400 text-indigo-600"
                : "bg-white border-slate-300 text-slate-400"
            )}>
              {step.icon}
            </div>
            <div className="text-center">
              <p className={cn(
                "text-sm font-semibold",
                isActive ? "text-indigo-600" : isPast ? "text-indigo-400" : "text-slate-400"
              )}>
                {step.label}
              </p>
              <p className="text-[10px] text-slate-400">{step.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
