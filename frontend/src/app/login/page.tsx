"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, FolderOpen } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      const user = useAuthStore.getState().user;
      router.push(user?.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Login failed", description: err.response?.data?.message || "Invalid credentials" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 text-white">
        <div className="flex items-center gap-2 mb-auto">
          <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
            <FolderOpen className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg">FileVault</span>
        </div>
        <div className="mb-auto">
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Your files, organized & secure
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed">
            Upload, manage, and share your files with subscription-based storage plans designed for everyone.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { label: "Storage Plans", value: "4 Tiers" },
              { label: "File Types", value: "4 Formats" },
              { label: "Max Storage", value: "500 MB/file" },
              { label: "Folders", value: "Unlimited*" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-4">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-blue-200 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-lg">FileVault</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-muted-foreground mt-1">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register("email")} className={errors.email ? "border-destructive" : ""} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Input id="password" type={showPw ? "text" : "password"} placeholder="••••••••" {...register("password")} className={errors.password ? "border-destructive pr-10" : "pr-10"} />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in…</> : "Sign In"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary font-medium hover:underline">Create one</Link>
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Admin login: admin@filevault.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
