"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Briefing } from "@/types/schema";

function todayKST(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

interface UseTodayBriefingReturn {
  briefing: Briefing | null;
  isLoading: boolean;
  error: string | null;
}

export function useTodayBriefing(classId: string | null | undefined): UseTodayBriefingReturn {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!classId) {
      setIsLoading(false);
      return;
    }

    const today = todayKST();
    const q = query(
      collection(db, "briefings"),
      where("classId", "==", classId),
      where("date", "==", today),
      orderBy("date", "desc"),
      limit(1)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const doc = snap.docs[0];
          setBriefing({ id: doc.id, ...doc.data() } as Briefing);
        } else {
          setBriefing(null);
        }
        setIsLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsub();
  }, [classId]);

  return { briefing, isLoading, error };
}
