"use client"

import { GuidedTour } from "./guided-tour"

const AUDIT_TOUR_STEPS = [
  {
    target: '[data-tour="engagements"]',
    title: "مهام التدقيق",
    content: "هنا يمكنك إنشاء وإدارة مهام التدقيق. ابدأ بإنشاء مهمة جديدة لإضافة عميل.",
  },
  {
    target: '[data-tour="trial-balance"]',
    title: "ميزان المراجعة",
    content: "ارفع ميزان المراجعة للعميل. النظام سيقوم بتحليل الحسابات تلقائياً.",
  },
  {
    target: '[data-tour="evidence"]',
    title: "ملف الأدلة",
    content: "جميع المستندات المرفقة والأدلة المدققة متوفرة هنا مع إمكانية التحميل والمراجعة.",
  },
  {
    target: '[data-tour="findings"]',
    title: "نتائج التدقيق",
    content: "استعرض نتائج التدقيق والتوصيات. يمكنك الموافقة أو طلب تعديل قبل إصدار التقرير النهائي.",
  },
  {
    target: '[data-tour="export"]',
    title: "التقارير والتصدير",
    content: "صدّر تقارير التدقيق النهائية بصيغ مختلفة بعد اعتمادها من المراجع المسؤول.",
  },
]

interface AuditTourProps {
  onComplete?: () => void
}

export function AuditTour({ onComplete }: AuditTourProps) {
  return (
    <GuidedTour tourKey="audit" steps={AUDIT_TOUR_STEPS} onComplete={onComplete} />
  )
}
