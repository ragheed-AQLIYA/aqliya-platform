import Link from "next/link";
import type { Metadata } from "next";
import { PrintToolbar } from "@/components/marketing/print-toolbar";

export const metadata: Metadata = {
  title: "المعالجون الفرعيون — PDF | AQLIYA",
  description: "قائمة المعالجين الفرعيين للبنية السحابية وخدمات التشغيل.",
};

const subprocessors = [
  {
    name: "Amazon Web Services (AWS)",
    role: "استضافة التطبيق، قاعدة البيانات، التخزين، CDN",
    region: "me-south-1 (primary) / eu-central-1 (DR)",
  },
  {
    name: "Sentry",
    role: "تتبع الأخطاء والمراقبة التشغيلية (بدون محتوى أعمال العميل في الرسائل)",
    region: "حسب إعداد SaaS",
  },
  {
    name: "OpenAI / Anthropic (عند التفعيل)",
    role: "معالجة طلبات AI المساعدة — فقط عند تكوين المزود وضمن سياسة العميل",
    region: "حسب المزود — قابل للتقييم في DPA",
  },
];

export default function PrintSubprocessorsPage() {
  const generated = new Date().toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <PrintToolbar title="طباعة / حفظ PDF" />
      <article className="print-doc" dir="rtl">
        <p className="print-meta">AQLIYA — المعالجون الفرعيون · {generated}</p>
        <h1>قائمة المعالجين الفرعيين (ملخص)</h1>
        <p>
          قائمة شفافة للبنية التشغيلية. النسخة التعاقدية الكاملة تُرفق في DPA
          عند التوقيع. آخر مراجعة: {generated}.
        </p>

        {subprocessors.map((s) => (
          <section key={s.name}>
            <h2>{s.name}</h2>
            <p>
              <strong>الدور:</strong> {s.role}
              <br />
              <strong>المنطقة/الملاحظة:</strong> {s.region}
            </p>
          </section>
        ))}

        <h2>حدود AI</h2>
        <p>
          مخرجات AI مسودات. لا قرار نهائي آلي. يمكن تقييد أو تعطيل مزودي AI
          الخارجيين حسب سياسة المؤسسة — ناقش في جلسة الأمن.
        </p>

        <p>
          ملخص DPA:{" "}
          <Link href="https://aqliya.com/print/dpa-summary">
            aqliya.com/print/dpa-summary
          </Link>
        </p>

        <footer className="print-footer">
          ليست قائمة SOC2. التحديثات المادية تُبلغ العملاء حسب العقد.
        </footer>
      </article>
    </>
  );
}
