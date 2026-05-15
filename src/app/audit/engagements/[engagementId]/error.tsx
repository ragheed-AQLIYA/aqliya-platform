"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { AuditErrorCard } from "@/components/audit/error/audit-error-card"

export default function EngagementError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[Engagement Error Boundary]", error)
  }, [error])

  const router = useRouter()
  const params = useParams()
  const engagementId = params?.engagementId as string | undefined

  return (
    <AuditErrorCard
      title="Engagement Error"
      message="Something went wrong loading this engagement. The workflow data could not be loaded safely. No audit data has been deleted."
      onRetry={reset}
      onBack={() => router.push(engagementId ? `/audit/engagements/${engagementId}` : "/audit")}
      variant="page"
    />
  )
}
