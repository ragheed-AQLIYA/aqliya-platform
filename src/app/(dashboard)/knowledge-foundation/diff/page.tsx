/**
 * Phase 9 — Knowledge Foundation Diff Comparison Page.
 */

import "server-only";

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { listVersions } from "@/actions/knowledge-foundation/actions";
import { DiffViewer } from "@/components/knowledge-foundation/diff-viewer";

export const dynamic = "force-dynamic";

export default async function DiffPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  if (user.role !== "ADMIN" && user.role !== "OPERATOR") {
    redirect("/access-denied");
  }

  const versions = await listVersions();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6" dir="rtl">
      <header>
        <a
          href="/knowledge-foundation"
          className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          ← العودة إلى أساس المعرفة
        </a>
        <h1 className="mt-2 text-2xl font-bold">مقارنة الإصدارات</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          عرض الفروقات بين إصدارين من أساس المعرفة المؤسسية.
        </p>
      </header>

      <DiffViewer
        versions={versions.map((v) => ({
          id: v.id,
          versionNumber: v.versionNumber,
        }))}
      />
    </div>
  );
}
