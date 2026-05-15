"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { UserPlus, Shield, UserX, Loader2, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { getAuditUsersAdminAction, createAuditUserAction, updateAuditUserRoleAction, deactivateAuditUserAction } from "@/actions/audit-admin-actions"
import type { AuditUserResult } from "@/actions/audit-admin-actions"

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-700", operator: "bg-blue-100 text-blue-700",
  reviewer: "bg-purple-100 text-purple-700", partner: "bg-emerald-100 text-emerald-700",
  viewer: "bg-gray-100 text-gray-700",
}

export default function AdminUsersPage() {
  const t = useTranslations("audit.admin")
  const [users, setUsers] = useState<AuditUserResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newUser, setNewUser] = useState({ email: "", name: "", role: "operator" })
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const loadUsers = async () => {
    try {
      const result = await getAuditUsersAdminAction()
      setUsers(result)
      setError(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t("loadError"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getAuditUsersAdminAction()
      .then(result => { setUsers(result); setError(null) })
      .catch(e => { setError(e instanceof Error ? e.message : t("loadError")) })
      .finally(() => { setLoading(false) })
  }, [t])

  const handleCreate = async () => {
    if (!newUser.email.trim() || !newUser.name.trim()) return
    setSubmitting(true)
    setActionError(null)
    try {
      await createAuditUserAction(newUser)
      setShowCreate(false)
      setNewUser({ email: "", name: "", role: "operator" })
      loadUsers()
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : t("createError"))
    } finally {
      setSubmitting(false)
    }
  }

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateAuditUserRoleAction(userId, role)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : t("roleUpdateError"))
    }
  }

  const handleDeactivate = async (userId: string) => {
    try {
      await deactivateAuditUserAction(userId)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: "inactive" } : u))
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : t("deactivateError"))
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><UserPlus className="size-4 me-1" />{t("provisionUser")}</Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle className="size-4 shrink-0" />{error}
        </div>
      )}

      <Card>
        <CardHeader className="border-b px-4 py-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Shield className="size-4" />
            {t("usersCount", { count: users.length })}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {users.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">{t("noUsers")}</div>
            ) : users.map(u => (
              <div key={u.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{u.name}</span>
                    <Badge variant="outline" className={`text-[10px] ${roleColors[u.role] ?? ""}`}>{u.role}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${u.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{u.status === "active" ? t("active") : t("inactive")}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                  {u.lastLoginAt && <p className="text-[10px] text-muted-foreground">{t("lastLogin")} {new Date(u.lastLoginAt).toLocaleDateString()}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select value={u.role} onValueChange={(v) => { if (v !== null) handleRoleChange(u.id, v) }} disabled={u.status !== "active"}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">{t("role_admin")}</SelectItem>
                      <SelectItem value="operator">{t("role_operator")}</SelectItem>
                      <SelectItem value="reviewer">{t("role_reviewer")}</SelectItem>
                      <SelectItem value="partner">{t("role_partner")}</SelectItem>
                      <SelectItem value="viewer">{t("role_viewer")}</SelectItem>
                    </SelectContent>
                  </Select>
                  {u.status === "active" && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDeactivate(u.id)} title={t("deactivate")}>
                      <UserX className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={(o) => { if (!o) { setShowCreate(false); setActionError(null) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{t("dialogTitle")}</DialogTitle><DialogDescription>{t("dialogDescription")}</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label>{t("email")}</Label><Input value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder={t("emailPlaceholder")} /></div>
            <div><Label>{t("name")}</Label><Input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder={t("namePlaceholder")} /></div>
            <div><Label>{t("role")}</Label>
              <Select value={newUser.role} onValueChange={(v) => { if (v !== null) setNewUser({ ...newUser, role: v }) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t("role_admin")}</SelectItem>
                  <SelectItem value="operator">{t("role_operator")}</SelectItem>
                  <SelectItem value="reviewer">{t("role_reviewer")}</SelectItem>
                  <SelectItem value="partner">{t("role_partner")}</SelectItem>
                  <SelectItem value="viewer">{t("role_viewer")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {actionError && <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700"><AlertTriangle className="size-3 shrink-0" />{actionError}</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); setActionError(null) }}>{t("cancel")}</Button>
            <Button disabled={!newUser.email.trim() || !newUser.name.trim() || submitting} onClick={handleCreate}>{submitting ? t("creating") : t("createUser")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
