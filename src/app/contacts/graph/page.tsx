import { getContactGraphDataAction } from "@/actions/contact-graph-actions";
import { RelationshipGraph } from "@/components/contacts/relationship-graph";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ContactGraphPage() {
  let result: Awaited<ReturnType<typeof getContactGraphDataAction>> | null = null;
  let error: string | null = null;

  try {
    result = await getContactGraphDataAction();
  } catch (e: any) {
    error = e.message ?? "Failed to load graph";
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الرسم البياني للعلاقات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Relationship Graph — تصور شبكة العلاقات المؤسسية
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/contacts/dashboard"
            className="text-sm px-3 py-1.5 border rounded hover:bg-muted"
          >
            لوحة التحكم
          </Link>
          <Link
            href="/contacts/analytics"
            className="text-sm px-3 py-1.5 border rounded hover:bg-muted"
          >
            التحليلات
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 rounded-lg p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <RelationshipGraph data={result} loading={false} />
    </div>
  );
}
