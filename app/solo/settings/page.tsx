"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircleIcon, LogOutIcon, ShieldIcon, InfoIcon } from "lucide-react";
import { signOut, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUser } from "@/lib/hooks/useUser";
import { toast } from "sonner";

export default function SoloSettings() {
  const { user, firebaseUid } = useUser();
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveName = async () => {
    const fbUser = auth.currentUser;
    if (!fbUser || !displayName.trim()) return;
    setIsSaving(true);
    try {
      await updateProfile(fbUser, { displayName: displayName.trim() });
      toast.success("닉네임이 변경됐어요.");
    } catch {
      toast.error("변경에 실패했어요.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    toast.success("로그아웃됐어요.");
    router.push("/login");
  };

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800">설정</h1>
        <p className="text-sm text-slate-400 mt-0.5">계정 정보를 관리하세요</p>
      </div>

      {/* 프로필 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
          <UserCircleIcon className="w-4 h-4 text-emerald-500" />
          프로필
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-600">
            {(user?.displayName ?? "?")[0]}
          </div>
          <div>
            <div className="font-bold text-slate-800">{user?.displayName ?? "-"}</div>
            <div className="text-sm text-slate-400">{user?.email ?? ""}</div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500">닉네임 변경</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="새 닉네임 입력"
              className="flex-1 text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-400 outline-none"
            />
            <button
              onClick={handleSaveName}
              disabled={isSaving || !displayName.trim()}
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-emerald-700 transition-colors"
            >
              {isSaving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      </div>

      {/* 포트폴리오 정보 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <h2 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
          <InfoIcon className="w-4 h-4 text-indigo-500" />
          포트폴리오 정보
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="text-xs text-slate-400">시작 자금</div>
            <div className="font-bold text-slate-800 mt-0.5">1,000,000원</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="text-xs text-slate-400">계정 유형</div>
            <div className="font-bold text-slate-800 mt-0.5">개인 투자자</div>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          포트폴리오 비중 변경은{" "}
          <a href="/solo/portfolio" className="text-emerald-600 font-semibold hover:underline">
            포트폴리오 페이지
          </a>
          에서 할 수 있어요.
        </p>
      </div>

      {/* 보안 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <h2 className="font-bold text-slate-700 flex items-center gap-2 text-sm">
          <ShieldIcon className="w-4 h-4 text-slate-400" />
          계정 관리
        </h2>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 transition-colors rounded-xl border border-red-100"
        >
          <LogOutIcon className="w-4 h-4" />
          로그아웃
        </button>
      </div>
    </div>
  );
}
