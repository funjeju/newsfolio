"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { LogIn, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { setDevRole } from "@/components/AuthProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        toast.success("로그인 성공!");
        if (userData.role === "teacher") {
          router.push("/teacher/dashboard");
        } else {
          router.push("/student/dashboard");
        }
      } else {
        toast.error("사용자 정보를 찾을 수 없습니다.");
        auth.signOut();
      }
    } catch (error: any) {
      toast.error(error.message || "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          name: user.displayName || "사용자",
          role: "student",
          createdAt: new Date().toISOString(),
          totalAsset: 1000000,
          cash: 1000000,
          portfolio: []
        });
        toast.success("구글 계정으로 가입되었습니다. 환영합니다!");
        router.push("/student/dashboard");
      } else {
        const userData = userDoc.data();
        toast.success("구글 계정으로 로그인되었습니다.");
        if (userData.role === "teacher") {
          router.push("/teacher/dashboard");
        } else {
          router.push("/student/dashboard");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "구글 로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // Dev bypass — bypass auth for local testing
  const handleDevBypass = (role: "student" | "teacher") => {
    setDevRole(role);
    if (role === "student") router.push("/student/dashboard");
    else router.push("/teacher/dashboard");
    toast.info(`[DEV] ${role === "student" ? "학생" : "교사"} 모드로 진입`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
      </div>

      <div className="glass p-8 rounded-3xl w-full max-w-md relative z-10 border border-border/50">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📰</div>
          <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">Newsfolio</h1>
          <p className="text-muted-foreground mt-2 text-sm">뉴스로 배우는 경제 시뮬레이터</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">이메일</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-xl bg-white/5 border border-border/50 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 outline-none transition-all"
              placeholder="이메일을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded-xl bg-white/5 border border-border/50 focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 outline-none transition-all"
              placeholder="비밀번호를 입력하세요"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-2 bg-brand-500 text-white rounded-xl font-bold hover:bg-brand-600 disabled:opacity-50 transition-all shadow-[0_4px_14px_rgba(99,102,241,0.4)]"
          >
            {isLoading ? "로그인 중..." : "이메일 로그인"}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-card/80 text-muted-foreground rounded-full">또는</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-3 bg-white text-gray-800 rounded-xl font-bold border border-gray-300 disabled:opacity-50 transition-all flex items-center justify-center gap-2 hover:bg-gray-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google 계정으로 로그인
        </button>

        {/* DEV MODE BYPASS */}
        <div className="mt-5 p-3 rounded-xl border border-yellow-500/30 bg-yellow-500/5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-500 mb-2">
            <FlaskConical className="w-3.5 h-3.5" />
            개발 모드 (인증 없이 진입)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDevBypass("student")}
              className="py-2 bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-lg text-xs font-bold hover:bg-brand-500/30 transition-colors"
            >
              👩‍🎓 학생으로 진입
            </button>
            <button
              onClick={() => handleDevBypass("teacher")}
              className="py-2 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-bold hover:bg-purple-500/30 transition-colors"
            >
              👨‍🏫 교사로 진입
            </button>
          </div>
        </div>

        <div className="mt-5 text-center text-sm text-muted-foreground">
          계정이 없으신가요?{" "}
          <Link href="/join" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            회원가입하기
          </Link>
        </div>
      </div>
    </div>
  );
}
