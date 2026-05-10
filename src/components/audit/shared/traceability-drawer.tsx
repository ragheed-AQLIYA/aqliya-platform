"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X, ArrowRight, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/audit/shared/status-badge"

interface TraceabilityNode {
  id: string
  type: string
  label: string
  status: string
  amount?: number
  mappingType?: string
  severity?: string
  riskLevel?: string
  reviewer?: string
  actor?: string
  timestamp?: string
}

interface TraceabilityDrawerProps {
  open: boolean
  onClose: () => void
  entityType: string
  entityId: string
  entityLabel: string
  forwardTrace?: TraceabilityNode[]
  backwardTrace?: TraceabilityNode[]
}

const nodeTypeConfig: Record<string, { label: string; color: string }> = {
  source_data: { label: "Source Data", color: "text-gray-600 bg-gray-50" },
  account: { label: "Account", color: "text-blue-600 bg-blue-50" },
  evidence: { label: "Evidence", color: "text-cyan-600 bg-cyan-50" },
  finding: { label: "Finding", color: "text-amber-600 bg-amber-50" },
  recommendation: { label: "Recommendation", color: "text-purple-600 bg-purple-50" },
  approval: { label: "Approval", color: "text-emerald-600 bg-emerald-50" },
  publication: { label: "Publication", color: "text-indigo-600 bg-indigo-50" },
  review: { label: "Review", color: "text-orange-600 bg-orange-50" },
  event: { label: "Audit Event", color: "text-pink-600 bg-pink-50" },
  ai_output: { label: "AI Output", color: "text-violet-600 bg-violet-50" },
}

const sar = (v: number) => new Intl.NumberFormat('en-SA', { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(v)

function TraceabilityNodeCard({ node, isForward }: { node: TraceabilityNode; isForward: boolean }) {
  const config = nodeTypeConfig[node.type] ?? { label: node.type, color: "text-gray-600 bg-gray-50" }
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold", config.color, "border-current")}>
          {node.type.charAt(0).toUpperCase()}
        </div>
        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="flex-1 pb-4">
        <div className="mb-1 flex items-center gap-2">
          <span className={cn("text-[10px] font-semibold uppercase tracking-wider", config.color.split(" ")[0])}>
            {config.label}
          </span>
          <span className="text-[10px] text-muted-foreground">{isForward ? "→" : "←"}</span>
        </div>
        <p className="text-sm font-medium text-foreground">{node.label}</p>
        {node.amount !== undefined && (
          <p className="text-xs font-mono text-muted-foreground mt-0.5">{sar(node.amount)}</p>
        )}
        <div className="flex items-center gap-1 mt-1 flex-wrap">
          <StatusBadge status={node.status} size="sm" />
          {node.mappingType && <span className="text-[10px] text-muted-foreground bg-muted px-1 rounded">{node.mappingType}</span>}
          {node.severity && (
            <span className={cn("text-[10px] px-1 rounded", node.severity === 'high' || node.severity === 'critical' ? 'bg-red-100 text-red-700' : node.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700')}>
              {node.severity}
            </span>
          )}
          {node.riskLevel && (
            <span className={cn("text-[10px] px-1 rounded", node.riskLevel === 'high' || node.riskLevel === 'critical' ? 'bg-red-100 text-red-700' : node.riskLevel === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700')}>
              {node.riskLevel}
            </span>
          )}
        </div>
        {(node.reviewer || node.actor) && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {node.reviewer || node.actor}
            {node.timestamp && ` · ${new Date(node.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
          </p>
        )}
      </div>
    </div>
  )
}

function TraceabilityDrawer({
  open,
  onClose,
  entityType,
  entityId,
  entityLabel,
  forwardTrace = [],
  backwardTrace = [],
}: TraceabilityDrawerProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l bg-background shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
            "duration-300"
          )}
        >
          <DialogPrimitive.Title className="sr-only">Traceability details</DialogPrimitive.Title>
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {entityType}
              </span>
              <h2 className="text-base font-semibold text-foreground">{entityLabel}</h2>
            </div>
            <DialogPrimitive.Close className="rounded-sm p-1 opacity-70 transition-opacity hover:opacity-100">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Forward Trace
                </span>
              </div>
              {forwardTrace.length > 0 ? (
                forwardTrace.map((node) => (
                  <TraceabilityNodeCard key={node.id} node={node} isForward={true} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No forward trace available</p>
              )}
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <ArrowLeft className="h-3.5 w-3.5 text-purple-500" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Backward Trace
                </span>
              </div>
              {backwardTrace.length > 0 ? (
                backwardTrace.map((node) => (
                  <TraceabilityNodeCard key={node.id} node={node} isForward={false} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No backward trace available</p>
              )}
            </div>
          </div>

          <div className="border-t px-4 py-3">
            <p className="text-[10px] text-muted-foreground">
              Entity ID: <span className="font-mono text-foreground">{entityType}_{entityId}</span>
            </p>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export { TraceabilityDrawer, TraceabilityNodeCard }
export type { TraceabilityDrawerProps, TraceabilityNode }
