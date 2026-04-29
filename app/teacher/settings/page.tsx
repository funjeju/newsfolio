"use client";

import { useState } from "react";
import { SettingsIcon, SaveIcon, CopyIcon, PlusIcon, TrashIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ALL_SECTORS = [
  { id: "semiconductor", name: "반도체", icon: "💻" },
  { id: "automotive", name: "자동차", icon: "🚗" },
  { id: "game", name: "게임", icon: "🎮" },
  { id: "content", name: "콘텐츠·연예", icon: "🎬" },
  { id: "travel", name: "여행·관광", icon: "✈️" },
  { id: "green_energy", name: "친환경에너지", icon: "🌱" },
  { id: "food", name: "식품", icon: "🍔" },
  { id: "construction", name: "건설", icon: "🏗️" },
  { id: "geopolitics", name: "국제정세", icon: "🌐" },
  { id: "global_trade", name: "글로벌무역", icon: "🚢" },
];

const DEFAULT_DOMAINS = [
  { domain: "hankyung.com", name: "한경" },
  { domain: "mk.co.kr", name: "매경" },
  { domain: "yna.co.kr", name: "연합뉴스" },
  { domain: "news.kbs.co.kr", name: "KBS" },
  { domain: "news.sbs.co.kr", name: "SBS" },
  { domain: "news.ebs.co.kr", name: "EBS" },
];

export default function TeacherSettingsPage() {
  const [activeSectors, setActiveSectors] = useState<string[]>(ALL_SECTORS.map(s => s.id));
  const [briefingTime, setBriefingTime] = useState("06:00");
  const [confirmDeadline, setConfirmDeadline] = useState("16:00");
  const [confirmMode, setConfirmMode] = useState("always_teacher");
  const [toneLevel, setToneLevel] = useState(3);
  const [domains, setDomains] = useState(DEFAULT_DOMAINS);
  const [newDomain, setNewDomain] = useState("");
  const classCode = "ABC1234";

  const toggleSector = (id: string) => setActiveSectors(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const addDomain = () => {
    if (!newDomain.trim()) return;
    setDomains(prev => [...prev, { domain: newDomain.trim(), name: newDomain.split(".")[0] }]);
    setNewDomain("");
    toast.success("도메인이 추가됐어요.");
  };

  const removeDomain = (domain: string) => setDomains(prev => prev.filter(d => d.domain !== domain));

  const handleSave = () => toast.success("설정이 저장됐어요! (Firestore 연동 예정)");

  return (
    <div className="space-y-6 pb-10 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold">학급 설정</h1>
        <p className="text-muted-foreground mt-1">학급 운영 옵션을 변경해요</p>
      </div>

      {/* Class Code */}
      <div className="glass rounded-2xl p-5 border border-border/50 space-y-3">
        <h3 className="font-bold">학급 코드</h3>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-mono font-bold tracking-widest text-brand-300">{classCode}</span>
          <button
            onClick={() => { navigator.clipboard.writeText(classCode); toast.success("코드가 복사됐어요!"); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-500/20 text-brand-300 rounded-lg text-sm font-medium hover:bg-brand-500/30 transition-colors"
          >
            <CopyIcon className="w-4 h-4" /> 복사
          </button>
        </div>
        <p className="text-xs text-muted-foreground">학생이 가입 시 이 코드를 입력하면 학급에 자동 배정돼요.</p>
      </div>

      {/* AI Tone */}
      <div className="glass rounded-2xl p-5 border border-border/50 space-y-4">
        <h3 className="font-bold">AI 브리핑 톤 레벨</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { level: 1, label: "초1~2학년" },
            { level: 2, label: "초3~4학년" },
            { level: 3, label: "초5~6학년" },
            { level: 4, label: "중학생" },
          ].map(t => (
            <button
              key={t.level}
              onClick={() => setToneLevel(t.level)}
              className={cn("p-3 rounded-xl border text-sm font-medium transition-all text-left", toneLevel === t.level ? "bg-brand-500/20 border-brand-500 text-brand-300" : "bg-slate-100/70 border-border/50")}
            >
              Tone {t.level} — {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule */}
      <div className="glass rounded-2xl p-5 border border-border/50 space-y-4">
        <h3 className="font-bold">일정 설정</h3>
        {[
          { label: "브리핑 발행 시각", value: briefingTime, onChange: setBriefingTime },
          { label: "컨펌 마감 시각", value: confirmDeadline, onChange: setConfirmDeadline },
        ].map(f => (
          <div key={f.label} className="flex items-center justify-between">
            <label className="text-sm font-medium">{f.label}</label>
            <input type="time" value={f.value} onChange={e => f.onChange(e.target.value)} className="p-2 bg-slate-100/70 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-brand-500/50" />
          </div>
        ))}
      </div>

      {/* Confirm Mode */}
      <div className="glass rounded-2xl p-5 border border-border/50 space-y-3">
        <h3 className="font-bold">컨펌 모드</h3>
        {[
          { id: "always_teacher", label: "항상 교사 컨펌", desc: "모든 이의제기가 교사 검토를 거쳐요" },
          { id: "ai_auto", label: "AI 자동 승인", desc: "AI가 기준 충족 항목을 자동 처리해요" },
          { id: "mixed", label: "혼합 모드", desc: "±3 이상 점수 변동만 교사 확인" },
        ].map(opt => (
          <button
            key={opt.id}
            onClick={() => setConfirmMode(opt.id)}
            className={cn("w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all", confirmMode === opt.id ? "bg-brand-500/20 border-brand-500" : "bg-slate-100/70 border-border/50")}
          >
            <div className={cn("w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0", confirmMode === opt.id ? "bg-brand-500 border-brand-500" : "border-muted-foreground")} />
            <div>
              <div className={cn("font-medium text-sm", confirmMode === opt.id ? "text-brand-300" : "")}>{opt.label}</div>
              <div className="text-xs text-muted-foreground">{opt.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Sectors */}
      <div className="glass rounded-2xl p-5 border border-border/50 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold">활성 섹터 ({activeSectors.length}/10)</h3>
          <div className="flex gap-2">
            <button onClick={() => setActiveSectors(ALL_SECTORS.map(s => s.id))} className="text-xs text-brand-400 font-medium">전체</button>
            <span className="text-muted-foreground">/</span>
            <button onClick={() => setActiveSectors([])} className="text-xs text-muted-foreground font-medium">해제</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {ALL_SECTORS.map(s => (
            <button
              key={s.id}
              onClick={() => toggleSector(s.id)}
              className={cn("flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all", activeSectors.includes(s.id) ? "bg-brand-500/20 border-brand-500 text-brand-300" : "bg-slate-100/70 border-border/50 text-muted-foreground")}
            >
              <span>{s.icon}</span>
              <span className="flex-1 text-left">{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Domains */}
      <div className="glass rounded-2xl p-5 border border-border/50 space-y-4">
        <h3 className="font-bold">안전 포털 도메인</h3>
        <div className="space-y-2">
          {domains.map(d => (
            <div key={d.domain} className="flex items-center justify-between p-2 bg-slate-100/70 rounded-xl">
              <span className="font-mono text-sm text-brand-300">{d.domain}</span>
              <button onClick={() => removeDomain(d.domain)} className="text-muted-foreground hover:text-red-400 transition-colors">
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newDomain}
            onChange={e => setNewDomain(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addDomain()}
            placeholder="예: bloomberg.com"
            className="flex-1 p-2 bg-slate-100/70 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-brand-500/50"
          />
          <button onClick={addDomain} className="flex items-center gap-1.5 px-4 py-2 bg-brand-500/20 text-brand-300 rounded-xl text-sm font-medium hover:bg-brand-500/30 transition-colors">
            <PlusIcon className="w-4 h-4" /> 추가
          </button>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full flex items-center justify-center gap-2 py-4 bg-brand-500 text-white rounded-2xl font-bold hover:bg-brand-600 transition-colors shadow-[0_4px_20px_rgba(99,102,241,0.3)]"
      >
        <SaveIcon className="w-5 h-5" /> 설정 저장
      </button>
    </div>
  );
}
