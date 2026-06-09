import Link from "next/link";
import type { Metadata } from "next";
import { PrintToolbar } from "@/components/marketing/print-toolbar";

export const metadata: Metadata = {
  title: "إقامة البيانات — PDF | AQLIYA",
  description: "ملخص إقامة البيانات والنشر الافتراضي لعقلية.",
};

export default function PrintDataResidencyPage() {
  const generated = new Date().toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <PrintToolbar title="طباعة / حفظ PDF" />
      <article className="print-doc" dir="rtl">
        <p className="print-meta">AQLIYA — إقامة البيانات · {generated}</p>
        <h1>إقامة البيانات — النشر السحابي الافتراضي</h1>

        <h2>الافتراضي اليوم</h2>
        <ul>
          <li>النشر السحابي المُدار (Cloud Managed) هو النموذج التشغيلي المتاح</li>
          <li>
            البنية على AWS — المنطقة الأساسية: me-south-1 (البحرين) مع DR في
            eu-central-1 حسب إعداد الإنتاج
          </li>
          <li>قاعدة البيانات: RDS PostgreSQL Multi-AZ داخل حساب العميل المنطقي (tenant isolation)</li>
          <li>الملفات: S3 مع صلاحيات وصول محكومة</li>
        </ul>

        <h2>ملكية البيانات</h2>
        <p>
          بيانات العميل مملوكة للعميل. لا تُستخدم لتدريب نماذج خارجية دون
          اتفاق مكتوب. حذف البيانات يُناقش في DPA وخطة offboarding عند
          انتهاء العقد.
        </p>

        <h2>ما ليس متاحاً كحزمة إنتاج</h2>
        <ul>
          <li>On-Premises أو Air-Gapped كمنتج جاهز — استراتيجي / تقييم فقط</li>
          <li>استضافة محلية داخل KSA خارج AWS — يُقيّم case-by-case بعد البايلوت</li>
        </ul>

        <h2>للمشتريات الحكومية</h2>
        <p>
          نناقش متطلبات السيادة والامتثال بصدق في جلسة تقنية. لا نعد بنشر
          Air-Gapped قبل اكتمال الحزمة وتأكيدها.
        </p>
        <p>
          <Link href="https://aqliya.com/procurement-pack">
            aqliya.com/procurement-pack
          </Link>
        </p>

        <footer className="print-footer">
          وثيقة معلوماتية — تفاصيل العقد والمنطقة النهائية تُثبت في SOW/DPA.
        </footer>
      </article>
    </>
  );
}
