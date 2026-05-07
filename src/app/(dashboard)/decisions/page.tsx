import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getDecisions } from "@/actions/decisions"

type DecisionListItem = {
  id: string
  title: string
  status: string
  type: string
  owner?: { name: string } | null
  intake?: { status: string }
}

function getIntakeVariant(status?: string) {
  if (status === "accepted") return "default" as const
  if (status === "rejected") return "destructive" as const
  return "secondary" as const
}

export default async function DecisionsPage() {
  const result = await getDecisions()
  const decisions = result.success && result.data ? result.data : []

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Decisions</h1>
        <Link href="/decisions/new">
          <Button>New Decision</Button>
        </Link>
      </div>

      {decisions.length === 0 ? (
        <p className="text-muted-foreground">No decisions found. Create your first decision.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(decisions as DecisionListItem[]).map((decision) => (
            <Link key={decision.id} href={`/decisions/${decision.id}`}>
              <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold">{decision.title}</h2>
                  <Badge variant={getIntakeVariant(decision.intake?.status)}>
                    {decision.intake?.status?.replace("_", " ") || "intake pending"}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  <p>Status: {decision.status}</p>
                  <p>Type: {decision.type}</p>
                  <p>Owner: {decision.owner?.name || 'Unassigned'}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
