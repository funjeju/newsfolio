"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircleIcon, AlertTriangleIcon, RocketIcon, MailIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const CHECKLIST = [
  { id: "1", label: "학년·반 정보", detail: "5학년 3반 (Tone 3)", required: true, done: true },
  { id: "2", label: "섹터 활성화", detail: "10개 중 10개 사용", required: true, done: true },
  { id: "3", label: "시즌 일정", detail: "2026-05-01 ~ 2027-02-28", required: true, done: true },
  { id: "4", label: "학생 등록 방식", detail: "학급코드 ABC1234 발급", required: true, done: true },
  { id: "5", label: "조 매칭", detail: "자동 배치 6조 (조당 4명)", required: true, done: true },
  { id: "6", label: "조 변경 권한 모드", detail: "조원 누구나 신청 가능", required: true, done: true },
  { id: "7", label: "컨펌 모드", detail: "항상 교사 컨펌", required: true, done: true },
  { id: "8", label: "안전 포털 사이트", detail: "6개 등록", required: false, done: true },
  { id: "9", label: "학부모 안내장 발송", detail: "발송 전입니다", required: false, done: false },
  { id: "10", label: "첫 주차 학습 자료", detail: "자동 활성화됨", required: false, done: true },
];

export default function TeacherPreflightPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classId = searchParams.get("classId");
  const [parentNoticesSent, setParentNoticesSent] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const requiredDone = CHECKLIST.filter(c => c.required).every(c => c.done);
  const optionalDone = CHECKLIST.filter(c => !c.required && c.id !== "9").every(c => c.done);

  const handleSendNotices = () => {
    setParentNoticesSent(true);
    toast.success("📧 학부모 안내장이 발송됐어요!");
  };

  const handleStart = async () => {
    setIsStarting(true);
    try {
      if (classId) {
        await updateDoc(doc(db, "classes", classId), {
          seasonState: "running",
          startedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      toast.success("🚀 시즌이 시작됐어요! 학생들이 가입할 수 있어요.");
      router.push("/teacher/dashboard");
    } catch (err: any) {
      toast.error(err.message || "시즌 시작에 실패했어요.");
      setIsStarting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto pb-20 space-y-6">
      <div className="text-center pt-4">
        <div className="w-16 h-16 bg-brand-500/20 text-brand-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <RocketIcon className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold">시즌 시작 준비</h1>
        <p className="text-muted-foreground mt-1">5학년 3반 — 모든 항목을 확인해요</p>
      </div>

      <div className="glass rounded-2xl p-5 border border-border/50 space-y-3">
        {CHECKLIST.map((item, i) => {
          const isParentNotice = item.id === "9";
          const isDone = isParentNotice ? parentNoticesSent : item.done;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold",
                isDone ? "bg-emerald-500/20 text-emerald-400" : item.required ? "bg-yellow-500/20 text-yellow-500" : "bg-white/10 text-muted-foreground"
              )}>
                {isDone ? <CheckCircleIcon className="w-4 h-4" /> : <AlertTriangleIcon className="w-3.5 h-3.5" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{i + 1}. {item.label}</span>
                  {item.required ? (
                    <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full">필수</span>
                  ) : (
                    <span className="text-[10px] bg-white/10 text-muted-foreground px-1.5 py-0.5 rounded-full">권장</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{isParentNotice ? (parentNoticesSent ? "발송 완료" : "발송 전입니다") : item.detail}</div>
              </div>
              {isParentNotice && !parentNoticesSent && (
                <button onClick={handleSendNotices} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500/20 text-brand-300 rounded-lg text-xs font-bold hover:bg-brand-500/30 transition-colors">
                  <MailIcon className="w-3 h-3" />
                  지금 발송
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="glass rounded-2xl p-4 border border-border/50">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-emerald-400">7/7</div>
            <div className="text-xs text-muted-foreground">필수 항목 완료</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">{parentNoticesSent ? "3/3" : "2/3"}</div>
            <div className="text-xs text-muted-foreground">권장 항목 완료</div>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStart}
        disabled={!requiredDone || isStarting}
        className="w-full flex flex-col items-center gap-2 py-5 bg-brand-500 text-white rounded-2xl font-bold hover:bg-brand-600 transition-all disabled:opacity-50 shadow-[0_6px_28px_rgba(99,102,241,0.4)]"
      >
        <span className="flex items-center gap-2 text-lg">
          {isStarting ? (
            <>⏳ 시즌 시작 중...</>
          ) : (
            <><RocketIcon className="w-5 h-5" /> 🚀 시즌 시작하기</>
          )}
        </span>
        {!isStarting && (
          <span className="text-xs text-brand-200">
            시작하면 학생 가입이 활성화되고 매일 06:00 브리핑이 시작돼요
          </span>
        )}
      </button>
    </div>
  );
}
