"use client";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { User, Mail, Calendar, ShieldCheck, ShieldAlert } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuthStore();
  if (!user) return null;

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Profile</h1>

      <div className="bg-white border rounded-2xl overflow-hidden">
        {/* Avatar header */}
        <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-6">
            <div className="h-20 w-20 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-2xl font-bold text-primary">
              {initials}
            </div>
            <div className="mb-2">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground text-sm">{user.role}</p>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              { icon: User, label: "Full Name", value: user.name },
              { icon: Mail, label: "Email Address", value: user.email },
              { icon: Calendar, label: "Member Since", value: user.createdAt ? formatDate(user.createdAt) : "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                  <p className="font-medium text-sm">{value}</p>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                {user.isEmailVerified
                  ? <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  : <ShieldAlert className="h-4 w-4 text-amber-600" />}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Email Verification</p>
                <Badge variant={user.isEmailVerified ? "success" : "warning"}>
                  {user.isEmailVerified ? "Verified" : "Not Verified"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
