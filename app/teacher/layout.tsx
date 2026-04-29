"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Home, Users, Settings, ZapIcon, AwardIcon, ClipboardListIcon, GroupIcon, UserCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUser } from "@/lib/hooks/useUser";
import { toast } from "sonner";

export default function TeacherLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useUser();

  const handleSignOut = async () => {
    await signOut(auth);
    toast.success("로그아웃됐어요.");
    router.push("/login");
  };

  const navLinks = [
    { href: "/teacher/dashboard", label: "대시보드 홈", icon: Home },
    { href: "/teacher/approvals", label: "컨펌 큐", icon: ZapIcon, badge: 9 },
    { href: "/teacher/students", label: "학생 명단", icon: Users },
    { href: "/teacher/groups", label: "조 관리", icon: GroupIcon },
    { href: "/teacher/evaluations", label: "평가", icon: ClipboardListIcon },
    { href: "/teacher/awards", label: "상장 발행", icon: AwardIcon },
    { href: "/teacher/settings", label: "학급 설정", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 border-r bg-card/50 backdrop-blur-md flex flex-col hidden md:flex z-10 sticky top-0 h-screen">
        <div className="p-6 border-b">
          <Link href="/teacher/dashboard" className="flex items-center gap-2 font-display font-bold text-foreground text-xl">
            <span>📰</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Newsfolio
            </span>
          </Link>
          <div className="mt-2 text-xs font-medium text-muted-foreground px-1">교사 대시보드</div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navLinks.map(link => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all",
                  (pathname === link.href || pathname.startsWith(link.href + "/"))
                    ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1">{link.label}</span>
                {(link as any).badge && (link as any).badge > 0 && (
                  <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">{(link as any).badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t space-y-1">
          {user && (
            <div className="flex items-center gap-2 px-3 py-2 mb-1">
              <UserCircleIcon className="w-7 h-7 text-purple-400 flex-shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-xs text-foreground truncate">{user.displayName}</div>
                <div className="text-[10px] text-muted-foreground">교사</div>
              </div>
            </div>
          )}
          <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/5">
            <LogOut className="w-4 h-4" />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
        <header className="md:hidden flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-md sticky top-0 z-20">
          <span className="font-bold">Newsfolio 교사</span>
          <Link href="/teacher/approvals" className="relative">
            <ZapIcon className="w-6 h-6 text-yellow-400" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">9</span>
          </Link>
        </header>

        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex-1 p-4 md:p-6 lg:p-8 z-10 w-full max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
