"use client";

import { useState, useEffect } from "react";
import {
  sunbul_listMemberships,
  sunbul_addMembershipByEmail,
  sunbul_updateMembershipRole,
  sunbul_updateMembershipStatus,
  sunbul_getClient,
} from "@/actions/sunbul-actions";
import {
  Loader2,
  UserPlus,
  User,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface Membership {
  id: string;
  userId: string;
  role: string;
  status: string;
  createdAt: Date;
}

export function SunbulMembershipManager({
  clientId,
}: {
  clientId: string | null;
}) {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [clientName, setClientName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Operator");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;
    Promise.all([
      sunbul_listMemberships(clientId),
      sunbul_getClient(clientId),
    ]).then(([membershipsRes, clientRes]) => {
      if (membershipsRes.success && membershipsRes.data) {
        setMemberships(membershipsRes.data as Membership[]);
      } else if (membershipsRes.error) {
        setLoadError(membershipsRes.error);
      }
      if (clientRes.success && clientRes.data) {
        setClientName((clientRes.data as { name: string }).name);
      }
      setLoading(false);
    });
  }, [clientId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setAdding(true);
    setError(null);
    const r = await sunbul_addMembershipByEmail({
      clientId: clientId!,
      email: email.trim(),
      role,
    });
    setAdding(false);
    if (r.success) {
      setEmail("");
      setShowAdd(false);
      // Reload memberships
      const m = await sunbul_listMemberships(clientId!);
      if (m.success && m.data) setMemberships(m.data as Membership[]);
    } else {
      setError(r.error ?? "فشل إضافة العضو");
    }
  }

  async function handleRoleChange(membershipId: string, newRole: string) {
    await sunbul_updateMembershipRole(membershipId, newRole);
    const m = await sunbul_listMemberships(clientId!);
    if (m.success && m.data) setMemberships(m.data as Membership[]);
  }

  async function handleToggleStatus(membership: Membership) {
    const newStatus = membership.status === "Active" ? "Suspended" : "Active";
    await sunbul_updateMembershipStatus(membership.id, newStatus);
    const m = await sunbul_listMemberships(clientId!);
    if (m.success && m.data) setMemberships(m.data as Membership[]);
  }

  if (!clientId) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
        اختر عميلاً لعرض العضويات
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center text-sm text-status-error">
        {loadError}
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    PlatformAdmin: "مدير منصة",
    Operator: "مشغل",
    Reviewer: "مراجع",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">العضويات</h2>
          <p className="text-[10px] text-muted-foreground">{clientName}</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
        >
          <UserPlus className="h-3.5 w-3.5" />
          إضافة عضو
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="rounded-lg border bg-card p-4 space-y-3"
        >
          <div>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1">
              البريد الإلكتروني *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full rounded-md border bg-background px-2 py-1.5 text-xs"
              required
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-muted-foreground mb-1">
              الدور
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-md border bg-background px-2 py-1.5 text-xs"
            >
              <option value="Operator">مشغل</option>
              <option value="Reviewer">مراجع</option>
              <option value="PlatformAdmin">مدير منصة</option>
            </select>
          </div>
          {error && (
            <div className="rounded-md bg-status-error/10 p-2 text-[10px] text-status-error">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="text-[10px] text-muted-foreground hover:text-foreground"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={adding || !email.trim()}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {adding ? "جاري..." : "إضافة"}
            </button>
          </div>
        </form>
      )}

      {memberships.length === 0 ? (
        <div className="rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground">
          لا يوجد أعضاء بعد
        </div>
      ) : (
        <div className="space-y-2">
          {memberships.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-lg border bg-card p-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <User className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">
                      {m.userId.slice(0, 12)}...
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${m.status === "Active" ? "bg-status-success/10 text-status-success" : "bg-muted text-muted-foreground"}`}
                    >
                      {m.status === "Active" ? "نشط" : "موقوف"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <ShieldCheck className="h-3 w-3 text-muted-foreground" />
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.id, e.target.value)}
                      className="text-[10px] bg-transparent border-0 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      <option value="Operator">مشغل</option>
                      <option value="Reviewer">مراجع</option>
                      <option value="PlatformAdmin">مدير منصة</option>
                    </select>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggleStatus(m)}
                className="shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                title={m.status === "Active" ? "إيقاف" : "تفعيل"}
              >
                {m.status === "Active" ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
