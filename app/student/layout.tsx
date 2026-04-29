"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, FileText, PieChart, Users, Trophy, Target,
  Settings, LogOut, BellIcon, UserCircleIcon, BookOpenIcon, MessageSquarePlusIcon,
} from "lucide-react";
import { ReactNode } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUser } from "@/lib/hooks/useUser";
import { toast } from "sonner";

export default function StudentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useUser();

  const displayName = user?.displayName ?? (isLoading ? "..." : "학생");
  const className = isLoading ? "" : (user ? `${user.grade ?? ""}학년` : "");
  const notifications = 0;

  const handleSignOut = async () => {
    await signOut(auth);
    toast.success("로그아웃됐어요.");
    router.push("/login");
  };

  const navLinks = [
    { href: "/student/dashboard",  label: "홈",         icon: Home },
    { href: "/student/briefing",   label: "오늘의 뉴스",  icon: FileText },
    { href: "/student/portfolio",  label: "포트폴리오",   icon: PieChart },
    { href: "/student/group",      label: "우리 조",     icon: Users },
    { href: "/student/ranking",    label: "랭킹",        icon: Trophy },
    { href: "/student/reports",    label: "리포트",      icon: BookOpenIcon },
    { href: "/student/objections", label: "이의제기",    icon: MessageSquarePlusIcon },
    { href: "/student/missions",   label: "미션",        icon: Target },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r bg-card/50 backdrop-blur-md hidden md:flex flex-col z-20 sticky top-0 h-screen">
        <div className="p-6 border-b">
          <Link href="/student/dashboard" className="flex items-center gap-2 font-display font-bold text-foreground text-xl">
            <span>📰</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Newsfolio
            </span>
          </Link>
          <div className="mt-2 text-xs font-medium text-muted-foreground px-1">학생 시뮬레이터</div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info + Actions */}
        <div className="p-4 border-t space-y-1">
          {/* User Card */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-border/50 mb-2">
            <UserCircleIcon className="w-8 h-8 text-brand-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-bold text-sm text-foreground truncate">{displayName}</div>
              <div className="text-xs text-muted-foreground truncate">{className}</div>
            </div>
            {notifications > 0 && (
              <span className="ml-auto flex-shrink-0 w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                {notifications}
              </span>
            )}
          </div>
          <Link
            href="/student/settings"
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-white/5"
          >
            <Settings className="w-4 h-4" />
            <span>설정</span>
          </Link>
          <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/5">
            <LogOut className="w-4 h-4" />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-background/80 backdrop-blur-md sticky top-0 z-30">
          <div>
            <div className="font-bold text-sm text-foreground">{displayName}</div>
            <div className="text-xs text-muted-foreground">{className}</div>
          </div>
          <span className="font-display font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            Newsfolio
          </span>
          <div className="relative">
            <button className="p-2 rounded-xl hover:bg-white/10 transition-colors">
              <BellIcon className="w-5 h-5 text-muted-foreground" />
            </button>
            {notifications > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-500 text-white text-[9px] font-bold flex items-center justify-center">
                {notifications}
              </span>
            )}
          </div>
        </header>

        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex-1 p-4 sm:p-6 lg:p-8 z-10 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav — show only first 5 items */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full border-t bg-card/80 backdrop-blur-xl z-50 px-1 py-2 flex justify-around items-center">
        {navLinks.slice(0, 5).map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 p-2 rounded-xl min-w-[3.5rem] transition-all ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`p-1.5 rounded-full transition-colors ${isActive ? "bg-primary/10" : ""}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[9px] font-medium ${isActive ? "font-bold" : ""}`}>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
