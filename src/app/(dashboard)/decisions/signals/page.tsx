import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignalsDashboardClient } from "./signals-dashboard-client";

export const dynamic = "force-dynamic";

export default async function SignalsPage() {
  const user = await getCurrentUser();
  const signals = await prisma.decisionMonitoringSignal.findMany({
    where: { organizationId: user.organizationId },
    include: {
      decision: { select: { id: true, title: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-h2 font-black text-foreground">لوحة الإشارات</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          مراقبة ما بعد القرار — إشارات آلية من المخاطر والسيناريوهات
        </p>
      </div>
      <SignalsDashboardClient signals={signals} />
    </div>
  );
}
