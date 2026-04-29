"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboardIcon, UsersIcon, BookOpenIcon, SettingsIcon,
  LogOutIcon, SchoolIcon, BarChart3Icon,
} from "lucide-react";
import { ReactNode } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUser } from "@/lib/hooks/useUser";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SchoolAdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  const handleSignOut = async () => {
    await signOut(auth);
    toast.success("로그아웃됐어요.");
    router.push("/login");
  };

  const navLinks = [
    { href: "/school_admin/dashboard", label: "대시보드",     icon: LayoutDashboardIcon },
    { href: "/school_admin/teachers",  label: "교사 관리",     icon: UsersIcon },
    { href: "/school_admin/classes",   label: "반 관리",       icon: BookOpenIcon },
    { href: "/school_admin/stats",     label: "학교 통계",     icon: BarChart3Icon },
    { href: "/school_admin/settings",  label: "설정",          icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-60 border-r bg-card/50 backdrop-blur-md hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-5 border-b">
          <Link href="/school_admin/dashboard" className="flex items-center gap-2 font-display font-bold text-lg">
            <SchoolIcon className="w-5 h-5 text-brand-400" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-300 to-purple-400">
              학교 관리자
            </span>
          </Link>
          {user && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{user.displayName}</p>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navLinks.map(link => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all text-sm",
                  isActive
                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                    : "text-muted-foreground hover:bg-slate-100/70 hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/5"
          >
            <LogOutIcon className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-8 max-w-6xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
