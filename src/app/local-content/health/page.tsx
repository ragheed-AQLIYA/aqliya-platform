import { getLcHealthChecks } from "@/actions/lc-health-actions";

export default async function LcosHealthPage() {
  const checks = await getLcHealthChecks();

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <h1 className="text-2xl font-bold">صحة نظام المحتوى المحلي</h1>
      <h2 className="text-lg text-muted-foreground">LocalContentOS Health</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {checks.map((check) => (
          <div key={check.name} className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${check.status === "healthy" ? "bg-green-500" : "bg-red-500"}`} />
              <span className="font-medium">{check.label}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{check.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
