import Link from "next/link";
import type { Metadata } from "next";
import { PrintToolbar } from "@/components/marketing/print-toolbar";

export const metadata: Metadata = {
  title: "قالب metrics البايلوت الأسبوعي — PDF | AQLIYA",
  description: "قالب checkpoint أسبوعي لبايلوت AuditOS — للاستخدام الداخلي مع العميل.",
};

const sections = [
  {
    title: "أسبوع البايلوت",
    fields: ["#", "التاريخ", "حضور: workflow owner + AQLIYA lead"],
  },
  {
    title: "التقدم التشغيلي",
    fields: [
      "مراحل سير العمل المكتملة هذا الأسبوع",
      "Human gates passed / blocked",
      "أدلة مرتبطة vs ناقصة",
      "blockers (تقنية / بيانات / صلاحيات)",
    ],
  },
  {
    title: "مؤشرات (تقديرية — لا ادعاء رسمي)",
    fields: [
      "ساعات saved vs baseline (estimate + method)",
      "عدد users active",
      "quotes من المستخدمين (نص حرفي)",
    ],
  },
  {
    title: "قرارات الأسبوع",
    fields: [
      "Continue / Pause / Escalate",
      "تغييرات على نطاق SOW (إن وجدت)",
      "action items للأسبوع القادم",
    ],
  },
];

export default function PrintPilotWeeklyMetricsPage() {
  const generated = new Date().toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <PrintToolbar title="طباعة / حفظ PDF" />
      <article className="print-doc" dir="rtl">
        <p className="print-meta">AQLIYA — Pilot Weekly Checkpoint · {generated}</p>
        <h1>قالب metrics البايلوت — checkpoint أسبوعي</h1>
        <p>
          يُملأ في اجتماع 30 دقيقة أسبوعياً. يُ archived مع Go/No-Go report. لا
          يُستخدم كادعاء marketing دون موافقة العميل.
        </p>

        <p>
          <strong>عميل:</strong> _______________ · <strong>ارتباط/سير عمل:</strong>{" "}
          _______________
        </p>

        {sections.map((s) => (
          <section key={s.title}>
            <h2>{s.title}</h2>
            <ul>
              {s.fields.map((f) => (
                <li key={f}>{f}: _________________________</li>
              ))}
            </ul>
          </section>
        ))}

        <h2>ربط بإطار البايلوت</h2>
        <p>
          معايير Go/No-Go:{" "}
          <Link href="https://aqliya.com/pilot-proof">aqliya.com/pilot-proof</Link>
        </p>

        <footer className="print-footer">
          Internal / customer shared template — not a certified outcome report.
        </footer>
      </article>
    </>
  );
}
