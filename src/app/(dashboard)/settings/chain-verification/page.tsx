"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Hash,
  FileCheck,
} from "lucide-react"
import {
  verifyAllChainsAction,
  getChainHealthAction,
  verifyAuditRangeAction,
} from "@/actions/platform-chain-actions"

// ─── Types ───

interface ChainHealth {
  healthy: boolean
  totalEntries: number
  lastVerifiedAt: string | null
  coverageStart: string | null
  coverageEnd: string | null
  tamperCount: number
}

interface ChainVerificationDetail {
  entryId: string
  auditLogId: string
  position: number
  valid: boolean
  reason?: string
}

interface ChainVerificationData {
  verified: boolean
  totalEntries: number
  validEntries: number
  tamperedEntries: number
  firstTamperedId?: string
  details: ChainVerificationDetail[]
}

// ─── Status Badge ───

function StatusBadge({ healthy }: { healthy: boolean }) {
  if (healthy) {
    return (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800">
        <CheckCircle2 className="h-3 w-3 ml-1" />
        Healthy
      </Badge>
    )
  }
  return (
    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800">
      <AlertTriangle className="h-3 w-3 ml-1" />
      Tampered
    </Badge>
  )
}

// ─── Page ───

export default function ChainVerificationPage() {
  const [health, setHealth] = useState<ChainHealth | null>(null)
  const [verification, setVerification] = useState<ChainVerificationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rangeDays, setRangeDays] = useState("7")

  // ─── Load health on mount ───

  const loadHealth = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getChainHealthAction()
      if (result.ok && result.data) {
        const h = result.data
        setHealth({
          healthy: h.healthy,
          totalEntries: h.totalEntries,
          lastVerifiedAt: h.lastVerifiedAt?.toISOString() ?? null,
          coverageStart: h.coverageStart?.toISOString() ?? null,
          coverageEnd: h.coverageEnd?.toISOString() ?? null,
          tamperCount: h.tamperCount,
        })
      } else {
        setError(result.error ?? "Failed to load chain health")
      }
    } catch {
      setError("Failed to load chain health")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHealth()
  }, [loadHealth])

  // ─── Verify all chains ───

  const handleVerifyAll = useCallback(async () => {
    setVerifying(true)
    setError(null)
    try {
      const result = await verifyAllChainsAction()
      if (result.ok && result.data) {
        const d = result.data
        setVerification({
          verified: d.verified,
          totalEntries: d.totalEntries,
          validEntries: d.validEntries,
          tamperedEntries: d.tamperedEntries,
          firstTamperedId: d.firstTamperedId,
          details: d.details.map((det: { entryId: string; auditLogId: string; position: number; valid: boolean; reason?: string }) => ({
            entryId: det.entryId,
            auditLogId: det.auditLogId,
            position: det.position,
            valid: det.valid,
            reason: det.reason,
          })),
        })
      } else {
        setError(result.error ?? "Verification failed")
      }
      // Refresh health
      await loadHealth()
    } catch {
      setError("Verification failed")
    } finally {
      setVerifying(false)
    }
  }, [loadHealth])

  // ─── Verify date range ───

  const handleVerifyRange = useCallback(async () => {
    setVerifying(true)
    setError(null)
    try {
      const days = parseInt(rangeDays, 10)
      const toDate = new Date()
      const fromDate = new Date()
      fromDate.setDate(fromDate.getDate() - days)

      const result = await verifyAuditRangeAction(
        fromDate.toISOString(),
        toDate.toISOString(),
      )
      if (result.ok && result.data) {
        const d = result.data
        setVerification({
          verified: d.verified,
          totalEntries: d.totalEntries,
          validEntries: d.validEntries,
          tamperedEntries: d.tamperedEntries,
          firstTamperedId: d.firstTamperedId,
          details: d.details.map((det: { entryId: string; auditLogId: string; position: number; valid: boolean; reason?: string }) => ({
            entryId: det.entryId,
            auditLogId: det.auditLogId,
            position: det.position,
            valid: det.valid,
            reason: det.reason,
          })),
        })
      } else {
        setError(result.error ?? "Range verification failed")
      }
    } catch {
      setError("Range verification failed")
    } finally {
      setVerifying(false)
    }
  }, [rangeDays])

  // ─── Render ───

  return (
    <main className="p-8 max-w-5xl mx-auto" dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Hash className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">سلسلة التجزئة</h1>
        <span className="text-sm text-muted-foreground mr-2">
          Hash Chain Verification
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-8">
        Verify the cryptographic integrity of PlatformAuditLog hash chain entries
        across all products. Any tampered entry indicates potential data compromise.
      </p>

      {/* Error */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="p-4 flex items-center gap-2 text-sm text-red-800 dark:text-red-200">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </CardContent>
        </Card>
      )}

      {/* Health Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Chain Health
          </CardTitle>
          <CardDescription>
            Overall integrity status of the hash chain
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading health status...
            </div>
          ) : health ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-3 rounded-md border text-center">
                <StatusBadge healthy={health.healthy} />
                <p className="text-xs text-muted-foreground mt-1">Status</p>
              </div>
              <div className="p-3 rounded-md border text-center">
                <p className="text-2xl font-bold">{health.totalEntries}</p>
                <p className="text-xs text-muted-foreground">Total Entries</p>
              </div>
              <div className="p-3 rounded-md border text-center">
                <p className={`text-2xl font-bold ${health.tamperCount > 0 ? "text-red-600" : "text-green-600"}`}>
                  {health.tamperCount}
                </p>
                <p className="text-xs text-muted-foreground">Tampered</p>
              </div>
              <div className="p-3 rounded-md border text-center">
                <p className="text-xs font-mono truncate">
                  {health.coverageStart
                    ? new Date(health.coverageStart).toLocaleDateString("en-SA", {
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground">From</p>
              </div>
              <div className="p-3 rounded-md border text-center">
                <p className="text-xs font-mono truncate">
                  {health.coverageEnd
                    ? new Date(health.coverageEnd).toLocaleDateString("en-SA", {
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground">To</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Unable to load chain health.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Verification Actions
          </CardTitle>
          <CardDescription>
            Run integrity checks on the hash chain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Verify All */}
          <div className="flex items-center justify-between p-3 rounded-md border">
            <div>
              <p className="text-sm font-medium">Verify Entire Chain</p>
              <p className="text-xs text-muted-foreground">
                Check every hash chain entry across the system
              </p>
            </div>
            <Button
              onClick={handleVerifyAll}
              disabled={verifying}
              variant="default"
              size="sm"
            >
              {verifying ? (
                <>
                  <Loader2 className="h-3 w-3 ml-1 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <FileCheck className="h-3 w-3 ml-1" />
                  Verify All
                </>
              )}
            </Button>
          </div>

          {/* Verify Date Range */}
          <div className="flex items-center justify-between p-3 rounded-md border">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium">Verify Date Range</p>
                <p className="text-xs text-muted-foreground">
                  Check entries within the last N days
                </p>
              </div>
              <input
                type="number"
                value={rangeDays}
                onChange={(e) => setRangeDays(e.target.value)}
                className="w-16 h-8 rounded-md border border-input bg-background px-2 text-xs text-center"
                min={1}
                max={365}
              />
              <span className="text-xs text-muted-foreground">days</span>
            </div>
            <Button
              onClick={handleVerifyRange}
              disabled={verifying}
              variant="outline"
              size="sm"
            >
              {verifying ? (
                <>
                  <Loader2 className="h-3 w-3 ml-1 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 ml-1" />
                  Verify Range
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Verification Results */}
      {verification && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {verification.verified ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-red-600" />
              )}
              Verification Result
            </CardTitle>
            <CardDescription>
              {verification.verified
                ? "All chain entries verified — integrity confirmed"
                : `${verification.tamperedEntries} tampered entr${verification.tamperedEntries === 1 ? "y" : "ies"} detected`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-md border text-center">
                <p className="text-2xl font-bold">{verification.totalEntries}</p>
                <p className="text-xs text-muted-foreground">Checked</p>
              </div>
              <div className="p-3 rounded-md border text-center">
                <p className="text-2xl font-bold text-green-600">
                  {verification.validEntries}
                </p>
                <p className="text-xs text-muted-foreground">Valid</p>
              </div>
              <div className="p-3 rounded-md border text-center">
                <p className={`text-2xl font-bold ${verification.tamperedEntries > 0 ? "text-red-600" : "text-green-600"}`}>
                  {verification.tamperedEntries}
                </p>
                <p className="text-xs text-muted-foreground">Tampered</p>
              </div>
            </div>

            {/* Details */}
            {verification.details.length > 0 && (
              <div className="space-y-1 max-h-64 overflow-y-auto border rounded-md p-2">
                {verification.details.map((det) => (
                  <div
                    key={det.entryId}
                    className={`flex items-center gap-2 p-2 rounded text-xs ${
                      det.valid
                        ? "text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-300"
                        : "text-red-700 bg-red-50 dark:bg-red-950 dark:text-red-300"
                    }`}
                  >
                    {det.valid ? (
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                    ) : (
                      <XCircle className="h-3 w-3 shrink-0" />
                    )}
                    <span className="font-mono">
                      #{det.position}
                    </span>
                    <span className="font-mono truncate max-w-[120px]">
                      {det.auditLogId.slice(0, 12)}...
                    </span>
                    {!det.valid && det.reason && (
                      <span className="text-red-600 dark:text-red-400 truncate">
                        — {det.reason}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  )
}
