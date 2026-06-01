import { NextResponse } from "next/server";
import { z } from "zod";

const MAX_BODY_BYTES = 50_000;
const MAX_ARRAY_ITEMS = 50;
const MAX_FIELD = 2000;

const schema = z.object({
  orgName: z.string().min(1, "مطلوب").max(MAX_FIELD),
  industry: z.string().min(1).max(MAX_FIELD),
  orgSize: z.string().min(1).max(MAX_FIELD),
  country: z.string().min(1).max(MAX_FIELD),
  systemCategory: z.string().min(1).max(MAX_FIELD),
  challenges: z.array(z.string().max(MAX_FIELD)).max(MAX_ARRAY_ITEMS),
  environment: z.array(z.string().max(MAX_FIELD)).max(MAX_ARRAY_ITEMS),
  outcomes: z.array(z.string().max(MAX_FIELD)).max(MAX_ARRAY_ITEMS),
  intent: z.string().min(1).max(MAX_FIELD),
  contactName: z.string().min(1).max(MAX_FIELD),
  contactRole: z.string().max(MAX_FIELD),
  contactEmail: z.string().email().max(MAX_FIELD),
  contactPhone: z.string().min(1).max(MAX_FIELD),
  notes: z.string().max(5000),
});

export async function POST(request: Request) {
  try {
    const contentLength = request.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "الحمولة كبيرة جدًا." },
        { status: 413 },
      );
    }
    const body = await request.json();
    const data = schema.parse(body);

    // Log for production monitoring (visible in Vercel Logs)
    console.log(
      `[CustomProductRequest] ${data.orgName} | ${data.systemCategory} | ${data.contactEmail}`,
    );

    // Resend integration — activate by setting RESEND_API_KEY env var
    const resendKey = process.env.RESEND_API_KEY;

    if (resendKey) {
      const receiverEmail =
        process.env.REQUEST_RECEIVER_EMAIL ??
        (process.env.NODE_ENV === "development" ? "ragheed@aqliya.com" : "");
      const senderEmail =
        process.env.REQUEST_SENDER_EMAIL ??
        (process.env.NODE_ENV === "development" ? "requests@aqliya.com" : "");

      if (!receiverEmail || !senderEmail) {
        console.warn(
          "[CustomProductSubmit] Missing REQUEST_RECEIVER_EMAIL or REQUEST_SENDER_EMAIL — skipping email",
        );
      } else {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `AQLIYA Requests <${senderEmail}>`,
            to: [receiverEmail],
            replyTo: data.contactEmail,
            subject: `طلب تصميم نظام مؤسسي | ${data.orgName}`,
            html: buildEmailHtml(data),
          }),
        });

        if (!res.ok) {
          console.error("[ResendError]", await res.text());
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "بيانات غير صالحة", details: err.issues },
        { status: 400 },
      );
    }
    console.error("[CustomProductSubmitError]", err);
    return NextResponse.json(
      { error: "حدث خطأ. يرجى المحاولة مرة أخرى." },
      { status: 500 },
    );
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildEmailHtml(data: z.infer<typeof schema>): string {
  const c2l = (id: string, list: { id: string; label: string }[]) =>
    list.find((x) => x.id === id)?.label ?? id;

  const industries = [
    { id: "financial_services", label: "الخدمات المالية" },
    { id: "audit_accounting", label: "المراجعة والمحاسبة" },
    { id: "consulting", label: "الاستشارات" },
    { id: "oil_gas", label: "النفط والغاز" },
    { id: "construction", label: "الإنشاءات" },
    { id: "retail_wholesale", label: "التجزئة والجملة" },
    { id: "healthcare", label: "الرعاية الصحية" },
    { id: "technology", label: "التقنية" },
    { id: "manufacturing", label: "التصنيع" },
    { id: "logistics", label: "الخدمات اللوجستية" },
    { id: "government", label: "القطاع الحكومي" },
    { id: "education", label: "التعليم" },
    { id: "real_estate", label: "العقارات" },
    { id: "other", label: "قطاع آخر" },
  ];
  const categories = [
    { id: "decision", label: "أنظمة اتخاذ القرار" },
    { id: "simulation", label: "أنظمة المحاكاة" },
    { id: "sales", label: "أنظمة المبيعات" },
    { id: "audit", label: "أنظمة المراجعة والتدقيق" },
    { id: "local_content", label: "أنظمة المحتوى المحلي" },
    { id: "custom", label: "نظام مؤسسي مخصص" },
  ];
  const intents = [
    { id: "exploratory", label: "نقاش استكشافي" },
    { id: "demo", label: "طلب عرض توضيحي" },
    { id: "pilot", label: "مشروع تجريبي" },
    { id: "full_build", label: "بناء نظام كامل" },
  ];
  const allChallenges = [
    { id: "slow_decisions", label: "بطء في اتخاذ القرارات" },
    { id: "fragmented_workflows", label: "إجراءات متفرقة" },
    { id: "manual_audit", label: "مراجعة وتدقيق يدوية" },
    { id: "weak_traceability", label: "ضعف التتبع والمراجعة" },
    { id: "disconnected_data", label: "بيانات منفصلة غير متصلة" },
    { id: "forecasting_gaps", label: "ضعف القدرة على التنبؤ" },
    { id: "sales_visibility", label: "غياب رؤية واضحة لأداء المبيعات" },
    { id: "local_content_compliance", label: "صعوبة الالتزام بالمحتوى المحلي" },
    { id: "reporting_burden", label: "عبء إعداد التقارير" },
    { id: "excel_dependency", label: "اعتماد مفرط على Excel" },
    { id: "other_challenge", label: "تحديات أخرى" },
  ];

  return `<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><style>
    body { font-family: system-ui, sans-serif; background: #f8f9fa; padding: 24px; color: #111; }
    .card { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 16px; border: 1px solid #e5e7eb; }
    h2 { font-size: 16px; margin: 0 0 12px 0; color: #137dc5; }
    .label { font-size: 12px; color: #6b7280; margin-bottom: 2px; }
    .value { font-size: 14px; font-weight: 500; }
    .chip { display: inline-block; background: #eef7fc; color: #137dc5; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin: 4px; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 16px 0; }
  </style></head><body>
    <div class="card"><h2>معلومات المؤسسة</h2>
      <div class="label">المؤسسة</div><div class="value">${escapeHtml(data.orgName)}</div>
      <div class="label" style="margin-top:8px">القطاع</div><div class="value">${escapeHtml(c2l(data.industry, industries))}</div>
      <div class="label" style="margin-top:8px">الحجم</div><div class="value">${escapeHtml(data.orgSize)}</div>
      <div class="label" style="margin-top:8px">الدولة</div><div class="value">${escapeHtml(data.country)}</div>
    </div>
    <div class="card"><h2>نوع النظام المطلوب</h2><div class="value">${escapeHtml(c2l(data.systemCategory, categories))}</div></div>
    <div class="card"><h2>التحديات التشغيلية</h2>${data.challenges.map((c) => `<span class="chip">${escapeHtml(c2l(c, allChallenges))}</span>`).join("")}</div>
    <div class="card"><h2>هدف التواصل</h2><div class="value">${escapeHtml(c2l(data.intent, intents))}</div></div>
    <hr>
    <div class="card"><h2>معلومات التواصل</h2>
      <div class="label">الاسم</div><div class="value">${escapeHtml(data.contactName)}</div>
      <div class="label" style="margin-top:8px">المنصب</div><div class="value">${escapeHtml(data.contactRole)}</div>
      <div class="label" style="margin-top:8px">البريد الإلكتروني</div><div class="value">${escapeHtml(data.contactEmail)}</div>
      <div class="label" style="margin-top:8px">الهاتف</div><div class="value">${escapeHtml(data.contactPhone)}</div>
    </div>
    ${data.notes ? `<div class="card"><h2>ملاحظات</h2><div class="value">${escapeHtml(data.notes)}</div></div>` : ""}
    <p style="font-size:11px;color:#9ca3af;text-align:center;margin-top:24px">مرسل من AQLIYA Custom Product Request · https://aqliya.com/custom-product</p>
  </body></html>`;
}
