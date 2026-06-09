import Link from "next/link";
import type { Metadata } from "next";
import { PrintToolbar } from "@/components/marketing/print-toolbar";

export const metadata: Metadata = {
  title: "نموذج نطاق البايلوت — PDF | AQLIYA",
  description: "قالب SOW مختصر لبايلوت AuditOS محكوم.",
};

export default function PrintPilotSowTemplatePage() {
  const generated = new Date().toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <PrintToolbar title="طباعة / حفظ PDF" />
      <article className="print-doc" dir="rtl">
        <p className="print-meta">AQLIYA — نموذج SOW بايلوت · {generated}</p>
        <h1>نموذج نطاق بايلوت تقييمي (SOW)</h1>
        <p>
          قالب للمناقشة — ليس عقداً نهائياً. يُخصص مع العميل قبل Kickoff.
        </p>

        <h2>1. الهدف</h2>
        <p>
          تقييم قيمة AuditOS على <strong>ارتباط واحد</strong> (أو سير عمل
          واحد محدد) خلال 2–4 أسابيع — مجاناً — مع تقرير Go/No-Go مكتوب.
        </p>

        <h2>2. النطاق الم included</h2>
        <ul>
          <li>سير عمل: من ميزان المراجعة → تصنيف → مسودات → أدلة → مراجعة → حزمة (حسب الاتفاق)</li>
          <li>مستخدمون: حتى [N] مستخدمين محددين مسبقاً</li>
          <li>بيئة: Cloud Managed — tenant معزول</li>
          <li>دعم: kickoff + checkpoint أسبوعي 30 دقيقة</li>
        </ul>

        <h2>3. خارج النطاق</h2>
        <ul>
          <li>تكامل ERP / أنظمة خارجية</li>
          <li>On-Prem أو Air-Gapped</li>
          <li>عدة ارتباطات متزامنة أو منتجات إضافية (DecisionOS، إلخ) دون SOW منفصل</li>
          <li>رأي تدقيق أو اعتماد مهني — AQLIYA أداة مساعدة فقط</li>
        </ul>

        <h2>4. معايير النجاح (28 بُعداً)</h2>
        <p>
          تُستمد من{" "}
          <Link href="https://aqliya.com/pilot-proof">/pilot-proof</Link> —
          يختار العميل وAQLIYA 5–8 معايير حاسمة قبل البدء.
        </p>

        <h2>5. المخرجات</h2>
        <ul>
          <li>تقرير Go/No-Go: Proceed | Revise | Stop</li>
          <li>ملخص أدلة (screenshots / exports على بيانات العميل)</li>
          <li>توصية نشر إنتاج إن Proceed</li>
        </ul>

        <h2>6. المسؤولية والذكاء الاصطناعي</h2>
        <p>
          AI assists. Humans decide. Evidence governs. المؤسسة العميلة تبقى
          مسؤولة عن القرارات المهنية والاعتمادات النهائية.
        </p>

        <footer className="print-footer">
          اطلب جلسة تشخيص لتخصيص SOW: aqliya.com/contact
        </footer>
      </article>
    </>
  );
}
