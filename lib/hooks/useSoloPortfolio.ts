"use client";

import { useEffect, useState } from "react";
import {
  doc, getDoc, setDoc, onSnapshot,
  collection, query, orderBy, limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Portfolio, PortfolioSnapshot, SectorAllocation } from "@/types/schema";

export function useSoloPortfolio(userId: string | null | undefined) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const unsubscribers: (() => void)[] = [];

    unsubscribers.push(
      onSnapshot(
        doc(db, "portfolios", userId),
        (pSnap) => {
          if (pSnap.exists()) {
            setPortfolio({ id: pSnap.id, ...pSnap.data() } as Portfolio);
            const snapQ = query(
              collection(db, "portfolios", userId, "snapshots"),
              orderBy("date", "asc"),
              limit(30)
            );
            unsubscribers.push(
              onSnapshot(snapQ, (sSnap) => {
                setSnapshots(sSnap.docs.map(d => ({ id: d.id, ...d.data() } as PortfolioSnapshot)));
              })
            );
          } else {
            setPortfolio(null);
            setSnapshots([]);
          }
          setIsLoading(false);
        },
        () => setIsLoading(false)
      )
    );

    return () => unsubscribers.forEach(u => u());
  }, [userId]);

  return { portfolio, snapshots, isLoading };
}

export async function saveSoloPortfolio(
  userId: string,
  allocations: SectorAllocation[]
): Promise<void> {
  const ref = doc(db, "portfolios", userId);
  const existing = await getDoc(ref);
  const currentValue: number = existing.exists()
    ? (existing.data().currentValue ?? 1_000_000)
    : 1_000_000;

  await setDoc(ref, {
    ownerType: "individual",
    ownerId: userId,
    classId: "solo",
    seasonId: "solo",
    startingValue: 1_000_000,
    currentValue,
    allocations,
    effectiveFrom: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
  });
}
