"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuditErrorCard } from "@/components/audit/error/audit-error-card"

export default function AuditError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[AuditOS Error Boundary]", error)
  }, [error])

  const router = useRouter()

  return (
    <AuditErrorCard
      title="AuditOS Workspace Error"
      message={
        process.env.NODE_ENV === "development"
          ? `${error.message} (reload to retry)`
          : "Something went wrong in this AuditOS workspace. The workflow data could not be loaded safely. No audit data has been deleted."
      }
      onRetry={reset}
      onBack={() => router.push("/audit")}
      variant="page"
    />
  )
}
