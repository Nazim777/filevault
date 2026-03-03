"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { SubscriptionPackage, UserSubscription } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { formatDate, TIER_GRADIENTS, TIER_COLORS } from "@/lib/utils";
import {
  Check,
  Zap,
  Loader2,
  Folder,
  FileText,
  HardDrive,
  Layers,
} from "lucide-react";

const TIER_ICONS: Record<string, string> = {
  FREE: "🆓",
  SILVER: "🥈",
  GOLD: "🥇",
  DIAMOND: "💎",
};

export default function PackagesPage() {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [activeSub, setActiveSub] = useState<UserSubscription | null>(null);
  const [history, setHistory] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true); // ✅ new state

  const fetchData = async () => {
    setFetching(true); // start loader
    try {
      const [pkgs, sub, hist] = await Promise.all([
        api.get("/subscriptions/packages"),
        api.get("/subscriptions/active").catch(() => ({ data: null })),
        api.get("/subscriptions/history").catch(() => ({ data: [] })),
      ]);
      setPackages(pkgs.data);
      setActiveSub(sub.data);
      setHistory(hist.data);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setFetching(false); // stop loader
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectPackage = async (packageId: string) => {
    setLoading(packageId);
    try {
      await api.post("/subscriptions/select", { packageId });
      await fetchData();
      toast({
        title: "Plan updated!",
        description: "Your new plan is now active.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message,
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Subscription Plans
        </h1>
        <p className="text-muted-foreground mt-1">
          Choose a plan that fits your storage needs
        </p>
      </div>

      {/* Plan cards */}
      {fetching ? (
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {packages.map((pkg) => {
            const isActive = activeSub?.package.id === pkg.id;
            const isLoading = loading === pkg.id;

            return (
              <Card
                key={pkg.id}
                className={`relative overflow-hidden transition-all duration-200 ${isActive ? "ring-2 ring-primary shadow-md" : "hover:shadow-md"}`}
              >
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-blue-400" />
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{TIER_ICONS[pkg.tier]}</span>
                    {isActive && (
                      <Badge variant="default" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <div
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border w-fit ${TIER_COLORS[pkg.tier]}`}
                  >
                    {pkg.tier}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2.5">
                    {[
                      { icon: Folder, label: `${pkg.maxFolders} folders` },
                      {
                        icon: Layers,
                        label: `${pkg.maxNestingLevel} nesting levels`,
                      },
                      {
                        icon: HardDrive,
                        label: `${pkg.maxFileSizeMB} MB max file size`,
                      },
                      {
                        icon: FileText,
                        label: `${pkg.totalFileLimit} total files`,
                      },
                      {
                        icon: FileText,
                        label: `${pkg.filesPerFolder} files/folder`,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="text-muted-foreground">
                          {item.label}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        {pkg.allowedFileTypes.join(", ").toLowerCase()}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant={isActive ? "secondary" : "default"}
                    disabled={isActive || !!isLoading}
                    onClick={() => selectPackage(pkg.id)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Switching…
                      </>
                    ) : isActive ? (
                      "Active Plan"
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Select Plan
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Subscription History</h2>
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  {["Plan", "Tier", "Started", "Ended", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.map((sub) => (
                  <tr
                    key={sub.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium">
                      {sub.package.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${TIER_COLORS[sub.package.tier]}`}
                      >
                        {sub.package.tier}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {formatDate(sub.startDate, true)}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {sub.endDate ? formatDate(sub.endDate, true) : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={sub.isActive ? "success" : "secondary"}>
                        {sub.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
