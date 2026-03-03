"use client";
import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";

const schema = z.object({ email: z.string().email("Enter a valid email") });

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try { await api.post("/auth/forgot-password", data); setSent(true); }
    catch { setSent(true); } // Don't reveal if email exists
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Check your email</h2>
              <p className="text-muted-foreground text-sm mb-6">If that email address is in our system, you'll receive a reset link shortly.</p>
              <Link href="/login"><Button variant="outline" className="w-full"><ArrowLeft className="h-4 w-4 mr-2" />Back to Login</Button></Link>
            </div>
          ) : (
            <>
              <Link href="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="h-4 w-4" />Back to login
              </Link>
              <h2 className="text-2xl font-bold mb-1">Forgot password?</h2>
              <p className="text-muted-foreground text-sm mb-6">No worries — we'll send you a reset link.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Email address</Label>
                  <Input type="email" placeholder="you@example.com" {...register("email")} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message as string}</p>}
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</> : "Send Reset Link"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
