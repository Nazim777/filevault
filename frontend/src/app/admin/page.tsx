"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { TIER_COLORS, TIER_GRADIENTS } from "@/lib/utils";
import { Users, FolderOpen, FileText, Package, TrendingUp } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalFiles: number;
  totalFolders: number;
  packages: Array<{ id: string; name: string; tier: string; _count: { subscriptions: number } }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data)).catch(console.error);
  }, []);

  const cards = stats ? [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-blue-50 text-blue-600", change: "registered" },
    { label: "Total Files", value: stats.totalFiles, icon: FileText, color: "bg-purple-50 text-purple-600", change: "uploaded" },
    { label: "Total Folders", value: stats.totalFolders, icon: FolderOpen, color: "bg-amber-50 text-amber-600", change: "created" },
    { label: "Active Plans", value: stats.packages.length, icon: Package, color: "bg-emerald-50 text-emerald-600", change: "tiers" },
  ] : [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your FileVault platform</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats === null ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border rounded-xl p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-24 mb-3" />
              <div className="h-8 bg-muted rounded w-16" />
            </div>
          ))
        ) : (
          cards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white border rounded-xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground font-medium">{label}</p>
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-3xl font-bold">{value.toLocaleString()}</p>
            </div>
          ))
        )}
      </div>

      {/* Package breakdown */}
      <div className="bg-white border rounded-xl overflow-hidden">
  <div className="px-6 py-4 border-b flex items-center gap-2">
    <TrendingUp className="h-5 w-5 text-muted-foreground" />
    <h2 className="font-semibold">Subscriptions by Plan</h2>
  </div>

  {stats ? (
    <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0">
      {stats.packages.map((pkg) => (
        <div key={pkg.id} className="p-6 text-center">
          <div className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border mb-3 ${TIER_COLORS[pkg.tier]}`}>
            {pkg.tier}
          </div>
          <p className="text-3xl font-bold mb-1">{pkg._count.subscriptions}</p>
          <p className="text-sm text-muted-foreground">{pkg.name} users</p>
        </div>
      ))}
    </div>
  ) : (
    <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 text-center animate-pulse">
          <div className="h-4 w-12 bg-muted rounded mx-auto mb-2" />
          <div className="h-8 w-16 bg-muted rounded mx-auto mb-1" />
          <div className="h-3 w-20 bg-muted rounded mx-auto" />
        </div>
      ))}
    </div>
  )}
</div>
    </div>
  );
}
