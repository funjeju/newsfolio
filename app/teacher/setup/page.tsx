"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon, ArrowRightIcon, CheckIcon, CopyIcon, UploadIcon,
  RefreshCwIcon, UsersIcon, CalendarIcon, SettingsIcon, ShieldIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUser } from "@/lib/hooks/useUser";

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

const SAFE_DOMAINS = [
  { id: "hankyung", name: "한경", domain: "hankyung.com", icon: "📰" },
  { id: "mk", name: "매경", domain: "mk.co.kr", icon: "📰" },
  { id: "yna", name: "연합뉴스", domain: "yna.co.kr", icon: "📡" },
  { id: "kbs", name: "KBS 뉴스", domain: "news.kbs.co.kr", icon: "📺" },
  { id: "sbs", name: "SBS 뉴스", domain: "news.sbs.co.kr", icon: "📺" },
  { id: "ebs", name: "EBS 뉴스", domain: "news.ebs.co.kr", icon: "📚" },
];

const TONES = [
  { level: 1, label: "초등학교 1-2학년", grade: "1~2학년" },
  { level: 2, label: "초등학교 3-4학년", grade: "3~4학년" },
  { level: 3, label: "초등학교 5-6학년", grade: "5~6학년" },
  { level: 4, label: "중학생", grade: "중학교" },
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array(total).fill(null).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i + 1 < current ? "w-8 bg-brand-500" :
            i + 1 === current ? "w-12 bg-brand-400" :
            "w-8 bg-slate-100"
          )}
        />
      ))}
    </div>
  );
}

function generateClassCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 7 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function TeacherSetupPage() {
  const router = useRouter();
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 7;
  const [isCreating, setIsCreating] = useState(false);

  // Step 1: Class Info
  const [grade, setGrade] = useState("5");
  const [classNum, setClassNum] = useState("3");
  const [toneLevel, setToneLevel] = useState(3);

  // Step 2: Sectors
  const [activeSectors, setActiveSectors] = useState<string[]>(ALL_SECTORS.map(s => s.id));

  // Step 3: Schedule
  const [startDate, setStartDate] = useState("2026-05-01");
  const [endDate, setEndDate] = useState("2027-02-28");
  const [briefingTime, setBriefingTime] = useState("06:00");
  const [confirmDeadline, setConfirmDeadline] = useState("16:00");

  // Step 4: Options
  const [confirmMode, setConfirmMode] = useState<"always" | "auto" | "hybrid">("always");
  const [changeMode, setChangeMode] = useState<"leader" | "anyone">("anyone");
  const [weeklyLimit, setWeeklyLimit] = useState(3);

  // Step 5: Students
  const [studentRegistration, setStudentRegistration] = useState<"excel" | "code">("code");
  const [classCode] = useState(() => generateClassCode());

  // Step 6: Groups
  const [groupSize, setGroupSize] = useState(4);
  const totalGroups = Math.ceil(24 / groupSize);
  const [groupsGenerated, setGroupsGenerated] = useState(false);

  // Step 7: Safe Portal
  const [activeDomains, setActiveDomains] = useState<string[]>(SAFE_DOMAINS.map(d => d.id));

  const toggleSector = (id: string) => {
    setActiveSectors(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleDomain = (id: string) => {
    setActiveDomains(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };

  const handleAutoDetectTone = () => {
    const g = parseInt(grade);
    if (g <= 2) setToneLevel(1);
    else if (g <= 4) setToneLevel(2);
    else if (g <= 6) setToneLevel(3);
    else setToneLevel(4);
  };

  const handleComplete = async () => {
    if (!user?.id) {
      toast.error("로그인이 필요해요.");
      return;
    }
    setIsCreating(true);
    try {
      const gradeNum = parseInt(grade);
      const classNumNum = parseInt(classNum);
      const toneAuto: 1 | 2 | 3 | 4 = gradeNum <= 2 ? 1 : gradeNum <= 4 ? 2 : gradeNum <= 6 ? 3 : 4;

      const classData = {
        schoolId: user.schoolId ?? "",
        className: `${gradeNum}학년 ${classNumNum}반`,
        grade: gradeNum,
        classNumber: classNumNum,
        teacherId: user.id,
        toneLevel: toneLevel as 1 | 2 | 3 | 4,
        toneOverride: toneLevel !== toneAuto,
        currentSeasonId: "",
        seasonState: "setup",
        activeSectors,
        briefingTime,
        confirmDeadline,
        groupChangePermission: changeMode === "leader" ? "leader_only" : "any_member",
        confirmationMode: confirmMode === "always" ? "always_teacher" : confirmMode === "auto" ? "ai_auto" : "mixed",
        groupFormationMethod: "manual",
        classCode,
        weeklyAwardDay: "FR",
        monthlyAwardDay: "last_friday",
        studentCount: 0,
        groupCount: 0,
        preflightCheck: {
          items: {
            classInfo: true,
            sectorsActivated: activeSectors.length > 0,
            schedule: true,
            studentsRegistered: false,
            groupsMatched: false,
            groupChangePermission: true,
            confirmationMode: true,
            whitelistDomains: activeDomains.length > 0,
            parentNotification: false,
            learningMaterial: true,
          },
          allRequiredPassed: false,
          lastChecked: serverTimestamp(),
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const classRef = await addDoc(collection(db, "classes"), classData);

      // Link class to teacher
      await updateDoc(doc(db, "users", user.id), {
        teachingClassIds: [...(user.teachingClassIds ?? []), classRef.id],
      });

      toast.success("🚀 학급이 생성됐어요! 사전 점검으로 이동해요.");
      router.push(`/teacher/setup/preflight?classId=${classRef.id}`);
    } catch (err: any) {
      toast.error(err.message || "학급 생성에 실패했어요.");
    } finally {
      setIsCreating(false);
    }
  };

  const stepTitles = [
    "우리 반 정보",
    "섹터 활성화",
    "시즌 일정",
    "운영 옵션",
    "학생 등록",
    "조 매칭",
    "안전 포털",
  ];

  return (
    <div className="max-w-2xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between py-4 mb-6">
        <button onClick={() => step > 1 ? setStep(s => s - 1) : router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeftIcon className="w-4 h-4" />
          {step > 1 ? "이전 단계" : "뒤로"}
        </button>
        <div className="text-center">
          <div className="font-bold">반 셋업 위저드</div>
          <div className="text-sm text-muted-foreground">{step}/{TOTAL_STEPS} — {stepTitles[step - 1]}</div>
        </div>
        <StepIndicator current={step} total={TOTAL_STEPS} />
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Class Info */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass rounded-2xl p-6 border border-border/50 space-y-6">
            <h2 className="text-xl font-bold">우리 반 정보를 입력해요</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">학년</label>
                <select value={grade} onChange={e => { setGrade(e.target.value); handleAutoDetectTone(); }} className="w-full p-3 bg-slate-100/70 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-brand-500/50">
                  {["1","2","3","4","5","6","7","8","9"].map(g => <option key={g} value={g}>{g}학년</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">반</label>
                <select value={classNum} onChange={e => setClassNum(e.target.value)} className="w-full p-3 bg-slate-100/70 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-brand-500/50">
                  {["1","2","3","4","5","6","7","8","9","10"].map(n => <option key={n} value={n}>{n}반</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold">AI 톤 레벨</label>
                <button onClick={handleAutoDetectTone} className="text-xs text-brand-400 hover:text-brand-300 font-medium">자동 감지</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map(t => (
                  <button
                    key={t.level}
                    onClick={() => setToneLevel(t.level)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all",
                      toneLevel === t.level ? "bg-brand-500/20 border-brand-500 text-brand-300" : "bg-slate-100/70 border-border/50 hover:border-white/20"
                    )}
                  >
                    <div className="font-bold text-sm">Tone {t.level}</div>
                    <div className="text-xs text-muted-foreground">{t.label}</div>
                  </button>
                ))}
              </div>
              <div className="text-sm text-muted-foreground bg-slate-100/70 rounded-xl p-3">
                선택된 톤: <span className="font-bold text-foreground">Tone {toneLevel} — {TONES[toneLevel - 1].label}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Sectors */}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass rounded-2xl p-6 border border-border/50 space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">사용할 섹터를 선택해요</h2>
              <div className="flex gap-2">
                <button onClick={() => setActiveSectors(ALL_SECTORS.map(s => s.id))} className="text-xs text-brand-400 hover:text-brand-300 font-medium">전부 선택</button>
                <span className="text-muted-foreground">/</span>
                <button onClick={() => setActiveSectors([])} className="text-xs text-muted-foreground hover:text-foreground font-medium">전부 해제</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ALL_SECTORS.map(s => (
                <button
                  key={s.id}
                  onClick={() => toggleSector(s.id)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all",
                    activeSectors.includes(s.id) ? "bg-brand-500/20 border-brand-500 text-brand-300" : "bg-slate-100/70 border-border/50 hover:border-white/20 text-muted-foreground"
                  )}
                >
                  <span className="text-lg">{s.icon}</span>
                  <span className="flex-1 text-left">{s.name}</span>
                  {activeSectors.includes(s.id) && <CheckIcon className="w-4 h-4" />}
                </button>
              ))}
            </div>
            <div className="text-sm text-muted-foreground text-center">{activeSectors.length}개 섹터 선택됨</div>
          </motion.div>
        )}

        {/* Step 3: Schedule */}
        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass rounded-2xl p-6 border border-border/50 space-y-5">
            <h2 className="text-xl font-bold">시즌 일정을 정해요</h2>
            {[
              { label: "시즌 시작일", type: "date", value: startDate, onChange: setStartDate },
              { label: "시즌 종료일", type: "date", value: endDate, onChange: setEndDate },
              { label: "매일 브리핑 발행 시각", type: "time", value: briefingTime, onChange: setBriefingTime },
              { label: "교사 컨펌 마감 시각", type: "time", value: confirmDeadline, onChange: setConfirmDeadline },
            ].map(field => (
              <div key={field.label} className="space-y-2">
                <label className="text-sm font-semibold">{field.label}</label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={e => field.onChange(e.target.value)}
                  className="w-full p-3 bg-slate-100/70 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-brand-500/50"
                />
              </div>
            ))}
          </motion.div>
        )}

        {/* Step 4: Options */}
        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass rounded-2xl p-6 border border-border/50 space-y-6">
            <h2 className="text-xl font-bold">운영 옵션</h2>

            <div className="space-y-3">
              <label className="text-sm font-semibold">조 변경 권한 모드</label>
              {[
                { id: "leader", label: "조장만 신청 가능" },
                { id: "anyone", label: "조원 누구나 신청 가능" },
              ].map(opt => (
                <button key={opt.id} onClick={() => setChangeMode(opt.id as any)} className={cn("w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-sm font-medium", changeMode === opt.id ? "bg-brand-500/20 border-brand-500 text-brand-300" : "bg-slate-100/70 border-border/50")}>
                  <div className={cn("w-4 h-4 rounded-full border-2", changeMode === opt.id ? "bg-brand-500 border-brand-500" : "border-muted-foreground")} />
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold">컨펌 모드</label>
              {[
                { id: "always", label: "항상 교사 컨펌", desc: "모든 이의제기/변경이 교사 검토를 거쳐요" },
                { id: "auto", label: "AI 자동 승인", desc: "AI가 기준에 맞는 항목을 자동 처리해요" },
                { id: "hybrid", label: "혼합 (큰 변동만 교사)", desc: "±3 이상의 점수 변동만 교사 확인" },
              ].map(opt => (
                <button key={opt.id} onClick={() => setConfirmMode(opt.id as any)} className={cn("w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left", confirmMode === opt.id ? "bg-brand-500/20 border-brand-500" : "bg-slate-100/70 border-border/50")}>
                  <div className={cn("w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0", confirmMode === opt.id ? "bg-brand-500 border-brand-500" : "border-muted-foreground")} />
                  <div>
                    <div className={cn("font-semibold text-sm", confirmMode === opt.id ? "text-brand-300" : "text-foreground")}>{opt.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">주간 포지션 변경 한도</label>
              <div className="flex items-center gap-4">
                <input type="range" min={1} max={5} value={weeklyLimit} onChange={e => setWeeklyLimit(parseInt(e.target.value))} className="flex-1 accent-brand-500" />
                <span className="font-bold w-8 text-center">{weeklyLimit}회</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 5: Students */}
        {step === 5 && (
          <motion.div key="s5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass rounded-2xl p-6 border border-border/50 space-y-5">
            <h2 className="text-xl font-bold">학생 등록 방법을 선택해요</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "code", label: "학급 코드 발급", desc: "학생이 코드로 직접 가입", icon: "🔑" },
                { id: "excel", label: "엑셀 업로드", desc: "명단 파일로 일괄 등록", icon: "📋" },
              ].map(opt => (
                <button key={opt.id} onClick={() => setStudentRegistration(opt.id as any)} className={cn("p-4 rounded-xl border text-left transition-all space-y-2", studentRegistration === opt.id ? "bg-brand-500/20 border-brand-500" : "bg-slate-100/70 border-border/50")}>
                  <div className="text-2xl">{opt.icon}</div>
                  <div className={cn("font-bold text-sm", studentRegistration === opt.id ? "text-brand-300" : "")}>{opt.label}</div>
                  <div className="text-xs text-muted-foreground">{opt.desc}</div>
                </button>
              ))}
            </div>

            {studentRegistration === "code" && (
              <div className="bg-slate-100/70 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold">학급 코드</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 text-3xl font-bold font-mono tracking-widest text-brand-300">{classCode}</div>
                  <button onClick={() => { navigator.clipboard.writeText(classCode); toast.success("코드가 복사됐어요!"); }} className="flex items-center gap-1.5 px-3 py-2 bg-brand-500/20 text-brand-300 rounded-lg text-sm font-medium hover:bg-brand-500/30 transition-colors">
                    <CopyIcon className="w-4 h-4" />
                    복사
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">학생이 가입 시 이 코드를 입력하면 자동으로 학급에 배정돼요.</p>
              </div>
            )}

            {studentRegistration === "excel" && (
              <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center space-y-3">
                <UploadIcon className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm font-medium">엑셀 파일을 드래그하거나 클릭해서 업로드하세요</p>
                <button className="text-xs text-brand-400 hover:text-brand-300 font-medium">양식 다운로드</button>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 6: Groups */}
        {step === 6 && (
          <motion.div key="s6" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass rounded-2xl p-6 border border-border/50 space-y-5">
            <h2 className="text-xl font-bold">조 매칭</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold">조당 인원</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={2} max={6} value={groupSize} onChange={e => setGroupSize(parseInt(e.target.value))} className="w-32 accent-brand-500" />
                  <span className="font-bold">{groupSize}명</span>
                </div>
              </div>
              <div className="bg-slate-100/70 rounded-xl p-3 text-sm text-muted-foreground">
                학생 24명 ÷ 조당 {groupSize}명 = <span className="font-bold text-foreground">{totalGroups}조</span>
              </div>
            </div>

            {!groupsGenerated ? (
              <button onClick={() => setGroupsGenerated(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 transition-colors">
                <RefreshCwIcon className="w-4 h-4" />
                자동 배치 실행
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold">자동 배치 결과 미리보기</p>
                  <button onClick={() => setGroupsGenerated(false)} className="text-xs text-brand-400 hover:text-brand-300 font-medium">재배치</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Array(totalGroups).fill(null).map((_, i) => (
                    <div key={i} className="bg-slate-100/70 rounded-xl p-3 border border-border/50 text-sm">
                      <div className="font-bold mb-1">{i + 1}조</div>
                      <div className="text-muted-foreground text-xs">{groupSize}명</div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground text-center">시작 후 학생 명단에서 수동 조정 가능해요</div>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 7: Safe Portal */}
        {step === 7 && (
          <motion.div key="s7" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass rounded-2xl p-6 border border-border/50 space-y-5">
            <div>
              <h2 className="text-xl font-bold">안전 포털 사이트 설정</h2>
              <p className="text-sm text-muted-foreground mt-1">학생이 뉴스 출처로 사용할 수 있는 사이트를 정해요.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SAFE_DOMAINS.map(d => (
                <button
                  key={d.id}
                  onClick={() => toggleDomain(d.id)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all",
                    activeDomains.includes(d.id) ? "bg-brand-500/20 border-brand-500 text-brand-300" : "bg-slate-100/70 border-border/50 text-muted-foreground"
                  )}
                >
                  <span>{d.icon}</span>
                  <span className="flex-1 text-left">{d.name}</span>
                  {activeDomains.includes(d.id) && <CheckIcon className="w-4 h-4" />}
                </button>
              ))}
            </div>
            <div className="text-sm text-muted-foreground bg-slate-100/70 rounded-xl p-3">
              {activeDomains.length}개 사이트 활성화. 학생은 이 사이트의 기사만 출처로 제출할 수 있어요. 시작 후 더 추가할 수 있어요.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-6 flex gap-3">
        {step < TOTAL_STEPS ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-brand-500 text-white rounded-2xl font-bold hover:bg-brand-600 transition-all"
          >
            다음 단계 <ArrowRightIcon className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={isCreating}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-brand-500 text-white rounded-2xl font-bold hover:bg-brand-600 transition-all shadow-[0_4px_20px_rgba(99,102,241,0.4)] disabled:opacity-50"
          >
            {isCreating ? "학급 생성 중..." : "🚀 사전 점검 화면으로"}
          </button>
        )}
      </div>
    </div>
  );
}
