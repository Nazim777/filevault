"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function HomePage() {
  const router = useRouter();
  const { user, token, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!token || !user) router.replace("/login");
    else if (user.role === "ADMIN") router.replace("/admin");
    else router.replace("/dashboard");
  }, [isHydrated, user, token, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse">
          <span className="text-xl">📁</span>
        </div>
        <p className="text-sm text-muted-foreground">Loading FileVault…</p>
      </div>
    </div>
  );
}
