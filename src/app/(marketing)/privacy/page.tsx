import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | AQLIYA",
  description:
    "سياسة خصوصية مؤسسية لمنصة عقلية — تغطي ملكية البيانات، إقامة البيانات، التعامل مع الذكاء الاصطناعي، والحقوق المؤسسية للعملاء.",
};

const sections = [
  {
    id: "overview",
    title: "نظرة عامة",
    content: `عقلية منصة ذكاء مؤسسي مبنية للمؤسسات التي تتعامل مع بيانات حساسة وقرارات ذات أثر مؤسسي. هذه السياسة تصف كيف نجمع البيانات ونخزنها ونعالجها ونحميها — بشفافية كاملة ودون ادعاءات مبالغ فيها.`,
  },
  {
    id: "data-we-collect",
    title: "البيانات التي نجمعها",
    items: [
      {
        label: "بيانات تشغيل المنصة",
        detail:
          "الوثائق والبيانات التي ترفعها مؤسستك لمعالجتها داخل أنظمة عقلية (AuditOS, DecisionOS, LocalContentOS). هذه البيانات ملك مؤسستك وتُعالَج حصراً داخل بيئتك المعزولة.",
      },
      {
        label: "بيانات الحسابات والمستخدمين",
        detail:
          "أسماء المستخدمين، عناوين البريد الإلكتروني المؤسسي، الأدوار الوظيفية، وسجلات الجلسات — لتمكين نظام RBAC والتحقق من الهوية.",
      },
      {
        label: "سجلات التدقيق والنشاط",
        detail:
          "كل إجراء داخل المنصة يُسجَّل في سجل تدقيق غير قابل للتعديل. هذه السجلات ملك مؤسستك وتُتاح لك للتصدير في أي وقت.",
      },
      {
        label: "بيانات الاستخدام التشخيصية",
        detail:
          "بيانات مجهولة الهوية حول أداء المنصة وأخطائها التقنية — لتحسين استقرار الخدمة. لا تحتوي على محتوى أعمال أو بيانات شخصية.",
      },
    ],
  },
  {
    id: "data-we-dont",
    title: "ما لا نفعله",
    items: [
      {
        label: "لا تدريب على بياناتك",
        detail:
          "بيانات مؤسستك لا تُستخدم بأي شكل لتدريب نماذج ذكاء اصطناعي — سواء نماذجنا الداخلية أو نماذج أطراف ثالثة.",
      },
      {
        label: "لا مشاركة بين المستأجرين",
        detail:
          "بيانات مؤسستك معزولة تماماً. لا يمكن لأي مستأجر آخر الوصول إليها أو الاستفادة منها بأي صورة.",
      },
      {
        label: "لا بيع للبيانات",
        detail:
          "لا نبيع ولا نؤجر ولا نتاجر ببيانات العملاء لأي طرف ثالث تحت أي ظرف.",
      },
      {
        label: "لا تحليل تجاري لبيانات العملاء",
        detail:
          "لا نستخدم محتوى وثائقك أو بيانات قراراتك لإجراء تحليلات تجارية خاصة بنا أو لأغراض التسويق.",
      },
    ],
  },
  {
    id: "ai-processing",
    title: "معالجة الذكاء الاصطناعي",
    content: `عندما تُرسَل بياناتك إلى نموذج ذكاء اصطناعي (سواء نموذج داخلي أو خارجي)، تُعالَج بشكل فوري وآني. لا يحتفظ مزودو النماذج بهذه البيانات لأغراض التدريب بموجب عقود خدمة مؤسسية مفعّلة. نتعامل مع نماذج الذكاء الاصطناعي كأدوات تحليل آنية — لا كمستودعات بيانات دائمة.`,
  },
  {
    id: "data-residency",
    title: "إقامة البيانات والاستضافة",
    content: `عقلية تستضيف البيانات بشكل افتراضي في منطقة سحابية سعودية أو خليجية. لا يتم نقل البيانات خارج المنطقة المتفق عليها بدون موافقة صريحة مكتوبة من العميل. نحن ملتزمون بمتطلبات إقامة البيانات المحلية ونتعاون مع فريقك للتحقق من ذلك.`,
  },
  {
    id: "your-rights",
    title: "حقوق مؤسستك",
    items: [
      {
        label: "حق الوصول الكامل",
        detail: "يمكنك طلب تقرير كامل بجميع البيانات التي نحتفظ بها عن مؤسستك في أي وقت.",
      },
      {
        label: "حق التصحيح",
        detail: "يمكنك طلب تصحيح أي بيانات غير دقيقة متعلقة بمؤسستك.",
      },
      {
        label: "حق الحذف الكامل",
        detail: "عند إنهاء التعاقد، يمكنك طلب حذف جميع بيانات مؤسستك مع تقديم إثبات مكتوب بالتنفيذ خلال 30 يوماً.",
      },
      {
        label: "حق نقل البيانات",
        detail: "يمكنك طلب تصدير كامل لبياناتك بصيغ قابلة للقراءة الآلية في أي وقت.",
      },
    ],
  },
  {
    id: "retention",
    title: "سياسة الاحتفاظ بالبيانات",
    content: `مدة الاحتفاظ بالبيانات تُحدَّد بالاتفاق مع كل عميل في عقد الخدمة. سجلات التدقيق تُحتفظ بها لمدة لا تقل عن 7 سنوات لأغراض الامتثال المؤسسي إلا إذا طلب العميل خلاف ذلك. بعد انتهاء مدة الاحتفاظ المتفق عليها، تُحذف البيانات بشكل آمن مع تقديم شهادة حذف.`,
  },
  {
    id: "security-measures",
    title: "الإجراءات الأمنية",
    content: `نطبق TLS 1.3 لجميع الاتصالات وتشفيراً للبيانات أثناء التخزين. الوصول إلى بيانات العملاء محصور بموظفين معتمَدين بموجب ضرورة العمل، ويُسجَّل كل وصول. للمزيد من التفاصيل حول البنية الأمنية الكاملة، راجع صفحة الأمن المؤسسي.`,
  },
  {
    id: "updates",
    title: "تحديثات السياسة",
    content: `أي تغيير جوهري على هذه السياسة يُبلَّغ به العملاء كتابياً قبل 30 يوماً من تطبيقه. التغييرات لا تؤثر على البيانات الحالية بأثر رجعي إلا بموافقة العميل.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-aqliya-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-aqliya-cyan" />
              سياسة الخصوصية
            </span>
            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl">
              خصوصية مؤسسية واضحة
            </h1>
            <p className="mt-5 text-base leading-8 text-white/62">
              لا وعود مبهمة. لا ادعاءات مبالغ فيها. هذه سياسة خصوصية مكتوبة
              لمؤسسات تتعامل مع بيانات حساسة وتحتاج إجابات واضحة.
            </p>
            <p className="mt-4 text-xs text-white/35">
              آخر تحديث: مايو 2025 — هذه السياسة سارية على منصة عقلية وجميع أنظمتها
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="space-y-12">
            {sections.map((section) => (
              <div key={section.id} className="border-b border-white/5 pb-12 last:border-0">
                <h2 className="text-xl font-black text-foreground">{section.title}</h2>

                {section.content && (
                  <p className="mt-4 text-base leading-8 text-muted-foreground">
                    {section.content}
                  </p>
                )}

                {section.items && (
                  <div className="mt-5 space-y-4">
                    {section.items.map((item) => (
                      <div key={item.label} className="glass-card-light rounded-xl p-5">
                        <p className="font-bold text-foreground">{item.label}</p>
                        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                          {item.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Block */}
          <div className="mt-16 rounded-2xl border border-border bg-muted/30 p-8 text-center">
            <h2 className="text-xl font-black text-foreground">
              أسئلة حول الخصوصية أو البيانات؟
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              فريقنا التقني جاهز للإجابة على أي سؤال مؤسسي حول كيفية تعاملنا مع
              بيانات مؤسستك — قبل التوقيع أو بعده.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact" className="btn-primary px-6">
                تواصل مع الفريق التقني
              </Link>
              <Link href="/security" className="btn-outline px-6">
                بنية الأمن المؤسسي
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
