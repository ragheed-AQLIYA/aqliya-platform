import { Badge } from "@/components/ui/badge"
import Link from "next/link"

type DashboardMetrics = {
  totalDecisions: number
  byStatus: Record<string, number>
  byType: Record<string, number>
  byPriority: Record<string, number>
  approvedCount: number
  pendingApproval: number
  draftCount: number
  inProgressCount: number
  avgCompletion: number
  recentDecisions: {
    id: string
    title: string
    type: string
    status: string
    priority: string | null
    createdAt: Date
    hasRecommendation: boolean
    hasApproval: boolean
    stageCount: number
  }[]
  bottlenecks: {
    id: string
    title: string
    stage: string
    priority: string | null
  }[]
}

function getPriorityColor(priority: string | null) {
  switch (priority) {
    case "CRITICAL": return "text-red-500"
    case "HIGH": return "text-orange-500"
    case "MEDIUM": return "text-yellow-500"
    case "LOW": return "text-green-500"
    default: return "text-muted-foreground"
  }
}

function getStatusVariant(status: string) {
  switch (status) {
    case "APPROVED": return "default"
    case "DRAFT": return "secondary"
    case "IN_PROGRESS": return "default"
    default: return "secondary"
  }
}

export function DecisionDashboard({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Total Decisions</div>
          <div className="text-2xl font-bold mt-1">{metrics.totalDecisions}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Approved</div>
          <div className="text-2xl font-bold mt-1 text-green-600">{metrics.approvedCount}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Pending Approval</div>
          <div className="text-2xl font-bold mt-1 text-amber-600">{metrics.pendingApproval}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Avg Completion</div>
          <div className="text-2xl font-bold mt-1">{metrics.avgCompletion}%</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-3">By Status</h3>
          <div className="space-y-2">
            {Object.entries(metrics.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <Badge variant={getStatusVariant(status)}>{status}</Badge>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-3">By Type</h3>
          <div className="space-y-2">
            {Object.entries(metrics.byType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{type}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-3">By Priority</h3>
          <div className="space-y-2">
            {Object.entries(metrics.byPriority).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between text-sm">
                <span className={getPriorityColor(priority)}>{priority}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {metrics.bottlenecks.length > 0 && (
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-semibold mb-3 text-amber-600">Bottlenecks</h3>
          <div className="space-y-2">
            {metrics.bottlenecks.slice(0, 5).map((b) => (
              <Link key={b.id} href={`/decisions/${b.id}`} className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted transition-colors">
                <div>
                  <span className="font-medium">{b.title}</span>
                  <span className={`ml-2 text-xs ${getPriorityColor(b.priority)}`}>{b.priority}</span>
                </div>
                <Badge variant="secondary">Stuck at: {b.stage}</Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border p-4">
        <h3 className="text-sm font-semibold mb-3">Recent Decisions</h3>
        <div className="space-y-2">
          {metrics.recentDecisions.map((d) => (
            <Link key={d.id} href={`/decisions/${d.id}`} className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted transition-colors">
              <div className="flex items-center gap-3">
                <span className="font-medium truncate max-w-[200px]">{d.title}</span>
                <Badge variant="outline">{d.type}</Badge>
                {d.priority && <span className={`text-xs ${getPriorityColor(d.priority)}`}>{d.priority}</span>}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-muted rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(d.stageCount / 7) * 100}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">{d.stageCount}/7</span>
                {d.hasApproval && <Badge variant="default" className="text-xs">Approved</Badge>}
                {d.hasRecommendation && !d.hasApproval && <Badge variant="secondary" className="text-xs">Pending</Badge>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
