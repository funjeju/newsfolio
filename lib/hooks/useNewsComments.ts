"use client";

import { useEffect, useState } from "react";
import {
  collection, query, orderBy, onSnapshot,
  addDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface NewsComment {
  id: string;
  userId: string;
  displayName: string;
  body: string;
  type: "comment" | "rebuttal";
  createdAt: string;
}

// Document path: newsComments/{date}_{sectorId}_{newsIdx}/replies
export function useNewsComments(date: string, sectorId: string, newsIdx: number) {
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const docId = `${date}_${sectorId}_${newsIdx}`;
    const q = query(
      collection(db, "newsComments", docId, "replies"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setComments(snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? "",
        } as NewsComment)));
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
    return () => unsub();
  }, [date, sectorId, newsIdx]);

  return { comments, isLoading };
}

export async function addNewsComment(params: {
  date: string;
  sectorId: string;
  newsIdx: number;
  userId: string;
  displayName: string;
  body: string;
  type: "comment" | "rebuttal";
}) {
  const { date, sectorId, newsIdx, userId, displayName, body, type } = params;
  const docId = `${date}_${sectorId}_${newsIdx}`;
  await addDoc(collection(db, "newsComments", docId, "replies"), {
    userId,
    displayName,
    body,
    type,
    createdAt: serverTimestamp(),
  });
}
