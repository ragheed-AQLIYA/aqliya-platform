"use client"

import { useState } from "react"
import { updateUserRole } from "@/actions/admin-actions"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "مدير",
  OPERATOR: "مشغل",
  VIEWER: "مشاهد",
}

interface RoleSelectorProps {
  userId: string
  currentRole: string
  organizationId: string
}

export function RoleSelector({ userId, currentRole, organizationId }: RoleSelectorProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState(currentRole)

  async function handleRoleChange(newRole: string) {
    setSaving(true)
    setError(null)
    setRole(newRole)
    try {
      const result = await updateUserRole(userId, newRole, organizationId)
      setRole(result.newRole)
    } catch (e) {
      setRole(currentRole)
      setError(e instanceof Error ? e.message : "فشل تحديث الصلاحية")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={role} onValueChange={handleRoleChange} disabled={saving}>
        <SelectTrigger className="w-32" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(ROLE_LABELS).map(([roleVal, label]) => (
            <SelectItem key={roleVal} value={roleVal}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
