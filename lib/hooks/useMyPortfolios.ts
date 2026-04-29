"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, limit, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Portfolio, PortfolioSnapshot } from "@/types/schema";

interface UseMyPortfoliosReturn {
  individual: Portfolio | null;
  group: Portfolio | null;
  snapshots: PortfolioSnapshot[];
  isLoading: boolean;
}

export function useMyPortfolios(
  userId: string | null | undefined,
  groupId: string | null | undefined,
  classId: string | null | undefined
): UseMyPortfoliosReturn {
  const [individual, setIndividual] = useState<Portfolio | null>(null);
  const [group, setGroup] = useState<Portfolio | null>(null);
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId || !classId) {
      setIsLoading(false);
      return;
    }

    const unsubscribers: (() => void)[] = [];

    // Individual portfolio
    const indivQ = query(
      collection(db, "portfolios"),
      where("ownerType", "==", "individual"),
      where("ownerId", "==", userId),
      where("classId", "==", classId),
      limit(1)
    );
    unsubscribers.push(
      onSnapshot(indivQ, (snap) => {
        if (!snap.empty) {
          const d = snap.docs[0];
          setIndividual({ id: d.id, ...d.data() } as Portfolio);

          // Also fetch last 30 snapshots
          const snapsQ = query(
            collection(db, "portfolios", d.id, "snapshots"),
            orderBy("date", "desc"),
            limit(30)
          );
          unsubscribers.push(
            onSnapshot(snapsQ, (sSnap) => {
              setSnapshots(
                sSnap.docs.map(s => ({ id: s.id, ...s.data() } as PortfolioSnapshot))
                  .reverse()
              );
            })
          );
        } else {
          setIndividual(null);
        }
        setIsLoading(false);
      })
    );

    // Group portfolio
    if (groupId) {
      const groupQ = query(
        collection(db, "portfolios"),
        where("ownerType", "==", "group"),
        where("ownerId", "==", groupId),
        where("classId", "==", classId),
        limit(1)
      );
      unsubscribers.push(
        onSnapshot(groupQ, (snap) => {
          if (!snap.empty) {
            const d = snap.docs[0];
            setGroup({ id: d.id, ...d.data() } as Portfolio);
          }
        })
      );
    }

    return () => unsubscribers.forEach(u => u());
  }, [userId, groupId, classId]);

  return { individual, group, snapshots, isLoading };
}
