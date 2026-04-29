"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PublicScores } from "@/types/schema";

function getKSTDateStr(): string {
  const kst = new Date(Date.now() + 9 * 3600000);
  return kst.toISOString().split("T")[0];
}

export function usePublicScores(date?: string) {
  const targetDate = date ?? getKSTDateStr();
  const [scores, setScores] = useState<PublicScores | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "publicScores", targetDate),
      (snap) => {
        setScores(snap.exists() ? ({ id: snap.id, ...snap.data() } as PublicScores) : null);
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
    return () => unsub();
  }, [targetDate]);

  return { scores, isLoading, date: targetDate };
}
