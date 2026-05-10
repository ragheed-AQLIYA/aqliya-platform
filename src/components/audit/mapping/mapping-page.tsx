"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { CheckCircle, XCircle, Clock, Sparkles, User, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"

import type { AccountMapping, Engagement } from "@/types/audit"
import { getMappingsAction, confirmMappingAction, getEngagementAction } from "@/actions/audit-read-actions"
import { updateManualMappingAction } from "@/actions/audit-actions"

const sar = (v: number) => new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(v)

export default function MappingPage() {
  const params = useParams()
  const engagementId = params.engagementId as string
  const [mappings, setMappings] = useState<AccountMapping[]>([])
  const [engagement, setEngagement] = useState<Engagement | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "mapped" | "unmapped">("all")
  const [toast, setToast] = useState<string | null>(null)
  const [toastType, setToastType] = useState<"success" | "error">("success")

  useEffect(() => {
    Promise.all([getMappingsAction(engagementId), getEngagementAction(engagementId)]).then(([m, e]) => {
      setMappings(m); setEngagement(e); setLoading(false)
    })
  }, [engagementId])

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast(msg); setToastType(type)
    setTimeout(() => setToast(null), 3000)
  }

  const handleConfirm = async (mappingId: string) => {
    const result = await confirmMappingAction(engagementId, mappingId)
    if (result) {
      setMappings(prev => prev.map(m => m.id === mappingId ? result : m))
      showToast(`Mapping confirmed for ${result.sourceAccountName}`)
    } else {
      showToast("Failed to confirm mapping", "error")
    }
  }

  const handleManualMappingChange = async (mappingId: string, canonicalAccountId: string | null) => {
    const result = await updateManualMappingAction({ engagementId, mappingId, canonicalAccountId })
    if (result) {
      setMappings(prev => prev.map(m => m.id === mappingId ? result : m))
      showToast(`Manual mapping saved for ${result.sourceAccountName}`)
    } else {
      showToast("Failed to save manual mapping", "error")
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  const total = mappings.length
  const confirmed = mappings.filter(m => m.status === "confirmed").length
  const pending = mappings.filter(m => m.status === "pending").length

  let filtered = mappings
  if (filter === "mapped") filtered = mappings.filter(m => m.status === "confirmed")
  if (filter === "unmapped") filtered = mappings.filter(m => m.status === "pending")

  const canonicalAccounts = [
    { id: "ca-1", code: "CA-1010", name: "Cash and Cash Equivalents" },
    { id: "ca-2", code: "CA-1020", name: "Trade Receivables" },
    { id: "ca-3", code: "CA-1030", name: "Inventories" },
    { id: "ca-4", code: "CA-1040", name: "Prepayments" },
    { id: "ca-5", code: "CA-1050", name: "Property, Plant and Equipment" },
    { id: "ca-6", code: "CA-1060", name: "Accumulated Depreciation" },
    { id: "ca-7", code: "CA-2010", name: "Trade Payables" },
    { id: "ca-8", code: "CA-2020", name: "Accrued Expenses" },
    { id: "ca-9", code: "CA-2030", name: "Tax and Zakat Payable" },
    { id: "ca-10", code: "CA-2040", name: "Short-term Borrowings" },
    { id: "ca-11", code: "CA-3010", name: "Share Capital" },
    { id: "ca-12", code: "CA-3020", name: "Retained Earnings" },
    { id: "ca-13", code: "CA-4010", name: "Revenue - Sale of Goods" },
    { id: "ca-14", code: "CA-4020", name: "Revenue - Services" },
    { id: "ca-15", code: "CA-5010", name: "Cost of Sales" },
    { id: "ca-16", code: "CA-5020", name: "Employee Benefits" },
    { id: "ca-17", code: "CA-5030", name: "Occupancy Expenses" },
    { id: "ca-18", code: "CA-5040", name: "Utilities" },
    { id: "ca-19", code: "CA-5050", name: "Depreciation and Amortisation" },
    { id: "ca-20", code: "CA-5060", name: "Professional and Consulting Fees" },
    { id: "ca-21", code: "CA-5070", name: "General and Administrative Expenses" },
    { id: "ca-22", code: "CA-5100", name: "Other Income" },
  ]

  return (
    <div className="space-y-6" dir="ltr">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-white ${toastType === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toastType === "success" ? <CheckCircle className="inline size-4 mr-1" /> : <XCircle className="inline size-4 mr-1" />}
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Mapping</h1>
        <p className="text-sm text-muted-foreground">{engagement?.client?.name} - {engagement?.fiscalPeriod}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Mapping Progress</CardTitle>
              <CardDescription>{confirmed} of {total} accounts mapped</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={pending === 0 ? "secondary" : "outline"} className={pending > 0 ? "bg-amber-100 text-amber-800" : ""}>
                {pending} pending
              </Badge>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${total > 0 ? (confirmed / total) * 100 : 0}%` }} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            {(["all", "mapped", "unmapped"] as const).map(f => (
              <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
                {f === "all" ? "All" : f === "mapped" ? "Mapped" : "Unmapped"}
              </Button>
            ))}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source Code</TableHead>
                <TableHead>Source Name</TableHead>
                <TableHead>Debit</TableHead>
                <TableHead>Credit</TableHead>
                <TableHead>Suggested Mapping</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(m => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono">{m.sourceAccountCode}</TableCell>
                  <TableCell>{m.sourceAccountName}</TableCell>
                  <TableCell>{m.debitAmount > 0 ? sar(m.debitAmount) : "-"}</TableCell>
                  <TableCell>{m.creditAmount > 0 ? sar(m.creditAmount) : "-"}</TableCell>
                  <TableCell>
                    {m.canonicalAccountName ? (
                      <span className="flex items-center gap-1">
                        {m.mappingType === "ai_suggested" && <Sparkles className="size-3 text-purple-500" />}
                        {m.mappingType === "confirmed_ai" && <Sparkles className="size-3 text-blue-500" />}
                        {m.mappingType === "human_mapped" && <User className="size-3 text-green-500" />}
                        {m.canonicalAccountName}
                      </span>
                    ) : <span className="text-muted-foreground italic">Not mapped</span>}
                  </TableCell>
                  <TableCell>{m.statementClassification || "-"}</TableCell>
                  <TableCell>{m.confidence ? `${(m.confidence * 100).toFixed(0)}%` : "-"}</TableCell>
                  <TableCell>
                    {m.status === "confirmed" ? (
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 flex items-center gap-1 w-fit">
                        <CheckCircle className="size-3" />Confirmed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 flex items-center gap-1 w-fit">
                        <Clock className="size-3" />Pending
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {m.status === "pending" && (
                        <Button size="sm" variant="default" onClick={() => handleConfirm(m.id)}>Accept</Button>
                      )}
                      {m.status === "confirmed" && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                          {m.mappingType === "confirmed_ai" && <><Sparkles className="size-3" />AI</>}
                          {m.mappingType === "human_mapped" && <><User className="size-3" />Human</>}
                          {m.mappingType === "ai_suggested" && <><Sparkles className="size-3" />AI</>}
                        </span>
                      )}
                      <Select value={m.canonicalAccountId ?? ""} onValueChange={(v) => { handleManualMappingChange(m.id, v || null) }}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Manual map..." />
                        </SelectTrigger>
                        <SelectContent>
                          {canonicalAccounts.map(ca => (
                            <SelectItem key={ca.id} value={ca.id}>{ca.code} - {ca.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
