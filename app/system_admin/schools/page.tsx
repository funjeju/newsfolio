"use client";

import { useState } from "react";
import * as motion from "framer-motion/client";
import {
  BuildingIcon, PlusIcon, SearchIcon, UsersIcon,
  BookOpenIcon, CopyIcon, CheckCircle2Icon, XCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MockSchool {
  id: string;
  name: string;
  address: string;
  schoolCode: string;
  adminCount: number;
  teacherCount: number;
  studentCount: number;
  activeClasses: number;
  status: "active" | "inactive" | "trial";
  registeredAt: string;
}

const MOCK_SCHOOLS: MockSchool[] = [
  { id: "s1", name: "서울 미래중학교",   address: "서울시 강남구",   schoolCode: "SEOUL001", adminCount: 1, teacherCount: 8,  studentCount: 312, activeClasses: 6,  status: "active", registeredAt: "2026-02-10" },
  { id: "s2", name: "부산 혁신초등학교", address: "부산시 해운대구", schoolCode: "BUSAN002", adminCount: 1, teacherCount: 12, studentCount: 480, activeClasses: 10, status: "active", registeredAt: "2026-02-15" },
  { id: "s3", name: "대구 창의중학교",   address: "대구시 수성구",   schoolCode: "DAEGU003", adminCount: 1, teacherCount: 6,  studentCount: 210, activeClasses: 4,  status: "active", registeredAt: "2026-03-01" },
  { id: "s4", name: "인천 스마트초등학교", address: "인천시 연수구", schoolCode: "INCHEON4", adminCount: 1, teacherCount: 4,  studentCount: 120, activeClasses: 2,  status: "trial",  registeredAt: "2026-04-01" },
  { id: "s5", name: "광주 미래중학교",   address: "광주시 서구",     schoolCode: "GWANGJ05", adminCount: 0, teacherCount: 0,  studentCount: 0,   activeClasses: 0,  status: "inactive", registeredAt: "2026-04-20" },
];

const STATUS_STYLE = {
  active:   { label: "정식 운영", color: "text-score-up bg-score-up/10" },
  trial:    { label: "체험판",    color: "text-yellow-400 bg-yellow-500/10" },
  inactive: { label: "미활성",    color: "text-muted-foreground bg-slate-100/70" },
};

export default function SystemAdminSchoolsPage() {
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const filtered = MOCK_SCHOOLS.filter(s =>
    s.name.includes(search) || s.address.includes(search)
  );

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("학교 코드가 복사됐어요!");
  };

  const handleRegister = () => {
    if (!newName.trim()) return;
    toast.success(`"${newName}" 학교가 등록됐어요!`);
    setNewName("");
    setNewAddress("");
    setShowNew(false);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-300 text-xs font-bold mb-3 border border-red-500/30">
            <BuildingIcon className="w-3.5 h-3.5" />
            학교 관리
          </div>
          <h1 className="text-2xl font-display font-bold">등록 학교 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">
            총 {MOCK_SCHOOLS.length}개 학교 · 정식 {MOCK_SCHOOLS.filter(s => s.status === "active").length}개 · 체험 {MOCK_SCHOOLS.filter(s => s.status === "trial").length}개
          </p>
        </div>
        <button
          onClick={() => setShowNew(v => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl text-sm font-bold hover:bg-red-500/30 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          학교 등록
        </button>
      </div>

      {/* New School Form */}
      {showNew && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="glass rounded-2xl p-5 border border-red-500/30 bg-red-500/5 space-y-3"
        >
          <h3 className="font-bold text-sm">새 학교 등록</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="학교 이름"
              className="p-3 bg-slate-100/70 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-red-500/50 placeholder:text-muted-foreground/50"
            />
            <input
              value={newAddress}
              onChange={e => setNewAddress(e.target.value)}
              placeholder="주소 (예: 서울시 강남구)"
              className="p-3 bg-slate-100/70 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-red-500/50 placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRegister}
              disabled={!newName.trim()}
              className="flex-1 py-2.5 bg-red-500/30 text-red-300 rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-red-500/40 transition-colors"
            >
              등록
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="px-4 py-2.5 bg-slate-100/70 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              취소
            </button>
          </div>
        </motion.div>
      )}

      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="학교 이름 또는 지역으로 검색"
          className="w-full pl-10 pr-4 py-3 bg-slate-100/70 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-brand-500/50 placeholder:text-muted-foreground/50"
        />
      </div>

      {/* School Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((school, i) => {
          const statusInfo = STATUS_STYLE[school.status];
          return (
            <motion.div
              key={school.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5 border border-border/50 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base">{school.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{school.address} · {school.registeredAt} 등록</p>
                </div>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold shrink-0", statusInfo.color)}>
                  {statusInfo.label}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-slate-100/70 rounded-xl p-2">
                  <p className="text-sm font-bold">{school.teacherCount}</p>
                  <p className="text-[10px] text-muted-foreground">교사</p>
                </div>
                <div className="bg-slate-100/70 rounded-xl p-2">
                  <p className="text-sm font-bold">{school.studentCount.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">학생</p>
                </div>
                <div className="bg-slate-100/70 rounded-xl p-2 col-span-2">
                  <p className="text-sm font-bold">{school.activeClasses}개 반</p>
                  <p className="text-[10px] text-muted-foreground">활성 반</p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-100/70 rounded-xl p-3">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-0.5">학교 코드</p>
                  <p className="font-mono font-bold text-sm tracking-widest">{school.schoolCode}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyCode(school.schoolCode)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-white/20 transition-colors"
                  >
                    <CopyIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  {school.status === "inactive" && (
                    <button
                      onClick={() => toast.success(`${school.name} 활성화됐어요.`)}
                      className="p-2 rounded-lg bg-score-up/10 text-score-up hover:bg-score-up/20 transition-colors"
                    >
                      <CheckCircle2Icon className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {school.status === "active" && (
                    <button
                      onClick={() => toast.success(`${school.name} 비활성화됐어요.`)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <XCircleIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
