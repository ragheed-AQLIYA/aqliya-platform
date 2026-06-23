import Link from "next/link";
import type { Metadata } from "next";
import { PrintToolbar } from "@/components/marketing/print-toolbar";

export const metadata: Metadata = {
  title: "قالب مرجع تقييم — PDF | AQLIYA",
  description:
    "هيكل case study anonymized — يُملأ بعد تقييم تشغيلي مكتمل وموافقة العميل.",
};

const sections = [
  "وصف anonymized: حجم المكتب، عدد الارتباطات/سنة (نطاق)",
  "المشكلة قبل: workflow baseline (qualitative)",
  "نطاق التقييم: مسار واحد، مدة، معايير مختارة",
  "النتائج المقاسة (ليس تقدير marketing): cycle time، evidence %، gates",
  "اقتباس معتمد (Partner / Audit Director) — بإذن كتابي",
  "قرار بالأدلة وخطوة ما بعد التقييم",
  "رابط الديمو للتحقق من القدرات المذكورة",
];

export default function PrintReferenceCaseTemplatePage() {
  const generated = new Date().toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <PrintToolbar title="طباعة / حفظ PDF" />
      <article className="print-doc" dir="rtl">
        <p className="print-meta">AQLIYA — Reference template · {generated}</p>
        <h1>قالب مرجع تقييم #1 (anonymized)</h1>
        <p>
          <strong>الحالة:</strong> لا مرجع منشور بعد — هذا الهيكل الذي سيُستخدم
          عند أول قرار بالأدلة + إذن كتابي. لا نسب وهمية.
        </p>

        {sections.map((s) => (
          <section key={s}>
            <h2>{s}</h2>
            <p>_____________________________________________</p>
          </section>
        ))}

        <footer className="print-footer">
          Target: publish by Day 90 of launch program when evaluation completes.
        </footer>
      </article>
    </>
  );
}
