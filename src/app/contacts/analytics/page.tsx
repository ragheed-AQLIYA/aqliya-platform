import { ContactAnalyticsDashboard } from "@/components/contacts/analytics-dashboard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function ContactAnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">تحليلات جهات الاتصال</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Contact Analytics — تحليلات متقدمة للعلاقات المؤسسية
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
            href="/contacts/graph"
            className="text-sm px-3 py-1.5 border rounded hover:bg-muted"
          >
            الرسم البياني
          </Link>
        </div>
      </div>

      <ContactAnalyticsDashboard />
    </div>
  );
}
