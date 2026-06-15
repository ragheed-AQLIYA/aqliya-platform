export default function OutputsLoading() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6" dir="rtl">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
