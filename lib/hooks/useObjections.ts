"use client";

import { useEffect, useState } from "react";
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, updateDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Objection, ApprovalStatus } from "@/types/schema";

// Student: watch own objections
export function useMyObjections(studentId: string | null | undefined) {
  const [objections, setObjections] = useState<Objection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!studentId) { setIsLoading(false); return; }

    const q = query(
      collection(db, "objections"),
      where("studentId", "==", studentId),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setObjections(snap.docs.map(d => ({ id: d.id, ...d.data() } as Objection)));
      setIsLoading(false);
    });

    return () => unsub();
  }, [studentId]);

  return { objections, isLoading };
}

// Teacher: watch pending objections for a class
export function usePendingObjections(classId: string | null | undefined) {
  const [objections, setObjections] = useState<Objection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!classId) { setIsLoading(false); return; }

    const q = query(
      collection(db, "objections"),
      where("classId", "==", classId),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setObjections(snap.docs.map(d => ({ id: d.id, ...d.data() } as Objection)));
      setIsLoading(false);
    });

    return () => unsub();
  }, [classId]);

  return { objections, isLoading };
}

// Submit a new objection
export async function submitObjection(data: Omit<Objection, "id" | "createdAt" | "status">) {
  return addDoc(collection(db, "objections"), {
    ...data,
    status: "pending" as ApprovalStatus,
    createdAt: serverTimestamp(),
  });
}

// Teacher: update objection decision
export async function reviewObjection(
  objectionId: string,
  decision: ApprovalStatus,
  reviewedScore: number | undefined,
  teacherComment: string,
  teacherId: string
) {
  return updateDoc(doc(db, "objections", objectionId), {
    status: decision,
    reviewedScore,
    teacherComment,
    reviewedBy: teacherId,
    reviewedAt: serverTimestamp(),
  });
}
