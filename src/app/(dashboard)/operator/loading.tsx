import { Loader2 } from "lucide-react";

export default function OperatorLoading() {
  return (
    <div className="space-y-6" dir="rtl">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-72 rounded-md bg-muted/60 animate-pulse mt-2" />
      </div>

      {/* 3-column skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-6 shadow-sm animate-pulse"
          >
            <div className="h-5 w-32 rounded bg-muted mb-4" />
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="h-32 w-32 rounded-full bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>

      {/* Stats row skeleton */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-4 shadow-sm animate-pulse"
          >
            <div className="h-4 w-16 rounded bg-muted mb-2" />
            <div className="h-7 w-12 rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border bg-card p-6 shadow-sm animate-pulse">
        <div className="h-5 w-40 rounded bg-muted mb-4" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 py-3 border-b last:border-b-0">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-4 w-16 rounded bg-muted mr-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
