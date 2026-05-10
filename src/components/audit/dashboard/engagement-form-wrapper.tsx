"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EngagementForm } from "@/components/audit/engagement/engagement-form"
import type { AuditUser } from "@/types/audit"

interface EngagementFormWrapperProps {
  users?: AuditUser[]
}

export function EngagementFormWrapper({ users = [] }: EngagementFormWrapperProps) {
  const [showCreate, setShowCreate] = useState(false)
  const router = useRouter()

  const handleCreated = useCallback(() => {
    router.refresh()
  }, [router])

  return (
    <>
      <Button onClick={() => setShowCreate(true)}>
        <Plus className="size-4 mr-1" />New Engagement
      </Button>
      <EngagementForm open={showCreate} onClose={() => setShowCreate(false)} onCreated={handleCreated} users={users} organizationId="org-aqliya" />
    </>
  )
}
