"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BarChart3, Users, Package, LogOut, Shield, ChevronRight, Menu, X } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/packages", label: "Packages", icon: Package },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, logout, isHydrated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isHydrated) return;
    if (!token || !user) router.replace("/login");
    else if (user.role !== "ADMIN") router.replace("/dashboard");
  }, [isHydrated, token, user, router]);

  if (!user || user.role !== "ADMIN") return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
    </div>
  );

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="h-8 w-8 bg-blue-400/20 rounded-lg flex items-center justify-center">
          <Shield className="h-4 w-4 text-blue-300" />
        </div>
        <div>
          <p className="font-bold text-sm">FileVault</p>
          <p className="text-xs text-slate-400">Admin Panel</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}>
                <Icon className="h-4 w-4 shrink-0" />
                {label}
                {active && <ChevronRight className="h-3 w-3 ml-auto" />}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-blue-400/20 flex items-center justify-center text-xs font-bold text-blue-300 shrink-0">
            {user.name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">Administrator</p>
          </div>
        </div>
        <Button variant="ghost" size="sm"
          className="w-full justify-start gap-2 text-slate-400 hover:text-white hover:bg-white/5"
          onClick={() => { logout(); router.push("/login"); }}>
          <LogOut className="h-4 w-4" />Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-gray-900 shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-gray-900 flex flex-col shadow-xl">
            <button className="absolute top-4 right-4 p-1 rounded text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </button>
            <Sidebar />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-accent">
            <Menu className="h-5 w-5" />
          </button>
          <Shield className="h-5 w-5 text-primary" />
          <span className="font-bold">Admin Panel</span>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
