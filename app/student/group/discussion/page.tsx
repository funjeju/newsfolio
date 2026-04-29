"use client";

import { useState } from "react";
import * as motion from "framer-motion/client";
import {
  MessageSquareIcon, PlusIcon, ThumbsUpIcon, ThumbsDownIcon,
  SendIcon, ArrowLeftIcon, ChevronDownIcon, ChevronUpIcon, FlameIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useUser } from "@/lib/hooks/useUser";
import { useGroupDiscussion, useThreadReplies, postThread, postReply, voteThread } from "@/lib/hooks/useDiscussion";
import { toast } from "sonner";

const MOCK_THREADS = [
  {
    id: "t1",
    classId: "cls1",
    sectorId: "semiconductor",
    title: "반도체 AI 점수 +4점, 과소평가 아닌가요?",
    body: "미국 수출 규제 완화 외에도 HBM3E 수주 급증 뉴스까지 있는데 +4점은 낮다고 생각해요. 어떻게 생각해요?",
    initiatorId: "u1",
    initiatorName: "김지민",
    replyCount: 5,
    voteUp: 8,
    voteDown: 1,
    postedAt: { seconds: 1745769600 },
  },
  {
    id: "t2",
    classId: "cls1",
    sectorId: "construction",
    title: "건설 -5점이 너무 심한 것 같아요",
    body: "PF 부실 뉴스가 크긴 하지만 이미 시장에 반영된 악재 아닌가요? 저는 -3점 정도가 적절하다고 봐요.",
    initiatorId: "u2",
    initiatorName: "이현우",
    replyCount: 3,
    voteUp: 4,
    voteDown: 2,
    postedAt: { seconds: 1745683200 },
  },
  {
    id: "t3",
    classId: "cls1",
    sectorId: undefined,
    title: "우리 조 이번 주 전략 토론",
    body: "반도체 비중을 60%로 유지할지, 아니면 게임쪽으로 일부 이동할지 의견을 나눠봐요!",
    initiatorId: "u3",
    initiatorName: "박소윤",
    replyCount: 7,
    voteUp: 10,
    voteDown: 0,
    postedAt: { seconds: 1745596800 },
  },
];

const SECTOR_NAMES: Record<string, string> = {
  semiconductor: "💻 반도체", automotive: "🚗 자동차", game: "🎮 게임",
  content: "🎬 콘텐츠", travel: "✈️ 여행", green_energy: "🌱 친환경",
  food: "🍔 식품", construction: "🏗️ 건설", geopolitics: "🌐 국제정세",
  global_trade: "🚢 글로벌무역",
};

