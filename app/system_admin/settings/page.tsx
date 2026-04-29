"use client";

import { useState } from "react";
import { SettingsIcon, SaveIcon, AlertTriangleIcon, ShieldCheckIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SystemSettings {
  maxSchools: number;
  maxStudentsPerSchool: number;
  geminiModel: string;
  geminiLiteModel: string;
  aiDailyCallLimit: number;
  maintenanceMode: boolean;
  autoApprovalEnabled: boolean;
  briefingGenerationEnabled: boolean;
  awardGenerationEnabled: boolean;
  defaultSectorCount: number;
  objectionAiThreshold: number;
}

const DEFAULT: SystemSettings = {
  maxSchools: 50,
  maxStudentsPerSchool: 1000,
  geminiModel: "gemini-2.0-flash",
  geminiLiteModel: "gemini-2.0-flash-lite",
  aiDailyCallLimit: 5000,
  maintenanceMode: false,
  autoApprovalEnabled: true,
  briefingGenerationEnabled: true,
  awardGenerationEnabled: true,
  defaultSectorCount: 10,
  objectionAiThreshold: 75,
};

export default function SystemAdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success("시스템 설정이 저장됐어요.");
    setSaving(false);
  };

  return (
    <div className="space-y-6 pb-10 max-w-2xl">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-300 text-xs font-bold mb-3 border border-red-500/30">
          <SettingsIcon className="w-3.5 h-3.5" />
          시스템 설정
        </div>
        <h1 className="text-2xl font-display font-bold">시스템 전역 설정</h1>
        <p className="text-sm text-muted-foreground mt-1">전체 플랫폼에 영향을 주는 설정이에요. 신중하게 변경하세요.</p>
      </div>

      {/* Maintenance Warning */}
      {settings.maintenanceMode && (
        <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl text-yellow-400">
          <AlertTriangleIcon className="w-5 h-5 shrink-0" />
          <p className="text-sm font-semibold">점검 모드가 활성화됐어요. 모든 학생/교사 접근이 차단됩니다.</p>
        </div>
      )}

      {/* Platform Limits */}
      <section className="glass rounded-2xl p-5 space-y-4">
        <h2 className="font-bold text-sm flex items-center gap-2">
          <ShieldCheckIcon className="w-4 h-4 text-red-400" />
          플랫폼 제한
        </h2>
        {[
          { label: "최대 등록 학교 수", key: "maxSchools" as const, min: 1, max: 200, unit: "개" },
          { label: "학교당 최대 학생 수", key: "maxStudentsPerSchool" as const, min: 100, max: 5000, unit: "명" },
          { label: "AI 일일 호출 한도", key: "aiDailyCallLimit" as const, min: 1000, max: 50000, unit: "회" },
          { label: "기본 섹터 수", key: "defaultSectorCount" as const, min: 5, max: 20, unit: "개" },
          { label: "이의제기 AI 자동 판정 기준", key: "objectionAiThreshold" as const, min: 50, max: 100, unit: "점" },
        ].map(({ label, key, min, max, unit }) => (
          <div key={key} className="flex items-center justify-between gap-4">
            <label className="text-sm flex-1">{label}</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={min}
                max={max}
                value={settings[key] as number}
                onChange={e => update(key, Number(e.target.value))}
                className="w-28 accent-red-500"
              />
              <span className="text-sm font-bold w-20 text-right">
                {(settings[key] as number).toLocaleString()}{unit}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* AI Models */}
      <section className="glass rounded-2xl p-5 space-y-4">
        <h2 className="font-bold text-sm">AI 모델 설정</h2>
        <div className="space-y-3">
          {[
            { label: "주 모델 (브리핑·심층 분석)", key: "geminiModel" as const },
            { label: "경량 모델 (이의제기 검증·카드뉴스)", key: "geminiLiteModel" as const },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
              <input
                value={settings[key] as string}
                onChange={e => update(key, e.target.value)}
                className="w-full p-2.5 bg-white/5 border border-border/50 rounded-xl text-sm font-mono focus:outline-none focus:border-red-500/50"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Feature Toggles */}
      <section className="glass rounded-2xl p-5 space-y-3">
        <h2 className="font-bold text-sm">기능 토글</h2>
        {[
          { label: "🔧 점검 모드 (전체 서비스 차단)", key: "maintenanceMode" as const, danger: true },
          { label: "🤖 이의제기 AI 자동 판정", key: "autoApprovalEnabled" as const },
          { label: "📰 일일 브리핑 자동 생성", key: "briefingGenerationEnabled" as const },
          { label: "🏆 주간 상장 자동 발행", key: "awardGenerationEnabled" as const },
        ].map(({ label, key, danger }) => (
          <div key={key} className={cn("flex items-center justify-between p-3 rounded-xl", danger && settings[key] ? "bg-yellow-500/5 border border-yellow-500/20" : "")}>
            <span className={`text-sm ${danger ? "font-semibold" : ""}`}>{label}</span>
            <button
              onClick={() => {
                if (danger && !settings[key]) {
                  if (!confirm("점검 모드를 활성화하면 모든 사용자 접근이 차단돼요. 계속하시겠어요?")) return;
                }
                update(key, !settings[key]);
              }}
              className={`relative w-10 h-5 rounded-full transition-colors ${(settings[key] as boolean) ? (danger ? "bg-yellow-500" : "bg-red-500") : "bg-white/20"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${(settings[key] as boolean) ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        ))}
      </section>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/30 text-red-300 border border-red-500/30 rounded-2xl font-bold disabled:opacity-50 hover:bg-red-500/40 transition-colors"
      >
        <SaveIcon className="w-4 h-4" />
        {saving ? "저장 중..." : "시스템 설정 저장"}
      </button>
    </div>
  );
}

