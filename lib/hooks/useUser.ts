"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { User } from "@/types/schema";

interface UseUserReturn {
  user: User | null;
  firebaseUid: string | null;
  isLoading: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setFirebaseUid(null);
        setIsLoading(false);
        return;
      }

      setFirebaseUid(firebaseUser.uid);

      const unsubDoc = onSnapshot(
        doc(db, "users", firebaseUser.uid),
        (snap) => {
          if (snap.exists()) {
            setUser({ id: snap.id, ...snap.data() } as User);
          } else {
            setUser(null);
          }
          setIsLoading(false);
        },
        () => setIsLoading(false)
      );

      return () => unsubDoc();
    });

    return () => unsubAuth();
  }, []);

  return {
    user,
    firebaseUid,
    isLoading,
    isTeacher: user?.role === "teacher",
    isStudent: user?.role === "student",
  };
}
