import Link from "next/link";
import type { Metadata } from "next";
import { PrintToolbar } from "@/components/marketing/print-toolbar";

export const metadata: Metadata = {
  title: "ملخص الأمن — PDF | AQLIYA",
  description: "ملخص أمني قابل للطباعة لفريق المشتريات والتقنية.",
};

const pillars = [
  {
    title: "RBAC — التحكم بالوصول",
    body: "صلاحيات صريحة على مستوى المؤسسة، مساحة العمل، الدور، والإجراء.",
  },
  {
    title: "سجل تدقيق غير قابل للتعديل",
    body: "كل mutation مسجّل بالهوية والوقت والسياق — لا حذف من المسؤول.",
  },
  {
    title: "تتبع الأدلة",
    body: "المخرجات مرتبطة بمصادرها وخطوات المراجعة البشرية.",
  },
  {
    title: "عزل المستأجرين",
    body: "فصل البيانات والصلاحيات وسجلات التدقيق بين المؤسسات.",
  },
  {
    title: "Human-in-the-Loop",
    body: "مخرجات AI مسودات؛ التصدير والاعتماد يتطلبان موافقة بشرية.",
  },
  {
    title: "ملكية البيانات",
    body: "بيانات العميل لا تُستخدم لتدريب نماذج خارجية دون اتفاق.",
  },
];

export default function PrintSecuritySummaryPage() {
  const generated = new Date().toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <PrintToolbar title="طباعة / حفظ PDF" />
      <article className="print-doc" dir="rtl">
        <p className="print-meta">AQLIYA — ملخص الأمن · {generated}</p>
        <h1>الأمن بنية — لا إضافة لاحقة</h1>
        <p>
          لا نُعلِن SOC2 أو ISO حتى يتم الحصول عليهما. نوفر شفافية تقنية
          وجلسات مراجعة مع فريقنا الهندسي.
        </p>

        {pillars.map((p) => (
          <section key={p.title}>
            <h2>{p.title}</h2>
            <p>{p.body}</p>
          </section>
        ))}

        <h2>البنية السحابية (الافتراضي)</h2>
        <ul>
          <li>AWS — ECS Fargate، RDS PostgreSQL Multi-AZ، Redis، S3</li>
          <li>رؤوس أمن HTTP (CSP، X-Frame-Options، nosniff)</li>
          <li>مراقبة CloudWatch + Sentry للأخطاء</li>
        </ul>

        <h2>حدود الذكاء الاصطناعي</h2>
        <ul>
          <li>لا قرار نهائي آلي</li>
          <li>لا تصدير نهائي بدون اعتماد بشري حيث ينطبق</li>
          <li>تسجيل نوع الإجراء والنموذج حيث متاح</li>
        </ul>

        <p>
          حزمة التقييم الكاملة:{" "}
          <Link href="https://aqliya.com/procurement-pack">
            aqliya.com/procurement-pack
          </Link>
        </p>

        <footer className="print-footer">
          وثيقة معلوماتية — ليست تقرير penetration test أو شهادة امتثال.
        </footer>
      </article>
    </>
  );
}
