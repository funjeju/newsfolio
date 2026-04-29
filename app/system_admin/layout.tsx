"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboardIcon, BuildingIcon, UsersIcon, BarChart3Icon,
  ServerIcon, LogOutIcon, ShieldCheckIcon, SettingsIcon,
} from "lucide-react";
import { ReactNode } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUser } from "@/lib/hooks/useUser";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SystemAdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();

  const handleSignOut = async () => {
    await signOut(auth);
    toast.success("로그아웃됐어요.");
    router.push("/login");
  };

  const navLinks = [
    { href: "/system_admin/dashboard", label: "대시보드",    icon: LayoutDashboardIcon },
    { href: "/system_admin/schools",   label: "학교 관리",    icon: BuildingIcon },
    { href: "/system_admin/users",     label: "계정 관리",    icon: UsersIcon },
    { href: "/system_admin/stats",     label: "전체 통계",    icon: BarChart3Icon },
    { href: "/system_admin/functions", label: "함수 모니터",  icon: ServerIcon },
    { href: "/system_admin/settings",  label: "시스템 설정",  icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-60 border-r bg-card/50 backdrop-blur-md hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-5 border-b">
          <Link href="/system_admin/dashboard" className="flex items-center gap-2 font-display font-bold text-lg">
            <ShieldCheckIcon className="w-5 h-5 text-red-400" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-orange-400">
              시스템 관리자
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
                    ? "bg-red-500/20 text-red-300 border border-red-500/20"
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

      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
