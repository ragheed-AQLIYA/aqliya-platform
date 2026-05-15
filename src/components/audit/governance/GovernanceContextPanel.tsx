"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Shield, Scale, FileCheck, UserCheck, ArrowUpCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface GovernanceContextPanelProps {
  taskType?: string
  doctrineRefs?: string[]
  governanceRules?: string[]
  evidenceStatus?: string
  escalationLevel?: string
  open?: boolean
}

export function GovernanceContextPanel({
  taskType,
  doctrineRefs,
  governanceRules,
  evidenceStatus,
  escalationLevel,
  open = false,
}: GovernanceContextPanelProps) {
  const [expanded, setExpanded] = useState(open)

  const hasDoctrine = doctrineRefs && doctrineRefs.length > 0
  const hasRules = governanceRules && governanceRules.length > 0
  const hasEvidence = evidenceStatus !== undefined && evidenceStatus !== ""
  const hasEscalation = escalationLevel !== undefined && escalationLevel !== ""

  return (
    <Card>
      <CardHeader
        className="flex cursor-pointer flex-row items-center justify-between border-b px-4 py-3"
        onClick={() => setExpanded(!expanded)}
      >
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Shield className="h-4 w-4 text-amber-500" />
          Governance Context
        </CardTitle>
        <div className="text-muted-foreground">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-4 px-4 py-3 text-xs">
          {taskType && (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Task:</span> {taskType}
            </p>
          )}

          {hasDoctrine && (
            <div>
              <h4 className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
                <Scale className="h-3.5 w-3.5 text-blue-500" />
                Doctrine References
              </h4>
              <ul className="list-inside list-disc space-y-0.5 text-muted-foreground">
                {doctrineRefs!.map((ref, i) => (
                  <li key={i}>{ref}</li>
                ))}
              </ul>
            </div>
          )}

          {hasRules && (
            <div>
              <h4 className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
                <FileCheck className="h-3.5 w-3.5 text-emerald-500" />
                Governance Rules
              </h4>
              <ul className="list-inside list-disc space-y-0.5 text-muted-foreground">
                {governanceRules!.map((rule, i) => (
                  <li key={i}>{rule}</li>
                ))}
              </ul>
            </div>
          )}

          {hasEvidence && (
            <div>
              <h4 className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
                <FileCheck className="h-3.5 w-3.5 text-cyan-500" />
                Evidence Expectations
              </h4>
              <p className={cn(
                "text-muted-foreground",
                evidenceStatus === "missing" && "text-red-600",
                evidenceStatus === "incomplete" && "text-amber-600",
                evidenceStatus === "satisfied" && "text-emerald-600",
              )}>
                {evidenceStatus === "missing" && "Evidence has not been provided yet."}
                {evidenceStatus === "incomplete" && "Some evidence is still outstanding."}
                {evidenceStatus === "satisfied" && "All evidence expectations are met."}
                {evidenceStatus !== "missing" && evidenceStatus !== "incomplete" && evidenceStatus !== "satisfied" && evidenceStatus}
              </p>
            </div>
          )}

          <div>
            <h4 className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
              <UserCheck className="h-3.5 w-3.5 text-purple-500" />
              Reviewer Obligations
            </h4>
            <ul className="list-inside list-disc space-y-0.5 text-muted-foreground">
              <li>Verify completeness and accuracy of all entries</li>
              <li>Confirm supporting evidence is properly linked</li>
              <li>Document any exceptions or deviations identified</li>
              {!hasEscalation && <li>Escalate unresolved issues per governance policy</li>}
            </ul>
          </div>

          {hasEscalation && (
            <div>
              <h4 className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
                <ArrowUpCircle className="h-3.5 w-3.5 text-red-500" />
                Escalation Guidance
              </h4>
              <p className="text-muted-foreground">
                Current escalation level:{" "}
                <span className={cn(
                  "font-medium",
                  escalationLevel === "critical" && "text-red-600",
                  escalationLevel === "high" && "text-amber-600",
                  escalationLevel === "medium" && "text-blue-600",
                  escalationLevel === "low" && "text-muted-foreground",
                )}>
                  {escalationLevel}
                </span>
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
