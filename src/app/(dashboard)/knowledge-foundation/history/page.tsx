/**
 * Phase 9 — Knowledge Foundation Audit History Page.
 */

import "server-only";

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { listVersions } from "@/actions/knowledge-foundation/actions";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
    redirect("/access-denied");
  }

  const [auditLogs, versions] = await Promise.all([
    prisma.platformAuditLog.findMany({
      where: {
        productKey: "knowledge-foundation",
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    listVersions(),
  ]);

  const versionMap = new Map(versions.map((v) => [v.id, v.versionNumber]));

  return (
    <div className="space-y-6 p-6" dir="rtl">
      <header>
        <a
          href="/knowledge-foundation"
          className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          ← العودة إلى أساس المعرفة
        </a>
        <h1 className="mt-2 text-2xl font-bold">سجل تدقيق أساس المعرفة</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          جميع الأحداث المسجلة في أساس المعرفة المؤسسية.
        </p>
      </header>

      {auditLogs.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
          لا توجد أحداث تدقيق مسجلة بعد.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 text-right">التاريخ</th>
                <th className="px-4 py-3 text-right">الإجراء</th>
                <th className="px-4 py-3 text-right">الإصدار</th>
                <th className="px-4 py-3 text-right">بواسطة</th>
                <th className="px-4 py-3 text-right">التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {new Date(log.createdAt).toLocaleDateString("ar-SA", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatAction(log.action)}
                  </td>
                  <td className="px-4 py-3">
                    {log.targetId
                      ? `v${versionMap.get(log.targetId) ?? "..."}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {log.actorName ?? log.actorId ?? "—"}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                    {log.metadata
                      ? extractSummary(log.metadata)
                      : log.targetLabel ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatAction(action: string): string {
  const map: Record<string, string> = {
    "knowledge.foundation.version.created": "إنشاء إصدار",
    "knowledge.foundation.version.approved": "اعتماد إصدار",
    "knowledge.foundation.version.released": "إطلاق إصدار",
    "knowledge.foundation.version.activated": "تفعيل إصدار",
    "knowledge.foundation.version.deprecated": "إيقاف إصدار",
    "knowledge.foundation.rollback.executed": "استرجاع إصدار",
    "knowledge.foundation.diff.generated": "مقارنة إصدارات",
  };
  return map[action] ?? action;
}

function extractSummary(meta: unknown): string {
  if (typeof meta === "object" && meta !== null) {
    const m = meta as Record<string, unknown>;
    if (m.notes) return String(m.notes);
    if (m.eventType) return String(m.eventType);
  }
  return JSON.stringify(meta).slice(0, 80);
}
