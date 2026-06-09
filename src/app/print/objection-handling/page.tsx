import Link from "next/link";
import type { Metadata } from "next";
import { PrintToolbar } from "@/components/marketing/print-toolbar";

export const metadata: Metadata = {
  title: "ردود الاعتراضات الشائعة — PDF | AQLIYA",
  description: "إجابات صادقة لاعتراضات المشتري والتقنية — للتقييم لا للإقناع بالضغط.",
};

const objections = [
  {
    q: "هل يستبدل المدقق أو يصدر رأي تدقيق؟",
    a: "لا. AQLIYA أداة مساعدة — AI مسودة، الإنسان يقرر، الدليل يحكم. المسؤولية المهنية تبقى على المكتب.",
  },
  {
    q: "بياناتنا — هل تُستخدم لتدريب AI؟",
    a: "لا تُستخدم لتدريب نماذج عامة دون اتفاق. معالجة الجلسة فقط حيث ينطبق — راجع DPA وsubprocessors.",
  },
  {
    q: "لا SOC2 / ISO — كيف نشتري؟",
    a: "شفافية + حزمة مشتريات + جلسة أمن + خارطة SOC2 بمواعيد مستهدفة — لا ادعاء شهادة.",
  },
  {
    q: "On-Prem / Air-Gapped؟",
    a: "استراتيجي — Cloud Managed متاح اليوم. نناقش السيادة بصدق؛ لا نعد بحزمة معزولة جاهزة.",
  },
  {
    q: "أحببنا الباilot لكن غير جاهزين للدفع",
    a: "Proceed أضيق، مرجع anonymized، أو extension محددة لإثبات نقطة واحدة — لا ضغط.",
  },
  {
    q: "نحتاج المزيد من الإثبات",
    a: "ديمو + باilot مجاني bounded + Go/No-Go مكتوب — لا عقد واسع قبل ذلك.",
  },
];

export default function PrintObjectionHandlingPage() {
  const generated = new Date().toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <PrintToolbar title="طباعة / حفظ PDF" />
      <article className="print-doc" dir="rtl">
        <p className="print-meta">AQLIYA — Objection handling · {generated}</p>
        <h1>اعتراضات شائعة — ردود للمشتري</h1>
        <p>للاستخدام في التقييم والحوار — ليس script مبيعات عدواني.</p>

        {objections.map((o) => (
          <section key={o.q}>
            <h2>{o.q}</h2>
            <p>{o.a}</p>
          </section>
        ))}

        <p>
          حزمة المشتريات:{" "}
          <Link href="https://aqliya.com/procurement-pack">
            aqliya.com/procurement-pack
          </Link>
        </p>

        <footer className="print-footer">
          Derived from internal commercial playbooks — buyer-safe summary.
        </footer>
      </article>
    </>
  );
}
