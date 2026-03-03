"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { SubscriptionPackage } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Check, Package, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TIER_COLORS } from "@/lib/utils";

const FILE_TYPES = ["IMAGE", "VIDEO", "PDF", "AUDIO"] as const;
const TIERS = ["FREE", "SILVER", "GOLD", "DIAMOND"] as const;

const schema = z.object({
  name: z.string().min(1),
  tier: z.enum(TIERS),
  maxFolders: z.number().int().positive(),
  maxNestingLevel: z.number().int().positive(),
  allowedFileTypes: z
    .array(z.enum(FILE_TYPES))
    .min(1, "Select at least one type"),
  maxFileSizeMB: z.number().positive(),
  totalFileLimit: z.number().int().positive(),
  filesPerFolder: z.number().int().positive(),
});
type FormData = z.infer<typeof schema>;

const TIER_EMOJI: Record<string, string> = {
  FREE: "🆓",
  SILVER: "🥈",
  GOLD: "🥇",
  DIAMOND: "💎",
};

const fields = [
  { name: "maxFolders" as const, label: "Max Folders" },
  { name: "maxNestingLevel" as const, label: "Max Nesting Level" },
  { name: "maxFileSizeMB" as const, label: "Max File Size (MB)" },
  { name: "totalFileLimit" as const, label: "Total File Limit" },
  { name: "filesPerFolder" as const, label: "Files Per Folder" },
];

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SubscriptionPackage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { allowedFileTypes: [], tier: "FREE" },
  });

  

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/subscriptions/packages");
      setPackages(response.data);
    } catch (error) {
      setError("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPackages();
  }, []);

  const openCreate = () => {
    setEditing(null);
    reset({
      allowedFileTypes: [],
      maxFolders: 10,
      maxNestingLevel: 3,
      maxFileSizeMB: 10,
      totalFileLimit: 50,
      filesPerFolder: 10,
      tier: "FREE",
    });
    setDialogOpen(true);
  };

  const openEdit = (pkg: SubscriptionPackage) => {
    setEditing(pkg);
    reset({
      name: pkg.name,
      tier: pkg.tier,
      maxFolders: pkg.maxFolders,
      maxNestingLevel: pkg.maxNestingLevel,
      allowedFileTypes: pkg.allowedFileTypes as any,
      maxFileSizeMB: pkg.maxFileSizeMB,
      totalFileLimit: pkg.totalFileLimit,
      filesPerFolder: pkg.filesPerFolder,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (editing) await api.put(`/admin/packages/${editing.id}`, data);
      else await api.post("/admin/packages", data);
      toast({ title: editing ? "Package updated" : "Package created" });
      setDialogOpen(false);
      fetchPackages();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this package?")) return;
    try {
      await api.delete(`/admin/packages/${id}`);
      toast({ title: "Package deactivated" });
      fetchPackages();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.response?.data?.message,
      });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Subscription Packages
          </h1>
          <p className="text-muted-foreground mt-1">
            Define storage tiers and access rules
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Package
        </Button>
      </div>
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-destructive font-medium mb-2">
            Failed to load packages
          </p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchPackages}>Retry</Button>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-5 border-b bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{TIER_EMOJI[pkg.tier]}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(pkg)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:bg-destructive/5"
                      onClick={() => handleDelete(pkg.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <h3 className="font-semibold text-base">{pkg.name}</h3>
                <span
                  className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${TIER_COLORS[pkg.tier]}`}
                >
                  {pkg.tier}
                </span>
              </div>
              <div className="p-5 space-y-2.5 text-sm">
                {[
                  { label: "Max Folders", value: pkg.maxFolders },
                  { label: "Nesting Level", value: pkg.maxNestingLevel },
                  { label: "File Size", value: `${pkg.maxFileSizeMB} MB` },
                  { label: "Total Files", value: pkg.totalFileLimit },
                  { label: "Files/Folder", value: pkg.filesPerFolder },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
                <div className="pt-2 border-t flex flex-wrap gap-1">
                  {pkg.allowedFileTypes.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Add card */}
          <button
            onClick={openCreate}
            className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all duration-150"
          >
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
              <Plus className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium">Add Package</p>
          </button>
        </div>
      )}

      {/* Form dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <DialogTitle>
                {editing ? "Edit Package" : "Create Package"}
              </DialogTitle>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input {...register("name")} placeholder="e.g. Silver" />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Tier</Label>
                <select
                  {...register("tier")}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  {TIERS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {fields.map(({ name, label }) => (
                <div key={name} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Input
                    type="number"
                    step="any"
                    {...register(name, { valueAsNumber: true })}
                  />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Allowed File Types</Label>
              <Controller
                control={control}
                name="allowedFileTypes"
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2">
                    {FILE_TYPES.map((type) => {
                      const checked = field.value.includes(type);
                      return (
                        <label
                          key={type}
                          className={`flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer transition-colors ${checked ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50"}`}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={checked}
                            onChange={(e) =>
                              field.onChange(
                                e.target.checked
                                  ? [...field.value, type]
                                  : field.value.filter((t) => t !== type),
                              )
                            }
                          />
                          <div
                            className={`h-4 w-4 rounded border flex items-center justify-center ${checked ? "bg-primary border-primary" : "border-input"}`}
                          >
                            {checked && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <span className="text-sm font-medium">{type}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              />
              {errors.allowedFileTypes && (
                <p className="text-xs text-destructive">
                  {errors.allowedFileTypes.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{editing ? "Update" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
