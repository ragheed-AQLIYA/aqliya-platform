"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DecisionTabs } from "@/components/decisions/decision-tabs"
import { getDecisionById } from "@/actions/decisions"
import { useEffect, useState } from "react"

export default function GovernancePage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [decision, setDecision] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Extract id from params Promise
  useEffect(() => {
    const getId = async () => {
      const { id: decisionId } = await params
      setId(decisionId)
    }
    getId()
  }, [params])

  // Load decision
  useEffect(() => {
    if (!id) return

    const loadDecision = async () => {
      const result = await getDecisionById(id)
      if (result.success && result.data) {
        setDecision(result.data)
      }
      setLoading(false)
    }
    loadDecision()
  }, [id])

  if (loading || !id) {
    return (
      <div>
        <DecisionTabs decisionId={id || ""} />
        <div className="mt-6 text-center">Loading...</div>
      </div>
    )
  }

  if (!decision) {
    return (
      <div>
        <DecisionTabs decisionId={id} />
        <div className="mt-6 text-center text-muted-foreground">Decision not found</div>
      </div>
    )
  }

  return (
    <div>
      <DecisionTabs decisionId={id} />
      <div className="mt-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Governance & Audit</h2>
        <div className="space-y-8">
          <section>
            <h3 className="text-lg font-semibold mb-4">Decision Roles</h3>
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">Owner</div>
                <div className="font-medium">{decision.owner?.name || 'Unassigned'}</div>
                <div className="text-xs text-muted-foreground">{decision.owner?.email}</div>
                <Badge variant="outline" className="mt-1">{decision.owner?.role}</Badge>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">Reviewer</div>
                <div className="font-medium">{decision.reviewer?.name || 'Unassigned'}</div>
                <div className="text-xs text-muted-foreground">{decision.reviewer?.email}</div>
                <Badge variant="outline" className="mt-1">{decision.reviewer?.role}</Badge>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">Approver</div>
                <div className="font-medium">{decision.approver?.name || 'Unassigned'}</div>
                <div className="text-xs text-muted-foreground">{decision.approver?.email}</div>
                <Badge variant="outline" className="mt-1">{decision.approver?.role}</Badge>
              </Card>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-4">Status History</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Changed By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {decision.auditLogs
                  ?.filter((log: any) => log.action === 'STATUS_CHANGED')
                  .map((log: any, i: number) => {
                    const before = log.before ? JSON.parse(log.before) : null
                    const after = log.after ? JSON.parse(log.after) : null
                    return (
                      <TableRow key={i}>
                        <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                        <TableCell><Badge variant="outline">{before?.status || '-'}</Badge></TableCell>
                        <TableCell><Badge variant="outline">{after?.status || '-'}</Badge></TableCell>
                        <TableCell>{decision.owner?.name}</TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-4">Audit Log</h3>
            <div className="space-y-2">
              {decision.auditLogs?.length > 0 ? (
                decision.auditLogs.map((log: any) => (
                  <div key={log.id} className="flex items-center gap-4 text-sm border-l-2 pl-4 py-2">
                    <span className="text-muted-foreground w-36">{new Date(log.createdAt).toLocaleString()}</span>
                    <Badge variant="outline">{log.action}</Badge>
                    <span className="font-medium w-40">{log.user?.name || 'Unknown'}</span>
                    <span className="text-muted-foreground">{log.entity} {log.after && Object.keys(JSON.parse(log.after)).join(', ')}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No audit logs yet</p>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-4">Approvals</h3>
            {decision.approvals?.length > 0 ? (
              <div className="space-y-2">
                {decision.approvals.map((approval: any) => (
                  <Card key={approval.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{approval.approver?.name || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">{approval.comments}</div>
                      </div>
                      <Badge variant={approval.status === 'APPROVED' ? 'default' : approval.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                        {approval.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No approvals yet</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
