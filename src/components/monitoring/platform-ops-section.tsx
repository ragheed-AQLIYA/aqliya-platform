import { getCurrentUser } from "@/lib/auth";
import { isPlatformAdmin } from "@/lib/authorization/platform-admin";
import { LiveMetricCards } from "@/components/monitoring/live-metric-cards";
import { SystemUptime } from "@/components/monitoring/system-uptime";

export async function PlatformOpsSection() {
  const user = await getCurrentUser();
  if (!isPlatformAdmin(user)) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">حالة الخدمات</h2>
          <p className="text-sm text-muted-foreground">
            مؤشرات حية لخدمات المنصة الأساسية — مدير المنصة فقط
          </p>
        </div>
        <SystemUptime />
      </div>
      <LiveMetricCards />
    </section>
  );
}
