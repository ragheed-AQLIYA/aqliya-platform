import Link from "next/link";
import type { Metadata } from "next";
import { PrintToolbar } from "@/components/marketing/print-toolbar";
import { publicOsStatus, publicEngagementGate } from "@/lib/marketing/public-status";

export const metadata: Metadata = {
  title: "الإحاطة التنفيذية — PDF | AQLIYA",
  description: "ملخص تنفيذي قابل للطباعة والتصدير PDF.",
};

export default function PrintExecutiveBriefPage() {
  const generated = new Date().toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <PrintToolbar title="طباعة / حفظ PDF" />
      <article className="print-doc" dir="rtl">
        <p className="print-meta">AQLIYA — الإحاطة التنفيذية · {generated}</p>
        <h1>منصة الذكاء المؤسسي المحكوم</h1>
        <p className="text-base font-semibold text-slate-700">
          الذكاء يساعد. الإنسان يقرر. الدليل يحكم.
        </p>

        <h2>ما هي AQLIYA</h2>
        <p>
          منصة ذكاء مؤسسي خاص ومحكوم. طبقة أساسية مشتركة (AQLIYA Intelligence
          Core) تستضيف أنظمة تشغيل متخصصة — AuditOS، DecisionOS، LocalContentOS
          — مع RBAC، Evidence Graph، بوابات سير العمل، وسجل تدقيق غير قابل
          للتعديل.
        </p>

        <h2>ليست AQLIYA</h2>
        <ul>
          <li>ليس chatbot عامًا أو CRM</li>
          <li>ليس AuditOS فقط — المنصة أوسع من منتج واحد</li>
          <li>لا قرارات آليّة نهائية — AI مسودة فقط</li>
        </ul>

        <h2>حالة أنظمة التشغيل</h2>
        <ul>
          <li>AuditOS — {publicOsStatus.auditOS.label}</li>
          <li>DecisionOS — {publicOsStatus.decisionOS.label}</li>
          <li>LocalContentOS — {publicOsStatus.localContentOS.label}</li>
        </ul>

        <h2>نماذج النشر</h2>
        <ul>
          <li>Cloud Managed — متاح (الافتراضي)</li>
          <li>Private / On-Prem — استراتيجي، غير حزمة إنتاج</li>
          <li>Air-Gapped — استراتيجي فقط</li>
        </ul>

        <h2>الجاهزية</h2>
        <p>{publicEngagementGate}</p>

        <h2>غير متاح / غير مُعلَن</h2>
        <ul>
          <li>شهادات SOC2 أو ISO (حتى يتم الحصول عليها)</li>
          <li>حزمة On-Prem أو Air-Gapped للإنتاج</li>
          <li>تكامل ERP خارجي كمنتج جاهز</li>
        </ul>

        <h2>الخطوة التالية</h2>
        <p>
          جلسة تشخيص → تقييم تشغيلي محدود → تقرير قرار بالأدلة. لا عقد واسع قبل
          الإثبات.
        </p>
        <p>
          aqliya.com ·{" "}
          <Link href="https://aqliya.com/contact">aqliya.com/contact</Link>
        </p>

        <footer className="print-footer">
          وثيقة معلوماتية — ليست عرضًا ملزمًا أو شهادة امتثال. AI assists.
          Humans decide. Evidence governs.
        </footer>
      </article>
    </>
  );
}
