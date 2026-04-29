"use client";

import { useEffect, useState } from "react";
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, doc, serverTimestamp, increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DiscussionThread, DiscussionReply } from "@/types/schema";

export function useGroupDiscussion(classId: string | null | undefined, groupId?: string | null) {
  const [threads, setThreads] = useState<DiscussionThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!classId) { setIsLoading(false); return; }

    const q = query(
      collection(db, "discussionThreads"),
      where("classId", "==", classId),
      orderBy("postedAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setThreads(snap.docs.map(d => ({ id: d.id, ...d.data() } as DiscussionThread)));
      setIsLoading(false);
    });

    return () => unsub();
  }, [classId]);

  return { threads, isLoading };
}

export function useThreadReplies(threadId: string | null | undefined) {
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!threadId) { setIsLoading(false); return; }

    const q = query(
      collection(db, "discussionReplies"),
      where("threadId", "==", threadId),
      orderBy("postedAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setReplies(snap.docs.map(d => ({ id: d.id, ...d.data() } as DiscussionReply)));
      setIsLoading(false);
    });

    return () => unsub();
  }, [threadId]);

  return { replies, isLoading };
}

export async function postThread(data: {
  classId: string;
  sectorId?: string;
  title: string;
  body: string;
  initiatorId: string;
  initiatorName: string;
}) {
  return addDoc(collection(db, "discussionThreads"), {
    ...data,
    replyCount: 0,
    voteUp: 0,
    voteDown: 0,
    postedAt: serverTimestamp(),
  });
}

export async function postReply(data: {
  threadId: string;
  authorId: string;
  authorName: string;
  body: string;
}) {
  const replyRef = await addDoc(collection(db, "discussionReplies"), {
    ...data,
    voteUp: 0,
    voteDown: 0,
    postedAt: serverTimestamp(),
  });
  // Increment reply count on the thread
  await updateDoc(doc(db, "discussionThreads", data.threadId), {
    replyCount: increment(1),
  });
  return replyRef;
}

export async function voteThread(threadId: string, direction: "up" | "down") {
  return updateDoc(doc(db, "discussionThreads", threadId), {
    [direction === "up" ? "voteUp" : "voteDown"]: increment(1),
  });
}
