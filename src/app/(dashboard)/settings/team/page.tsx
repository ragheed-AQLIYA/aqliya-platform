"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserPlus, Mail, Clock, Shield, Copy, Check } from "lucide-react"
import type { TeamMember, PendingInvitation } from "@/actions/registration-actions"

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "مدير",
  OPERATOR: "مشغّل",
  VIEWER: "مشاهد",
}

const ROLE_BADGE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  OPERATOR: "secondary",
  VIEWER: "outline",
}

export default function TeamSettingsPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [pendingInvites, setPendingInvites] = useState<PendingInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("OPERATOR")
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState("")
  const [inviteResult, setInviteResult] = useState("")
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    try {
      const { listTeamMembersAction, listPendingInvitationsAction } = await import(
        "@/actions/registration-actions"
      )
      const [m, p] = await Promise.all([
        listTeamMembersAction(),
        listPendingInvitationsAction(),
      ])
      setMembers(m)
      setPendingInvites(p)
    } catch {
      setError("فشل تحميل بيانات الفريق")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    setError("")
    setInviteResult("")

    try {
      const { inviteTeamMemberAction } = await import(
        "@/actions/registration-actions"
      )
      const result = await inviteTeamMemberAction({
        email: inviteEmail,
        role: inviteRole,
      })
      setInviteResult(`تم إرسال الدعوة إلى ${result.email}`)
      setInviteEmail("")
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إرسال الدعوة")
    } finally {
      setInviting(false)
    }
  }

  function formatDate(dateStr: string): string {
    try {
      return new Intl.DateTimeFormat("ar-SA", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(dateStr))
    } catch {
      return dateStr
    }
  }

  function copyToClipboard(text: string, index: number) {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]" dir="rtl">
        <p className="text-muted-foreground">جارٍ تحميل بيانات الفريق...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            أعضاء الفريق
          </CardTitle>
          <CardDescription>
            قائمة بأعضاء المنشأة الحاليين وصلاحياتهم.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              لا يوجد أعضاء بعد
            </p>
          ) : (
            <div className="divide-y">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={ROLE_BADGE_VARIANTS[member.role] ?? "outline"}
                    >
                      {ROLE_LABELS[member.role] ?? member.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {formatDate(member.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            دعوة عضو جديد
          </CardTitle>
          <CardDescription>
            أرسل دعوة للانضمام إلى المنشأة. سيتمكن المدعو من إنشاء حسابه عبر رابط الدعوة.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="invite-role">الصلاحية</Label>
                <Select
                  value={inviteRole}
                  onValueChange={setInviteRole}
                >
                  <SelectTrigger id="invite-role">
                    <SelectValue placeholder="اختر الصلاحية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">مدير</SelectItem>
                    <SelectItem value="OPERATOR">مشغّل</SelectItem>
                    <SelectItem value="VIEWER">مشاهد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="invite-email">البريد الإلكتروني</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={inviting}
                >
                  {inviting ? "جارٍ الإرسال..." : "إرسال الدعوة"}
                </Button>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {inviteResult && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                {inviteResult}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              الدعوات المعلقة
            </CardTitle>
            <CardDescription>
              الدعوات التي لم يتم قبولها بعد. تنتهي صلاحية الدعوات بعد 7 أيام.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {pendingInvites.map((inv, idx) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm">{inv.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          ROLE_BADGE_VARIANTS[inv.role] ?? "outline"
                        }
                      >
                        {ROLE_LABELS[inv.role] ?? inv.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        تنتهي {formatDate(inv.expiresAt)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `${window.location.origin}/invite/[token]`,
                        idx,
                      )
                    }
                  >
                    {copiedIndex === idx ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
