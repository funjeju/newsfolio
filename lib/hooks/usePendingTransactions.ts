"use client";

import { useEffect, useState } from "react";
import {
  collection, query, where, orderBy, onSnapshot,
  updateDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Transaction } from "@/types/schema";

export function usePendingTransactions(classId: string | null | undefined) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!classId) { setIsLoading(false); return; }

    const q = query(
      collection(db, "transactions"),
      where("classId", "==", classId),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
      setIsLoading(false);
    });

    return () => unsub();
  }, [classId]);

  return { transactions, isLoading };
}

export async function reviewTransaction(
  transactionId: string,
  decision: "approved" | "rejected",
  teacherId: string,
  teacherComment?: string
) {
  return updateDoc(doc(db, "transactions", transactionId), {
    status: decision,
    reviewedBy: teacherId,
    reviewedAt: serverTimestamp(),
    teacherComment: teacherComment ?? "",
  });
}
