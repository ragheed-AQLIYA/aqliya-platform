"use client"

import { useState, useEffect } from "react"
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { createEngagementAction } from "@/actions/audit-actions"
import type { Engagement, AuditUser } from "@/types/audit"

interface EngagementFormProps {
  open: boolean
  onClose: () => void
  onCreated?: () => void
  engagement?: Engagement
  users?: AuditUser[]
  organizationId?: string
}

const teamRoles = ["partner", "manager", "reviewer", "operator"] as const

const engagementTypeLabels: Record<string, string> = {
  full_audit: "Full Audit",
  review: "Review",
  agreed_upon_procedures: "Agreed Upon Procedures",
}

export function EngagementForm({ open, onClose, onCreated, engagement, users = [], organizationId }: EngagementFormProps) {
  const [clientName, setClientName] = useState("")
  const [fiscalPeriod, setFiscalPeriod] = useState("")
  const [engagementType, setEngagementType] = useState("full_audit")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (open) {
      if (engagement) {
        setClientName(engagement.client?.name || "")
        setFiscalPeriod(engagement.fiscalPeriod)
        setEngagementType(engagement.engagementType)
        setSelectedUsers(engagement.team.map(m => m.userId))
      } else {
        setClientName("")
        setFiscalPeriod("")
        setEngagementType("full_audit")
        setSelectedUsers([])
      }
    }
  }, [open, engagement])

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    setSuccess(false)
    try {
      await createEngagementAction({
        organizationId: organizationId ?? 'org-aqliya',
        clientName: clientName.trim(),
        fiscalPeriod: fiscalPeriod.trim(),
        engagementType,
        teamMemberIds: selectedUsers,
      })
      setSuccess(true)
      setTimeout(() => { onClose(); onCreated?.() }, 800)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create engagement')
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = clientName.trim() && fiscalPeriod.trim() && selectedUsers.length > 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{engagement ? "Edit Engagement" : "Create Engagement"}</DialogTitle>
          <DialogDescription>
            {engagement ? "Update the audit engagement details." : "Set up a new audit engagement."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="client-name">Client Name</Label>
            <Input
              id="client-name"
              value={clientName}
              onChange={e => setClientName(e.target.value)}
              placeholder="e.g. Gulf Trading Co."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fiscal-period">Fiscal Period</Label>
            <Input
              id="fiscal-period"
              value={fiscalPeriod}
              onChange={e => setFiscalPeriod(e.target.value)}
              placeholder="e.g. FY2025"
            />
          </div>

          <div className="grid gap-2">
            <Label>Engagement Type</Label>
            <Select value={engagementType} onValueChange={(val) => setEngagementType(val || "full_audit")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(engagementTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

            <div className="grid gap-2">
              <Label>Team Members</Label>
              <div className="grid gap-1">
                {teamRoles.map(role => {
                  const roleUsers = users.filter(u => u.role === role)
                  if (roleUsers.length === 0) return null
                  return (
                  <div key={role} className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {role}
                    </div>
                    {roleUsers.map(user => (
                      <label
                        key={user.id}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUser(user.id)}
                          className="size-4 rounded border-gray-300"
                        />
                        {user.name}
                      </label>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertTriangle className="size-4 shrink-0" /><span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            <CheckCircle className="size-4 shrink-0" /><span>Engagement created successfully</span>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || submitting || success}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting ? "Saving..." : success ? "Done" : engagement ? "Update Engagement" : "Create Engagement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
