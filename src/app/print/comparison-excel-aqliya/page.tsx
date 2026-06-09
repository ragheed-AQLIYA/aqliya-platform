import Link from "next/link";
import type { Metadata } from "next";
import { PrintToolbar } from "@/components/marketing/print-toolbar";

export const metadata: Metadata = {
  title: "Excel مقابل AQLIYA — PDF | AQLIYA",
  description: "مقارنة صادقة: أدوات يدوية مقابل مسار محكوم.",
};

const rows = [
  {
    area: "سجل القرار",
    excel: "تعليقات / ألوان / ملفات متعددة",
    aqliya: "Audit Trail غير قابل للتعديل",
  },
  {
    area: "سلسلة الأدلة",
    excel: "روابط يدوية أو مفقودة",
    aqliya: "Evidence Graph — رقم ← حساب ← دليل",
  },
  {
    area: "الاعتماد",
    excel: "بريد / WhatsApp",
    aqliya: "Human Gates + اعتماد موقّع",
  },
  {
    area: "الذكاء الاصطناعي",
    excel: "ChatGPT منفصل — بلا حوكمة",
    aqliya: "AI مسودة داخل مسار مراجَع",
  },
  {
    area: "الصلاحيات",
    excel: "مشاركة مجلد",
    aqliya: "RBAC على دور وارتباط",
  },
  {
    area: "المخرج النهائي",
    excel: "PDF مجمّع يدوياً",
    aqliya: "حزمة ارتباط + سجل تدقيق",
  },
];

export default function PrintComparisonPage() {
  const generated = new Date().toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <PrintToolbar title="طباعة / حفظ PDF" />
      <article className="print-doc" dir="rtl">
        <p className="print-meta">AQLIYA — مقارنة تشغيلية · {generated}</p>
        <h1>Excel + بريد + WhatsApp مقابل مسار محكوم</h1>
        <p>
          ليس بديلاً لكل Excel — بل مسار محكوم للعمليات الحرجة (مراجعة،
          اعتماد، أدلة). للتحليلات ad-hoc قد يبقى Excel مناسباً.
        </p>

        {rows.map((r) => (
          <section key={r.area}>
            <h2>{r.area}</h2>
            <p>
              <strong>الوضع الشائع:</strong> {r.excel}
              <br />
              <strong>مع AQLIYA:</strong> {r.aqliya}
            </p>
          </section>
        ))}

        <h2>الخطوة التالية</h2>
        <p>
          تحقق في الديمو —{" "}
          <Link href="https://aqliya.com/auditos">aqliya.com/auditos</Link>
        </p>

        <footer className="print-footer">
          Sales enablement — not a competitive legal claim against third parties.
        </footer>
      </article>
    </>
  );
}
