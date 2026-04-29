"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Clock, AlertCircle, TrendingUp, PieChart, Newspaper, X } from "lucide-react";
import { toast } from "sonner";

const MOCK_NEWS_REQUESTS = [
  { id: "n1", student: "김지민 (1조)", sector: "반도체", url: "#", summary: "최신 AI 칩 수주 성공 소식입니다.", time: "10분 전" },
];
const MOCK_PORTFOLIO_REQUESTS = [
  { id: "p1", student: "박소윤 (3조)", changes: "반도체 25% → 40%, 게임 25% → 10%", time: "5분 전" },
];

export default function TeacherConfirmPage() {
  const [activeTab, setActiveTab] = useState<"news" | "portfolio">("news");
  const [newsRequests, setNewsRequests] = useState(MOCK_NEWS_REQUESTS);
  const [portfolioRequests, setPortfolioRequests] = useState(MOCK_PORTFOLIO_REQUESTS);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const handleApprove = (id: string, type: "news" | "portfolio") => {
    type === "news" ? setNewsRequests(p => p.filter(r => r.id !== id)) : setPortfolioRequests(p => p.filter(r => r.id !== id));
    toast.success("승인되었습니다.");
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">이의제기 및 컨펌</h1>
          <p className="text-muted-foreground mt-1">학생들의 요청을 승인하거나 반려하세요.</p>
        </div>
        <button className="flex items-center gap-2 bg-rose-500/10 text-rose-500 px-5 py-2.5 rounded-xl font-bold">
          <Clock className="w-5 h-5" /> <span>오늘의 장 수동 마감하기</span>
        </button>
      </div>

      <div className="flex gap-4 border-b">
        <button onClick={() => setActiveTab("news")} className={`px-4 py-3 font-semibold border-b-2 ${activeTab === "news" ? "border-primary text-primary" : "border-transparent"}`}>뉴스 제보</button>
        <button onClick={() => setActiveTab("portfolio")} className={`px-4 py-3 font-semibold border-b-2 ${activeTab === "portfolio" ? "border-primary text-primary" : "border-transparent"}`}>포트폴리오 변경</button>
      </div>

      <div className="min-h-[400px]">
        {activeTab === "news" ? (
          newsRequests.map(req => (
            <div key={req.id} className="glass p-5 rounded-2xl border flex justify-between gap-4 mb-4">
              <div><span className="font-bold">{req.student}</span><p className="text-sm">{req.summary}</p></div>
              <div className="flex gap-2">
                <button onClick={() => setRejectModalOpen(true)} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg">반려</button>
                <button onClick={() => handleApprove(req.id, "news")} className="px-4 py-2 bg-green-500 text-white rounded-lg">승인</button>
              </div>
            </div>
          ))
        ) : (
          portfolioRequests.map(req => (
            <div key={req.id} className="glass p-5 rounded-2xl border flex justify-between gap-4 mb-4">
              <div><span className="font-bold">{req.student}</span><p className="text-sm">{req.changes}</p></div>
              <div className="flex gap-2">
                <button onClick={() => setRejectModalOpen(true)} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg">반려</button>
                <button onClick={() => handleApprove(req.id, "portfolio")} className="px-4 py-2 bg-green-500 text-white rounded-lg">승인</button>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {rejectModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center p-4 bg-background/80">
            <div className="glass max-w-md w-full rounded-2xl p-6 border relative">
              <button onClick={() => setRejectModalOpen(false)} className="absolute top-4 right-4"><X /></button>
              <h2 className="text-xl font-bold mb-4 text-red-500">반려 사유 입력</h2>
              <textarea placeholder="반려 사유..." className="w-full h-32 rounded-xl border bg-background/50 p-3 mb-4" />
              <div className="flex gap-3 justify-end">
                <button onClick={() => setRejectModalOpen(false)} className="px-4 py-2 rounded-lg">취소</button>
                <button onClick={() => { setRejectModalOpen(false); toast.error("반려 처리되었습니다."); }} className="px-6 py-2 bg-red-500 text-white rounded-lg font-bold">반려하기</button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
