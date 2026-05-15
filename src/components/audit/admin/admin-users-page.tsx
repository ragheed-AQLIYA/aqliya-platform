"use client"

import { useEffect, useState, useCallback } from "react"
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
  const [users, setUsers] = useState<AuditUserResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newUser, setNewUser] = useState({ email: "", name: "", role: "operator" })
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    try {
      const result = await getAuditUsersAdminAction()
      setUsers(result)
      setError(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "فشل تحميل المستخدمين")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

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
      setActionError(e instanceof Error ? e.message : "فشل إنشاء المستخدم")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateAuditUserRoleAction(userId, role)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "فشل تحديث الدور")
    }
  }

  const handleDeactivate = async (userId: string) => {
    try {
      await deactivateAuditUserAction(userId)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: "inactive" } : u))
    } catch (e: unknown) {
      setActionError(e instanceof Error ? e.message : "فشل إلغاء تنشيط المستخدم")
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">الإدارة — مستخدمو التدقيق</h1>
          <p className="text-sm text-muted-foreground">إدارة مستخدمي التدقيق في مؤسستك</p>
        </div>
        <Button onClick={() => setShowCreate(true)}><UserPlus className="size-4 ml-1" />إضافة مستخدم</Button>
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
            مستخدمو التدقيق ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {users.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">لم يتم العثور على مستخدمي تدقيق.</div>
            ) : users.map(u => (
              <div key={u.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{u.name}</span>
                    <Badge variant="outline" className={`text-[10px] ${roleColors[u.role] ?? ""}`}>{u.role}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${u.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{u.status === "active" ? "نشط" : "غير نشط"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                  {u.lastLoginAt && <p className="text-[10px] text-muted-foreground">آخر تسجيل دخول: {new Date(u.lastLoginAt).toLocaleDateString()}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Select value={u.role} onValueChange={(v) => { if (v !== null) handleRoleChange(u.id, v) }} disabled={u.status !== "active"}>
                    <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">مدير</SelectItem>
                      <SelectItem value="operator">مشغل</SelectItem>
                      <SelectItem value="reviewer">مراجع</SelectItem>
                      <SelectItem value="partner">شريك</SelectItem>
                      <SelectItem value="viewer">مشاهد</SelectItem>
                    </SelectContent>
                  </Select>
                  {u.status === "active" && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDeactivate(u.id)} title="إلغاء التنشيط">
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
          <DialogHeader><DialogTitle>إضافة مستخدم تدقيق</DialogTitle><DialogDescription>إنشاء مستخدم تدقيق جديد في مؤسستك.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label>البريد الإلكتروني *</Label><Input value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="user@example.com" /></div>
            <div><Label>الاسم *</Label><Input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="الاسم الكامل" /></div>
            <div><Label>الدور</Label>
              <Select value={newUser.role} onValueChange={(v) => { if (v !== null) setNewUser({ ...newUser, role: v }) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">مدير</SelectItem>
                  <SelectItem value="operator">مشغل</SelectItem>
                  <SelectItem value="reviewer">مراجع</SelectItem>
                  <SelectItem value="partner">شريك</SelectItem>
                  <SelectItem value="viewer">مشاهد</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {actionError && <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700"><AlertTriangle className="size-3 shrink-0" />{actionError}</div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); setActionError(null) }}>إلغاء</Button>
            <Button disabled={!newUser.email.trim() || !newUser.name.trim() || submitting} onClick={handleCreate}>{submitting ? "جارٍ الإنشاء..." : "إنشاء مستخدم"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
