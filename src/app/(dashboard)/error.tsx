"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldBan } from "lucide-react"
import Link from "next/link"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  // Check if this is an expected auth denial
  const isAuthError =
    error?.message?.startsWith("Access denied:") ||
    error?.message?.startsWith("Decision not found") ||
    error?.message?.startsWith("Organization not found")

  // In development, show raw error for unexpected errors
  if (process.env.NODE_ENV === "development" && !isAuthError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <div className="max-w-lg text-left">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
          <pre className="rounded bg-muted p-4 text-sm overflow-auto">
            {error?.message}
            {"\n\n"}
            {error?.stack}
          </pre>
          <Button onClick={reset} className="mt-4">Try again</Button>
        </div>
      </main>
    )
  }

  if (isAuthError) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ShieldBan className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {error?.message}
            </p>
            <div className="flex gap-2 justify-center">
              <Link href="/">
                <Button>Go Home</Button>
              </Link>
              <Button variant="outline" onClick={reset}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold text-destructive">Something went wrong</h1>
      <Button onClick={reset}>Try again</Button>
    </main>
  )
}
