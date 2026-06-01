"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  inviteOrgMemberAction,
  updateMemberRoleAction,
  type OrgMemberResult,
} from "@/actions/platform-org-actions";

const ROLES = [
  { value: "ADMIN", label: "مدير" },
  { value: "OPERATOR", label: "مشغّل" },
  { value: "VIEWER", label: "عارض" },
] as const;

interface OrganizationMembersSectionProps {
  organizationId: string;
  initialMembers: OrgMemberResult[];
  canManage: boolean;
}

export function OrganizationMembersSection({
  organizationId,
  initialMembers,
  canManage,
}: OrganizationMembersSectionProps) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [error, setError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState({
    email: "",
    name: "",
    role: "OPERATOR",
  });
  const [pending, startTransition] = useTransition();

  function handleRoleChange(memberId: string, role: string) {
    setError(null);
    startTransition(async () => {
      const result = await updateMemberRoleAction(
        organizationId,
        memberId,
        role,
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? result.data : m)),
      );
      router.refresh();
    });
  }

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await inviteOrgMemberAction(organizationId, invite);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMembers((prev) => [...prev, result.data].sort((a, b) =>
        (a.name ?? "").localeCompare(b.name ?? "", "ar"),
      ));
      setInvite({ email: "", name: "", role: "OPERATOR" });
      setInviteOpen(false);
      router.refresh();
    });
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">الأعضاء</h2>
        {canManage && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setInviteOpen((v) => !v)}
          >
            {inviteOpen ? "إلغاء" : "دعوة عضو"}
          </Button>
        )}
      </div>

      {canManage && inviteOpen && (
        <Card className="p-4 mb-4 space-y-3">
          <form onSubmit={handleInvite} className="space-y-3">
            <div>
              <Label htmlFor="member-email">البريد الإلكتروني</Label>
              <Input
                id="member-email"
                type="email"
                value={invite.email}
                onChange={(e) =>
                  setInvite((p) => ({ ...p, email: e.target.value }))
                }
                required
                disabled={pending}
              />
            </div>
            <div>
              <Label htmlFor="member-name">الاسم</Label>
              <Input
                id="member-name"
                value={invite.name}
                onChange={(e) =>
                  setInvite((p) => ({ ...p, name: e.target.value }))
                }
                required
                disabled={pending}
              />
            </div>
            <div>
              <Label htmlFor="member-role">الدور</Label>
              <Select
                value={invite.role}
                onValueChange={(role) =>
                  setInvite((p) => ({ ...p, role }))
                }
                disabled={pending}
              >
                <SelectTrigger id="member-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? "جارٍ الإرسال..." : "إرسال الدعوة"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground">
            يُنشئ حساباً جديداً بكلمة مرور مؤقتة — يجب على المسؤول تزويد العضو
            ببيانات الدخول بشكل آمن
          </p>
        </Card>
      )}

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {members.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          لا يوجد أعضاء في هذه المؤسسة
        </p>
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <Card
              key={member.id}
              className="p-3 flex items-center justify-between gap-4"
            >
              <div>
                <div className="font-medium">{member.name}</div>
                <div className="text-sm text-muted-foreground">
                  {member.email}
                </div>
              </div>
              {canManage ? (
                <Select
                  value={member.role}
                  onValueChange={(role) => handleRoleChange(member.id, role)}
                  disabled={pending}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-xs border rounded px-2 py-1">
                  {member.role}
                </span>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
