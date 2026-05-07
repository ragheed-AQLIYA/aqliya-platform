import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPublishedRecommendationViewAction } from "@/actions/decisions"
import { format } from "date-fns"

export default async function PublishedRecommendationPage({
  params,
}: {
  params: Promise<{ decisionId: string }>
}) {
  const { decisionId } = await params
  if (!decisionId) notFound()
  const result = await getPublishedRecommendationViewAction(decisionId)

  if (!result.success || !result.data?.recommendation) {
    notFound()
  }

  const recommendation = result.data.recommendation
  const title = result.data.title

  return (
    <main className="mx-auto max-w-4xl p-8">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Published Recommendation</CardTitle>
              <CardDescription>{title}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge>Published</Badge>
              <Badge variant="secondary">v{recommendation.publishedVersion}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">Recommended Action</h2>
            <div className="whitespace-pre-wrap rounded-md border p-4 text-sm">
              {recommendation.recommendedAction}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">Rationale</h2>
            <div className="whitespace-pre-wrap rounded-md border p-4 text-sm">
              {recommendation.rationale}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">Expected Next State</h2>
            <div className="whitespace-pre-wrap rounded-md border p-4 text-sm">
              {recommendation.expectedNextState}
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">Publication Metadata</h2>
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              <p>Status: Published</p>
              <p>Published version: {recommendation.publishedVersion}</p>
              <p>
                Published at:{" "}
                {recommendation.publishedAt
                  ? format(new Date(recommendation.publishedAt), "PPp")
                  : "Unavailable"}
              </p>
            </div>
          </section>
        </CardContent>
      </Card>
    </main>
  )
}
