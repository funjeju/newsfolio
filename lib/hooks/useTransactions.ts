"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Transaction } from "@/types/schema";

export function useMyTransactions(
  ownerId: string | null | undefined,
  maxCount = 20
) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!ownerId) { setIsLoading(false); return; }

    const q = query(
      collection(db, "transactions"),
      where("ownerId", "==", ownerId),
      orderBy("createdAt", "desc"),
      limit(maxCount)
    );

    const unsub = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
      setIsLoading(false);
    });

    return () => unsub();
  }, [ownerId, maxCount]);

  return { transactions, isLoading };
}
