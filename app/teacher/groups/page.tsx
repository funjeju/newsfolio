"use client";

import { useState } from "react";
import { UsersIcon, PencilIcon, ShuffleIcon, PieChartIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import * as motion from "framer-motion/client";

const ROLE_COLORS: Record<string, string> = {
  "애널리스트": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "리서처": "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "기자": "text-green-400 bg-green-500/10 border-green-500/20",
  "반박검사관": "text-orange-400 bg-orange-500/10 border-orange-500/20",
  "편집장": "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  "감사관": "text-red-400 bg-red-500/10 border-red-500/20",
};

interface GroupMember {
  id: string;
  name: string;
  role: string;
  returnPercent: number;
  activityRate: number;
}

interface Group {
  id: string;
  name: string;
  number: number;
  leader: string;
  mainSectors: string[];
  portfolioValue: number;
  returnPercent: number;
  rank: number;
  members: GroupMember[];
}

const MOCK_GROUPS: Group[] = [
  {
    id: "g1", name: "갤럭시1조", number: 1, leader: "이수현",
    mainSectors: ["반도체", "게임"],
    portfolioValue: 62000000, returnPercent: 55.0, rank: 1,
    members: [
      { id: "m1", name: "이수현", role: "애널리스트", returnPercent: 52.0, activityRate: 95 },
      { id: "m2", name: "박준서", role: "리서처", returnPercent: 48.0, activityRate: 88 },
      { id: "m3", name: "정다은", role: "기자", returnPercent: 41.0, activityRate: 82 },
      { id: "m4", name: "홍민기", role: "편집장", returnPercent: 38.0, activityRate: 78 },
      { id: "m5", name: "강지원", role: "감사관", returnPercent: 35.0, activityRate: 70 },
    ],
  },
  {
    id: "g2", name: "오리온2조", number: 2, leader: "최아린",
    mainSectors: ["친환경", "자동차"],
    portfolioValue: 58000000, returnPercent: 45.0, rank: 2,
    members: [
      { id: "m6", name: "최아린", role: "편집장", returnPercent: 41.0, activityRate: 92 },
      { id: "m7", name: "오서준", role: "애널리스트", returnPercent: 38.0, activityRate: 85 },
      { id: "m8", name: "윤예은", role: "기자", returnPercent: 35.0, activityRate: 80 },
      { id: "m9", name: "한지수", role: "리서처", returnPercent: 30.0, activityRate: 75 },
      { id: "m10", name: "임도현", role: "반박검사관", returnPercent: 28.0, activityRate: 68 },
    ],
  },
  {
    id: "g3", name: "슈퍼노바5조", number: 5, leader: "김민준",
    mainSectors: ["반도체", "자동차"],
    portfolioValue: 48230000, returnPercent: 26.0, rank: 3,
    members: [
      { id: "m11", name: "김민준", role: "애널리스트", returnPercent: 24.5, activityRate: 90 },
      { id: "m12", name: "서하린", role: "리서처", returnPercent: 22.0, activityRate: 85 },
      { id: "m13", name: "노준혁", role: "기자", returnPercent: 20.0, activityRate: 78 },
      { id: "m14", name: "신채원", role: "반박검사관", returnPercent: 18.0, activityRate: 72 },
      { id: "m15", name: "백승우", role: "감사관", returnPercent: 15.0, activityRate: 65 },
    ],
  },
];

export default function TeacherGroupsPage() {
  const [expandedId, setExpandedId] = useState<string | null>("g1");

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-purple-400" />
            조 관리
          </h1>
          <p className="text-muted-foreground mt-1">전체 {MOCK_GROUPS.length}개 조 · 조원 역할 배정 및 포트폴리오 현황</p>
        </div>
        <button
          disabled
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100/70 border border-border/50 text-muted-foreground text-sm font-bold cursor-not-allowed opacity-50"
          title="Firestore 연동 후 활성화"
        >
          <ShuffleIcon className="w-4 h-4" />
          조 재배치
        </button>
      </div>

      {/* Group Cards */}
      <div className="space-y-3">
        {MOCK_GROUPS.map((group, i) => {
          const isExpanded = expandedId === group.id;
          const isPositive = group.returnPercent > 0;

          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-2xl border border-border/50 overflow-hidden"
            >
              {/* Group Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : group.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-100/70 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/15 flex items-center justify-center font-display font-bold text-brand-400 flex-shrink-0">
                  {group.number}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-lg">{group.name}</span>
                    <span className="text-sm text-muted-foreground">리더: {group.leader}</span>
                    {group.rank <= 3 && (
                      <span>{group.rank === 1 ? "🥇" : group.rank === 2 ? "🥈" : "🥉"}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-muted-foreground">메인 섹터:</span>
                    {group.mainSectors.map(s => (
                      <span key={s} className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="font-mono font-bold">₩{(group.portfolioValue / 10000).toFixed(0)}만</div>
                  <div className={cn("text-sm font-bold", isPositive ? "text-score-up" : "text-score-down")}>
                    {isPositive ? "+" : ""}{group.returnPercent}%
                  </div>
                </div>

                {isExpanded ? (
                  <ChevronUpIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                )}
              </button>

              {/* Member List */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-t border-border/50 p-5 space-y-2"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-muted-foreground">조원 ({group.members.length}명)</h3>
                    <button
                      disabled
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors opacity-50 cursor-not-allowed"
                    >
                      <PencilIcon className="w-3 h-3" /> 역할 수정
                    </button>
                  </div>

                  {group.members.map(member => (
                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-100/70">
                      <div className="flex-1 flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{member.name}</span>
                        {member.name === group.leader && (
                          <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-bold">리더</span>
                        )}
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-bold", ROLE_COLORS[member.role] || "text-muted-foreground bg-slate-100/70 border-border/50")}>
                          {member.role}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={cn("text-sm font-bold font-mono", member.returnPercent > 0 ? "text-score-up" : "text-score-down")}>
                          {member.returnPercent > 0 ? "+" : ""}{member.returnPercent}%
                        </div>
                        <div className="text-xs text-muted-foreground">활동 {member.activityRate}%</div>
                      </div>
                    </div>
                  ))}

                  {/* Group Main Sectors */}
                  <div className="mt-4 p-4 rounded-xl bg-slate-100/70 border border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <PieChartIcon className="w-3.5 h-3.5" />
                      메인 섹터
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {group.mainSectors.map(s => (
                        <span key={s} className="text-xs px-2 py-0.5 bg-brand-500/20 text-brand-300 rounded-full font-semibold">{s}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground py-4">
        Firestore 연동 후 실시간 데이터로 표시됩니다
      </p>
    </div>
  );
}
