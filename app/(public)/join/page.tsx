"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  doc, setDoc, collection, query, where, limit,
  getDocs, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { ArrowRightIcon, ArrowLeftIcon, CheckIcon, GraduationCapIcon, BookOpenIcon, UserIcon } from "lucide-react";
import { toast } from "sonner";
import type { Class } from "@/types/schema";

type Step = "role" | "classCode" | "account";
type RoleType = "student" | "teacher" | "solo";

export default function JoinPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<RoleType | null>(null);

  // classCode step
  const [classCode, setClassCode] = useState("");
  const [foundClass, setFoundClass] = useState<(Class & { id: string }) | null>(null);
  const [classCodeError, setClassCodeError] = useState("");
  const [isCheckingCode, setIsCheckingCode] = useState(false);

  // account step
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (r: RoleType) => {
    setRole(r);
    if (r === "teacher" || r === "solo") setStep("account");
    else setStep("classCode");
  };

  const handleCheckClassCode = async () => {
    if (!classCode.trim()) return;
    setIsCheckingCode(true);
    setClassCodeError("");
    setFoundClass(null);

    try {
      const q = query(
        collection(db, "classes"),
        where("classCode", "==", classCode.trim().toUpperCase()),
        limit(1)
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        setClassCodeError("학급 코드를 찾을 수 없어요. 선생님께 다시 확인해보세요.");
        return;
      }

      const classDoc = snap.docs[0];
      const data = classDoc.data() as Class;

      if (data.seasonState === "finished") {
        setClassCodeError("이미 종료된 학기입니다.");
        return;
      }

      setFoundClass({ ...data, id: classDoc.id });
    } catch (err: any) {
      setClassCodeError("확인 중 오류가 발생했어요. 다시 시도해주세요.");
    } finally {
      setIsCheckingCode(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) { toast.error("이름을 입력해주세요."); return; }
    setIsLoading(true);

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = credential.user.uid;

      const userDoc: Record<string, unknown> = {
        role,
        email,
        displayName: displayName.trim(),
        status: "active",
        createdAt: serverTimestamp(),
      };

      if (role === "student" && foundClass) {
        userDoc.classId = foundClass.id;
        userDoc.schoolId = foundClass.schoolId;
        userDoc.grade = foundClass.grade;

        // Try to claim a matching studentRoster entry by realName
        const rosterQ = query(
          collection(db, "studentRosters"),
          where("classId", "==", foundClass.id),
          where("realName", "==", displayName.trim()),
          where("status", "==", "pending"),
          limit(1)
        );
        const rosterSnap = await getDocs(rosterQ);
        if (!rosterSnap.empty) {
          const rosterDoc = rosterSnap.docs[0];
          userDoc.studentRosterId = rosterDoc.id;
          userDoc.realName = displayName.trim();
          await updateDoc(doc(db, "studentRosters", rosterDoc.id), {
            status: "claimed",
            claimedByUserId: uid,
            claimedAt: serverTimestamp(),
          });
        }
      } else if (role === "teacher") {
        userDoc.teachingClassIds = [];
      }

      await setDoc(doc(db, "users", uid), userDoc);

      toast.success("가입 완료! 환영합니다 🎉");
      if (role === "teacher") router.push("/teacher/dashboard");
      else if (role === "solo") router.push("/solo/dashboard");
      else router.push("/student/dashboard");
    } catch (err: any) {
      const msg = err.code === "auth/email-already-in-use"
        ? "이미 사용 중인 이메일입니다."
        : err.code === "auth/weak-password"
        ? "비밀번호는 6자 이상이어야 합니다."
        : err.message || "가입에 실패했어요.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Logo */}
        <div className="text-center">
          <span className="text-3xl">📰</span>
          <h1 className="text-xl font-display font-bold mt-1 bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
            Newsfolio
          </h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          {(["role", "classCode", "account"] as Step[])
            .filter(s => (role === "teacher" || role === "solo") ? s !== "classCode" : true)
            .map((s, idx, arr) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-colors
                  ${step === s ? "bg-brand-500 text-white" :
                    arr.indexOf(step) > idx ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-muted-foreground"}`}>
                  {arr.indexOf(step) > idx ? <CheckIcon className="w-3 h-3" /> : idx + 1}
                </div>
                {idx < arr.length - 1 && <div className="w-8 h-px bg-border/50" />}
              </div>
            ))}
        </div>

        <div className="glass p-7 rounded-3xl border border-border/50 space-y-6">

          {/* STEP 1: Role */}
          {step === "role" && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-display font-bold">어떻게 참여하시나요?</h2>
                <p className="text-sm text-muted-foreground mt-1">역할을 선택해주세요</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleRoleSelect("student")}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-border/50 bg-white/5 hover:bg-brand-500/10 hover:border-brand-500/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center group-hover:bg-brand-500/20 transition-colors">
                    <BookOpenIcon className="w-6 h-6 text-brand-400" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold">학생</div>
                    <div className="text-xs text-muted-foreground mt-0.5">학급 코드로 참여</div>
                  </div>
                </button>
                <button
                  onClick={() => handleRoleSelect("teacher")}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-border/50 bg-white/5 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                    <GraduationCapIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold">선생님</div>
                    <div className="text-xs text-muted-foreground mt-0.5">학급 개설 및 관리</div>
                  </div>
                </button>
              </div>
              <button
                onClick={() => handleRoleSelect("solo")}
                className="w-full flex items-center gap-4 p-5 rounded-2xl border border-border/50 bg-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors flex-shrink-0">
                  <UserIcon className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-left">
                  <div className="font-bold">혼자 참여하기</div>
                  <div className="text-xs text-muted-foreground mt-0.5">학급 없이 개인으로 섹터 투자 체험</div>
                </div>
              </button>
            </div>
          )}

          {/* STEP 2: Class Code (students only) */}
          {step === "classCode" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <button onClick={() => setStep("role")} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeftIcon className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-xl font-display font-bold">학급 코드 입력</h2>
                  <p className="text-sm text-muted-foreground">선생님께 받은 코드를 입력하세요</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={classCode}
                    onChange={e => { setClassCode(e.target.value.toUpperCase()); setClassCodeError(""); setFoundClass(null); }}
                    onKeyDown={e => e.key === "Enter" && handleCheckClassCode()}
                    maxLength={8}
                    placeholder="예: ABC12345"
                    className="flex-1 p-3 rounded-xl bg-card border border-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all font-mono text-center text-lg tracking-widest uppercase"
                  />
                  <button
                    onClick={handleCheckClassCode}
                    disabled={!classCode.trim() || isCheckingCode}
                    className="px-4 py-3 bg-brand-500 text-white rounded-xl font-bold disabled:opacity-40 hover:bg-brand-600 transition-colors text-sm"
                  >
                    {isCheckingCode ? "확인 중..." : "확인"}
                  </button>
                </div>

                {classCodeError && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">
                    {classCodeError}
                  </p>
                )}

                {foundClass && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-1">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckIcon className="w-4 h-4" /> 학급 확인 완료
                    </div>
                    <div className="text-sm font-bold mt-1">{foundClass.className}</div>
                    <div className="text-xs text-muted-foreground">
                      {foundClass.grade}학년 {foundClass.classNumber}반 · 학생 {foundClass.studentCount}명
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setStep("account")}
                disabled={!foundClass}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-500 text-white rounded-2xl font-bold disabled:opacity-40 hover:bg-brand-600 transition-colors"
              >
                다음 <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: Account info */}
          {step === "account" && (
            <form onSubmit={handleJoin} className="space-y-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(role === "teacher" || role === "solo" ? "role" : "classCode")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-xl font-display font-bold">계정 만들기</h2>
                  <p className="text-sm text-muted-foreground">
                    {role === "student" && foundClass
                      ? `${foundClass.className} 합류`
                      : role === "solo"
                      ? "개인 투자 시뮬레이터"
                      : "교사 계정 생성"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    이름 {role === "student" && <span className="text-xs text-muted-foreground">(출석부 이름과 동일하게)</span>}
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    required
                    placeholder={role === "student" ? "홍길동" : "이름을 입력하세요"}
                    className="w-full p-3 rounded-xl bg-card border border-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">이메일</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="email@example.com"
                    className="w-full p-3 rounded-xl bg-card border border-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">비밀번호</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="6자 이상"
                    className="w-full p-3 rounded-xl bg-card border border-border focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-500 text-white rounded-2xl font-bold disabled:opacity-40 hover:bg-brand-600 transition-colors shadow-[0_4px_20px_rgba(99,102,241,0.3)]"
              >
                {isLoading ? "가입 중..." : "가입 완료하기"}
                {!isLoading && <CheckIcon className="w-4 h-4" />}
              </button>
            </form>
          )}

          <div className="text-center text-sm text-muted-foreground pt-2 border-t border-border/30">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-brand-400 hover:underline font-medium">로그인</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
