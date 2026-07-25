"use client";

import { User, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import type { Membership } from "./use-membership-manager";

const roleLabels: Record<string, string> = {
  PlatformAdmin: "مدير منصة",
  Operator: "مشغل",
  Reviewer: "مراجع",
};

export function MemberRow({
  membership,
  onRoleChange,
  onToggleStatus,
}: {
  membership: Membership;
  onRoleChange: (membershipId: string, newRole: string) => void;
  onToggleStatus: (membership: Membership) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-3">
      <div className="flex items-center gap-3 min-w-0">
        <User className="h-5 w-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">
              {membership.userId.slice(0, 12)}...
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${membership.status === "Active" ? "bg-status-success/10 text-status-success" : "bg-muted text-muted-foreground"}`}
            >
              {membership.status === "Active" ? "نشط" : "موقوف"}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <ShieldCheck className="h-3 w-3 text-muted-foreground" />
            <select
              value={membership.role}
              onChange={(e) => onRoleChange(membership.id, e.target.value)}
              className="text-[10px] bg-transparent border-0 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <button
        onClick={() => onToggleStatus(membership)}
        className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
        title={membership.status === "Active" ? "إيقاف" : "تفعيل"}
      >
        {membership.status === "Active" ? (
          <XCircle className="h-4 w-4" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
