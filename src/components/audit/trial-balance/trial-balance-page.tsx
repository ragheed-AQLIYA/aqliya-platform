"use client"

import { useEffect, useState, Fragment } from "react"
import { useParams } from "next/navigation"
import { ArrowUpDown, Search, ChevronDown, ChevronRight, FileSpreadsheet, AlertTriangle, CheckCircle, XCircle, Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"

import { TrialBalanceUpload } from "@/components/audit/trial-balance/trial-balance-upload"
import type { TrialBalance, TrialBalanceLine, Engagement } from "@/types/audit"
import { getTrialBalanceAction, getEngagementAction } from "@/actions/audit-read-actions"

const sar = (v: number) => new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(v)

const trustColors: Record<string, string> = { trusted: "bg-green-100 text-green-800 border-green-300", conditional: "bg-amber-100 text-amber-800 border-amber-300", blocked: "bg-red-100 text-red-800 border-red-300" }
const typeColors: Record<string, string> = { asset: "text-blue-600", "non-current-asset": "text-blue-600", liability: "text-orange-600", equity: "text-green-600", revenue: "text-teal-600", expense: "text-red-600" }
const TrustIcon = ({ state }: { state: string }) => state === "trusted" ? <CheckCircle className="size-4" /> : state === "conditional" ? <AlertTriangle className="size-4" /> : <XCircle className="size-4" />

export default function TrialBalancePage() {
  const params = useParams()
  const engagementId = params.engagementId as string
  const [tb, setTb] = useState<TrialBalance | null>(null)
  const [engagement, setEngagement] = useState<Engagement | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<string>("accountCode")
  const [sortAsc, setSortAsc] = useState(true)
  const [search, setSearch] = useState("")
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    Promise.all([getTrialBalanceAction(engagementId), getEngagementAction(engagementId)]).then(([t, e]) => {
      setTb(t); setEngagement(e); setLoading(false)
    })
  }, [engagementId])

  const handleUploadComplete = () => {
    getTrialBalanceAction(engagementId).then(setTb)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (!tb) return (
    <div className="space-y-4">
      <Card><CardContent className="p-6 text-center text-muted-foreground">Trial balance not found. Upload one to get started.</CardContent></Card>
      <div className="flex justify-center">
        <Button onClick={() => setShowUpload(true)}><Upload className="size-4 mr-1" />Upload Trial Balance</Button>
      </div>
      <TrialBalanceUpload open={showUpload} onClose={() => setShowUpload(false)} engagementId={engagementId} onComplete={handleUploadComplete} />
    </div>
  )

  const toggleSort = (key: string) => { if (sortKey === key) setSortAsc(!sortAsc); else { setSortKey(key); setSortAsc(true) } }

  const filtered = tb.lines.filter(l => l.accountName.toLowerCase().includes(search.toLowerCase()) || l.accountCode.includes(search))
  const sorted = [...filtered].sort((a, b) => {
    const av = (a as any)[sortKey], bv = (b as any)[sortKey]
    if (typeof av === "number" && typeof bv === "number") return sortAsc ? av - bv : bv - av
    return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
  })

  const SortHeader = ({ k, children }: { k: string; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort(k)}>
      <div className="flex items-center gap-1">{children}<ArrowUpDown className="size-3" /></div>
    </TableHead>
  )

  return (
    <div className="space-y-6" dir="ltr">
      <TrialBalanceUpload open={showUpload} onClose={() => setShowUpload(false)} engagementId={engagementId} onComplete={handleUploadComplete} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Trial Balance</h1>
          <p className="text-sm text-muted-foreground">{engagement?.client?.name} - {engagement?.fiscalPeriod}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowUpload(true)}><Upload className="size-4 mr-1" />Upload</Button>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
        <FileSpreadsheet className="size-4" />
        <span>{tb.sourceFile} uploaded {new Date(tb.importTimestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <CardTitle>Accounts</CardTitle>
            <Badge variant="outline" className={`${trustColors[tb.trustState]} flex items-center gap-1`}>
              <TrustIcon state={tb.trustState} />{tb.trustState}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div>Total Debits: <span className="font-medium">{sar(tb.totalDebits)}</span></div>
            <div>Total Credits: <span className="font-medium">{sar(tb.totalCredits)}</span></div>
            {tb.variance !== 0 && (
              <div className="flex items-center gap-1 text-red-600 font-medium">
                <AlertTriangle className="size-4" />Variance: {sar(tb.variance)}
              </div>
            )}
            {tb.variance === 0 && (
              <div className="flex items-center gap-1 text-green-600 font-medium">
                <CheckCircle className="size-4" />In Balance
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input placeholder="Search by account name or code..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <SortHeader k="accountCode">Account Code</SortHeader>
                <SortHeader k="accountName">Account Name</SortHeader>
                <SortHeader k="debitAmount">Debit (SAR)</SortHeader>
                <SortHeader k="creditAmount">Credit (SAR)</SortHeader>
                <SortHeader k="balance">Balance (SAR)</SortHeader>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(line => (
                <Fragment key={line.id}>
                  <TableRow className="cursor-pointer" onClick={() => setExpandedRow(expandedRow === line.id ? null : line.id)}>
                    <TableCell className="font-mono">{line.accountCode}</TableCell>
                    <TableCell className={typeColors[line.accountType || ""] || ""}>{line.accountName}</TableCell>
                    <TableCell>{line.debitAmount > 0 ? sar(line.debitAmount) : "-"}</TableCell>
                    <TableCell>{line.creditAmount > 0 ? sar(line.creditAmount) : "-"}</TableCell>
                    <TableCell className={line.balance < 0 ? "text-red-600" : ""}>{sar(line.balance)}</TableCell>
                    <TableCell><Badge variant="outline" className={typeColors[line.accountType || ""] || ""}>{line.accountType || "unknown"}</Badge></TableCell>
                  </TableRow>
                  {expandedRow === line.id && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-muted/30">
                        <div className="p-3 text-sm space-y-1">
                          <div className="font-medium">{line.accountName} ({line.accountCode})</div>
                          <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                            <div>Debit: {sar(line.debitAmount)}</div>
                            <div>Credit: {sar(line.creditAmount)}</div>
                            <div>Balance: {sar(line.balance)}</div>
                            <div>Type: {line.accountType || "unknown"}</div>
                            <div>Currency: {line.currency}</div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
