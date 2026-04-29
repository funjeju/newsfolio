"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

// DEV bypass: Check session storage for dev mode role
const DEV_ROLE_KEY = "newsfolio_dev_role";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check dev bypass first
    const devRole = sessionStorage.getItem(DEV_ROLE_KEY);
    if (devRole) {
      // Allow navigation — dev bypass is active
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const isPublicRoute = pathname === "/login" || pathname === "/join" || pathname === "/";

      if (!user) {
        if (!isPublicRoute) {
          router.push("/login");
        } else {
          setIsLoading(false);
        }
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (isPublicRoute) {
            if (userData.role === "teacher") {
              router.push("/teacher/dashboard");
            } else {
              router.push("/student/dashboard");
            }
          } else {
            if (pathname.startsWith("/teacher") && userData.role !== "teacher") {
              router.push("/student/dashboard");
            } else if (pathname.startsWith("/student") && userData.role !== "student") {
              router.push("/teacher/dashboard");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}

// Helper to set dev bypass role
export function setDevRole(role: "student" | "teacher") {
  sessionStorage.setItem(DEV_ROLE_KEY, role);
}

export function clearDevRole() {
  sessionStorage.removeItem(DEV_ROLE_KEY);
}
