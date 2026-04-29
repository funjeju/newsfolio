"use client";

import { useState } from "react";
import { SettingsIcon, SaveIcon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";

interface SchoolSettings {
  schoolName: string;
  adminEmail: string;
  maxClassCount: number;
  seasonStartDate: string;
  seasonEndDate: string;
  weeklyChangeLimit: number;
  objectionDailyLimit: number;
  autoApproveThreshold: number;
  allowStudentGroupView: boolean;
  notifyTeacherOnObjection: boolean;
}

const DEFAULT_SETTINGS: SchoolSettings = {
  schoolName: "서울 미래중학교",
  adminEmail: "admin@seoulmiraejhs.edu.kr",
  maxClassCount: 10,
  seasonStartDate: "2026-03-02",
  seasonEndDate: "2026-06-27",
  weeklyChangeLimit: 2,
  objectionDailyLimit: 3,
  autoApproveThreshold: 85,
  allowStudentGroupView: true,
  notifyTeacherOnObjection: true,
};

export default function SchoolAdminSettingsPage() {
  const [settings, setSettings] = useState<SchoolSettings>(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof SchoolSettings>(key: K, value: SchoolSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success("설정이 저장됐어요.");
    setSaving(false);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    toast.info("기본값으로 초기화됐어요.");
  };

  return (
    <div className="space-y-6 pb-10 max-w-2xl">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-bold mb-3 border border-blue-500/30">
          <SettingsIcon className="w-3.5 h-3.5" />
          학교 설정
        </div>
        <h1 className="text-2xl font-display font-bold">학교 운영 설정</h1>
        <p className="text-sm text-muted-foreground mt-1">시즌 규칙 및 학교 정보를 관리해요</p>
      </div>

      {/* School Info */}
      <section className="glass rounded-2xl p-5 space-y-4">
        <h2 className="font-bold text-sm">학교 기본 정보</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">학교 이름</label>
            <input
              value={settings.schoolName}
              onChange={e => update("schoolName", e.target.value)}
              className="w-full p-2.5 bg-white/5 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-brand-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">관리자 이메일</label>
            <input
              type="email"
              value={settings.adminEmail}
              onChange={e => update("adminEmail", e.target.value)}
              className="w-full p-2.5 bg-white/5 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-brand-500/50"
            />
          </div>
        </div>
      </section>

      {/* Season Settings */}
      <section className="glass rounded-2xl p-5 space-y-4">
        <h2 className="font-bold text-sm">시즌 기간 설정</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">시작일</label>
            <input
              type="date"
              value={settings.seasonStartDate}
              onChange={e => update("seasonStartDate", e.target.value)}
              className="w-full p-2.5 bg-white/5 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-brand-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">종료일</label>
            <input
              type="date"
              value={settings.seasonEndDate}
              onChange={e => update("seasonEndDate", e.target.value)}
              className="w-full p-2.5 bg-white/5 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-brand-500/50"
            />
          </div>
        </div>
      </section>

      {/* Rule Settings */}
      <section className="glass rounded-2xl p-5 space-y-4">
        <h2 className="font-bold text-sm">게임 규칙 설정</h2>
        <div className="space-y-4">
          {[
            { label: "주간 포트폴리오 변경 한도", key: "weeklyChangeLimit" as const, unit: "회", min: 1, max: 10 },
            { label: "일일 이의제기 한도", key: "objectionDailyLimit" as const, unit: "건", min: 1, max: 10 },
            { label: "AI 자동 승인 기준 점수", key: "autoApproveThreshold" as const, unit: "점", min: 50, max: 100 },
          ].map(({ label, key, unit, min, max }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <label className="text-sm flex-1">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={settings[key] as number}
                  onChange={e => update(key, Number(e.target.value))}
                  className="w-28 accent-brand-500"
                />
                <span className="text-sm font-bold w-14 text-right">{settings[key] as number}{unit}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Toggle Settings */}
      <section className="glass rounded-2xl p-5 space-y-3">
        <h2 className="font-bold text-sm">기능 설정</h2>
        {[
          { label: "학생 간 그룹 포트폴리오 조회 허용", key: "allowStudentGroupView" as const },
          { label: "이의제기 발생 시 교사 알림", key: "notifyTeacherOnObjection" as const },
        ].map(({ label, key }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm">{label}</span>
            <button
              onClick={() => update(key, !settings[key])}
              className={`relative w-10 h-5 rounded-full transition-colors ${settings[key] ? "bg-brand-500" : "bg-white/20"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings[key] ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        ))}
      </section>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-500 text-white rounded-2xl font-bold disabled:opacity-50 hover:bg-brand-600 transition-colors"
        >
          <SaveIcon className="w-4 h-4" />
          {saving ? "저장 중..." : "설정 저장"}
        </button>
        <button
          onClick={handleReset}
          className="px-5 flex items-center gap-2 py-3 bg-white/5 border border-border/50 rounded-2xl text-sm font-semibold hover:bg-white/10 transition-colors"
        >
          <RefreshCwIcon className="w-4 h-4" />
          초기화
        </button>
      </div>
    </div>
  );
}
