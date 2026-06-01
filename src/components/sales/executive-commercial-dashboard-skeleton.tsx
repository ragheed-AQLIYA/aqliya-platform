import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function SectionSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full rounded-md" />
        ))}
      </CardContent>
    </Card>
  );
}

export function ExecutiveCommercialDashboardSkeleton() {
  return (
    <div
      className="space-y-6"
      dir="rtl"
      aria-busy="true"
      aria-label="Loading executive commercial dashboard"
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <Skeleton className="h-3 w-full max-w-2xl" />
      </div>

      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-24" />
        ))}
      </div>

      <section>
        <Skeleton className="mb-3 h-4 w-20" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>
      </section>

      <SectionSkeleton rows={3} />
      <SectionSkeleton rows={4} />

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionSkeleton rows={3} />
        <SectionSkeleton rows={3} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionSkeleton rows={4} />
        <SectionSkeleton rows={4} />
      </div>

      <SectionSkeleton rows={3} />
      <SectionSkeleton rows={2} />

      <Skeleton className="h-3 w-48" />
    </div>
  );
}