function ThreadCard({
  thread,
  onSelect,
  onVote,
}: {
  thread: typeof MOCK_THREADS[0];
  onSelect: (id: string) => void;
  onVote: (id: string, dir: "up" | "down") => void;
}) {
  const isHot = thread.voteUp >= 8;
  const date = thread.postedAt?.seconds
    ? new Date(thread.postedAt.seconds * 1000).toLocaleDateString("ko-KR")
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl border border-border/50 hover:border-white/20 transition-all cursor-pointer group"
      onClick={() => onSelect(thread.id)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {thread.sectorId && (
              <span className="text-xs px-2 py-0.5 bg-brand-500/20 text-brand-300 rounded-full font-semibold">
                {SECTOR_NAMES[thread.sectorId] ?? thread.sectorId}
              </span>
            )}
            {isHot && (
              <span className="flex items-center gap-0.5 text-xs text-orange-400">
                <FlameIcon className="w-3 h-3 fill-orange-400" /> 인기
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{date}</span>
        </div>

        <h3 className="font-bold text-base group-hover:text-brand-300 transition-colors mb-1">
          {thread.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {thread.body}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">{thread.initiatorName}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MessageSquareIcon className="w-3.5 h-3.5" />
              {thread.replyCount}
            </span>
            <button
              onClick={e => { e.stopPropagation(); onVote(thread.id, "up"); }}
              className="flex items-center gap-1 hover:text-score-up transition-colors"
            >
              <ThumbsUpIcon className="w-3.5 h-3.5" />
              {thread.voteUp}
            </button>
            <button
              onClick={e => { e.stopPropagation(); onVote(thread.id, "down"); }}
              className="flex items-center gap-1 hover:text-score-down transition-colors"
            >
              <ThumbsDownIcon className="w-3.5 h-3.5" />
              {thread.voteDown}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ReplyView({
  threadId,
  thread,
  onBack,
  user,
}: {
  threadId: string;
  thread: typeof MOCK_THREADS[0];
  onBack: () => void;
  user: any;
}) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const MOCK_REPLIES = [
    { id: "r1", threadId, authorId: "u2", authorName: "이현우", body: "저도 동의해요! HBM 뉴스는 진짜 큰 호재인데 AI가 놓친 것 같아요.", voteUp: 3, voteDown: 0, postedAt: { seconds: 1745773200 } },
    { id: "r2", threadId, authorId: "u3", authorName: "박소윤", body: "다만 중국 보복 관세 가능성도 있으니까 +5점은 좀 과한 것 같기도 해요.", voteUp: 2, voteDown: 0, postedAt: { seconds: 1745776800 } },
    { id: "r3", threadId, authorId: "u4", authorName: "최준호", body: "이의제기 제출했어요! 논리 탄탄하게 써봤는데 같이 확인해봐요.", voteUp: 5, voteDown: 0, postedAt: { seconds: 1745780400 } },
  ];

  const handleSend = async () => {
    if (!body.trim() || !user) return;
    setSending(true);
    try {
      await postReply({
        threadId,
        authorId: user.id,
        authorName: user.displayName ?? "학생",
        body: body.trim(),
      });
      setBody("");
      toast.success("답글이 등록됐어요!");
    } catch {
      toast.error("등록에 실패했어요.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeftIcon className="w-4 h-4" />
        토론 목록으로
      </button>

      {/* Original thread */}
      <div className="glass rounded-2xl p-5 border border-brand-500/30 bg-brand-500/5">
        <div className="flex items-center gap-2 mb-2">
          {thread.sectorId && (
            <span className="text-xs px-2 py-0.5 bg-brand-500/20 text-brand-300 rounded-full font-semibold">
              {SECTOR_NAMES[thread.sectorId]}
            </span>
          )}
          <span className="text-xs text-muted-foreground">{thread.initiatorName}</span>
        </div>
        <h3 className="font-bold text-lg mb-2">{thread.title}</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">{thread.body}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ThumbsUpIcon className="w-3.5 h-3.5" />{thread.voteUp}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquareIcon className="w-3.5 h-3.5" />{thread.replyCount}개 답글
          </span>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-3">
        {MOCK_REPLIES.map((reply, i) => {
          const isMe = reply.authorId === user?.id;
          return (
            <motion.div
              key={reply.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                "glass rounded-xl p-4 border",
                isMe ? "border-brand-500/30 bg-brand-500/5 ml-4" : "border-border/50"
              )}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  isMe ? "bg-brand-500 text-white" : "bg-white/10"
                )}>
                  {reply.authorName.charAt(0)}
                </div>
                <span className="text-sm font-semibold">{reply.authorName}</span>
                {isMe && <span className="text-[10px] px-1.5 py-0.5 bg-brand-500/20 text-brand-300 rounded-full">나</span>}
              </div>
              <p className="text-sm leading-relaxed">{reply.body}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <button className="flex items-center gap-1 hover:text-score-up transition-colors">
                  <ThumbsUpIcon className="w-3 h-3" />{reply.voteUp}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Reply input */}
      <div className="glass rounded-2xl p-4 border border-border/50 space-y-3">
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={3}
          placeholder="의견을 입력하세요..."
          className="w-full p-3 bg-white/5 border border-border/50 rounded-xl text-sm resize-none focus:outline-none focus:border-brand-500/50 placeholder:text-muted-foreground/50"
        />
        <button
          onClick={handleSend}
          disabled={!body.trim() || sending}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-500 text-white rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-brand-600 transition-colors"
        >
          <SendIcon className="w-4 h-4" />
          {sending ? "등록 중..." : "답글 등록"}
        </button>
      </div>
    </div>
  );
}

export default function GroupDiscussionPage() {
  const { user } = useUser();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [showNewThread, setShowNewThread] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newSector, setNewSector] = useState("");
  const [posting, setPosting] = useState(false);

  const threads = MOCK_THREADS;
  const selectedThread = threads.find(t => t.id === selectedThreadId);

  const handleVote = async (threadId: string, dir: "up" | "down") => {
    try {
      await voteThread(threadId, dir);
    } catch {
      toast.error("투표에 실패했어요.");
    }
  };

  const handlePost = async () => {
    if (!user || !newTitle.trim() || !newBody.trim()) return;
    setPosting(true);
    try {
      await postThread({
        classId: user.classId ?? "",
        sectorId: newSector || undefined,
        title: newTitle.trim(),
        body: newBody.trim(),
        initiatorId: user.id,
        initiatorName: user.displayName ?? "학생",
      });
      toast.success("토론이 등록됐어요!");
      setNewTitle("");
      setNewBody("");
      setNewSector("");
      setShowNewThread(false);
    } catch {
      toast.error("등록에 실패했어요.");
    } finally {
      setPosting(false);
    }
  };

  if (selectedThread && selectedThreadId) {
    return (
      <div className="max-w-2xl mx-auto pb-10">
        <ReplyView
          threadId={selectedThreadId}
          thread={selectedThread}
          onBack={() => setSelectedThreadId(null)}
          user={user}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/student/group" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
            <ArrowLeftIcon className="w-4 h-4" />
            우리 조로 돌아가기
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-300 text-xs font-bold mb-2 border border-brand-500/30">
            <MessageSquareIcon className="w-3.5 h-3.5" />
            조 토론방
          </div>
          <h1 className="text-2xl font-display font-bold">슈퍼노바5조 토론방</h1>
          <p className="text-sm text-muted-foreground mt-1">오늘 뉴스를 함께 분석하고 투자 전략을 논의해요!</p>
        </div>
        <button
          onClick={() => setShowNewThread(v => !v)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-bold hover:bg-brand-600 transition-colors shrink-0"
        >
          <PlusIcon className="w-4 h-4" />
          새 토론
        </button>
      </div>

      {/* New Thread Form */}
      {showNewThread && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="glass rounded-2xl p-5 border border-brand-500/30 bg-brand-500/5 space-y-3"
        >
          <h3 className="font-bold text-sm">새 토론 작성</h3>
          <select
            value={newSector}
            onChange={e => setNewSector(e.target.value)}
            className="w-full p-3 bg-white/5 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-brand-500/50"
          >
            <option value="">섹터 선택 (선택 사항)</option>
            {Object.entries(SECTOR_NAMES).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
          <input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="토론 제목"
            className="w-full p-3 bg-white/5 border border-border/50 rounded-xl text-sm focus:outline-none focus:border-brand-500/50 placeholder:text-muted-foreground/50"
          />
          <textarea
            value={newBody}
            onChange={e => setNewBody(e.target.value)}
            rows={3}
            placeholder="토론 내용을 입력하세요..."
            className="w-full p-3 bg-white/5 border border-border/50 rounded-xl text-sm resize-none focus:outline-none focus:border-brand-500/50 placeholder:text-muted-foreground/50"
          />
          <div className="flex gap-2">
            <button
              onClick={handlePost}
              disabled={posting || !newTitle.trim() || !newBody.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-brand-500 text-white rounded-xl font-bold text-sm disabled:opacity-50 hover:bg-brand-600 transition-colors"
            >
              <SendIcon className="w-4 h-4" />
              {posting ? "등록 중..." : "토론 등록"}
            </button>
            <button
              onClick={() => setShowNewThread(false)}
              className="px-4 py-2.5 bg-white/5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              취소
            </button>
          </div>
        </motion.div>
      )}

      {/* Thread List */}
      <div className="space-y-3">
        {threads.map((thread, i) => (
          <ThreadCard
            key={thread.id}
            thread={thread}
            onSelect={setSelectedThreadId}
            onVote={handleVote}
          />
        ))}
      </div>
    </div>
  );
}
