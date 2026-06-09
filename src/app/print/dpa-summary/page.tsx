import Link from "next/link";
import type { Metadata } from "next";
import { PrintToolbar } from "@/components/marketing/print-toolbar";

export const metadata: Metadata = {
  title: "ملخص DPA — PDF | AQLIYA",
  description: "ملخص اتفاقية معالجة البيانات على مستوى المبادئ.",
};

export default function PrintDpaSummaryPage() {
  const generated = new Date().toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <PrintToolbar title="طباعة / حفظ PDF" />
      <article className="print-doc" dir="rtl">
        <p className="print-meta">AQLIYA — ملخص DPA · {generated}</p>
        <h1>ملخص اتفاقية معالجة البيانات (DPA)</h1>
        <p>
          هذا الملخص للتقييم فقط. النسخة الملزمة تُعدّ وتُوقَّع مع العقد أو SOW
          البايلوت/الإنتاج.
        </p>

        <h2>الأطراف</h2>
        <ul>
          <li>العميل (Controller): المؤسسة المشتريّة</li>
          <li>المعالج (Processor): AQLIYA — منصة SaaS مُدارة</li>
        </ul>

        <h2>موضوع المعالجة</h2>
        <p>
          بيانات تشغيلية يقدّمها العميل لاستخدام أنظمة التشغيل المفعّلة
          (AuditOS، DecisionOS، LocalContentOS، إلخ): مستندات، بيانات مالية،
          سجلات قرارات، بيانات مستخدمين مؤسسيين.
        </p>

        <h2>التزامات AQLIYA (ملخص)</h2>
        <ul>
          <li>معالجة البيانات فقط حسب تعليمات العميل والعقد</li>
          <li>RBAC، عزل المستأجرين، سجل تدقيق للعمليات الحساسة</li>
          <li>عدم استخدام بيانات العميل لتدريب نماذج عامة دون موافقة</li>
          <li>إشعار العميل بالتغييرات الجوهرية في المعالجين الفرعيين</li>
          <li>دعم طلبات الحذف/التصدير ضمن إطار العقد والقانون</li>
        </ul>

        <h2>التزامات العميل (ملخص)</h2>
        <ul>
          <li>صلاحية رفع البيانات وتحديد المستخدمين المصرّح لهم</li>
          <li>عدم إدخال بيانات خارج نطاق البايلوت المتفق عليه</li>
          <li>المراجعة البشرية للمخرجات قبل الاعتماد النهائي</li>
        </ul>

        <h2>الأمن والحوادث</h2>
        <p>
          إجراءات أمن تقنية وتنظيمية موثقة في ملخص الأمن. إبلاغ العميل
          بالحوادث الجوهرية وفق SLA متفق عليها في العقد.
        </p>

        <p>
          المعالجون الفرعيون:{" "}
          <Link href="https://aqliya.com/print/subprocessors">
            aqliya.com/print/subprocessors
          </Link>
        </p>

        <footer className="print-footer">
          ليس DPA ملزماً — اطلب النسخة القانونية الكاملة عبر procurement-pack.
        </footer>
      </article>
    </>
  );
}
