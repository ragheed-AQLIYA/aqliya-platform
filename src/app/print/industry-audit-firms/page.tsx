import Link from "next/link";
import type { Metadata } from "next";
import { PrintToolbar } from "@/components/marketing/print-toolbar";

export const metadata: Metadata = {
  title: "قطاع مكاتب المراجعة — PDF | AQLIYA",
  description: "ملخص قطاعي لمكاتب المراجعة — AuditOS كإسفين تجاري.",
};

export default function PrintIndustryAuditFirmsPage() {
  const generated = new Date().toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <PrintToolbar title="طباعة / حفظ PDF" />
      <article className="print-doc" dir="rtl">
        <p className="print-meta">AQLIYA — قطاع المراجعة · {generated}</p>
        <h1>مكاتب المراجعة — مسار تشغيل محكوم</h1>

        <h2>المشكلة</h2>
        <p>
          Excel + بريد + WhatsApp + ملفات متفرقة = لا سجل قرار، لا سلسلة أدلة
          كاملة، وصعوبة ISQM1/ISA في التوثيق.
        </p>

        <h2>الحل: AuditOS على AQLIYA Core</h2>
        <p>
          من قبول العميل إلى حزمة الارتباط — سير عمل واحد مع RBAC، Evidence
          Vault، Human Gates، وسجل تدقيق غير قابل للتعديل.
        </p>

        <h2>ما يُثبت في التقييم التشغيلي</h2>
        <ul>
          <li>رفع ميزان مراجعة + توازن فوري</li>
          <li>توجيه IFRS/SOCPA مع مراجعة بشرية — لا توجيه آلي نهائي</li>
          <li>مسودات قوائم وإيضاحات مرتبطة بالمصدر</li>
          <li>بوابات اعتماد قبل التصدير</li>
          <li>Audit Trail لكل إجراء</li>
        </ul>

        <h2>الحركة التجارية</h2>
        <p>
          ديمو تفاعلي (10 دقائق) → جلسة تشخيص (45 دقيقة) → تقييم تشغيلي مجاني
          على ارتباط واحد → قرار بالأدلة → تفعيل مؤسسي مدفوع.
        </p>

        <h2>ما لا نعد به</h2>
        <ul>
          <li>استبدال المدقق أو إصدار رأي تدقيق</li>
          <li>شهادة SOC2/ISO (حتى الحصول عليها)</li>
          <li>CaseWare/ERP replacement كامل في تقييم واحد</li>
        </ul>

        <p>
          الديمو:{" "}
          <Link href="https://aqliya.com/auditos">aqliya.com/auditos</Link>
          {" · "}
          حزمة المشتريات:{" "}
          <Link href="https://aqliya.com/procurement-pack">
            aqliya.com/procurement-pack
          </Link>
        </p>

        <footer className="print-footer">
          Industry brief #1 — Government and enterprise briefs follow reference #1.
        </footer>
      </article>
    </>
  );
}
