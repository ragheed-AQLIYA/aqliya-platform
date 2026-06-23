/**
 * Institutional use cases — vision/proof layer content.
 * @see docs/marketing/MARKETING_ROADMAP.md
 */

export type InstitutionalUseCase = {
  id: string;
  category: string;
  categoryColor: string;
  categoryBorder: string;
  categoryBg: string;
  title: string;
  icon: string;
  problem: string;
  traditionalState: string;
  aqliyaApproach: string;
  outcome: string;
  systemLink: string;
  systemLabel: string;
};

export const institutionalUseCases: InstitutionalUseCase[] = [
  {
    id: "audit-compliance",
    category: "AuditOS",
    categoryColor: "text-emerald-400",
    categoryBorder: "border-emerald-500/20",
    categoryBg: "bg-emerald-500/5",
    title: "التدقيق الداخلي والامتثال",
    icon: "◈",
    problem:
      "فرق التدقيق تقضي 60–70% من وقتها في جمع المعلومات يدوياً من وثائق مبعثرة عبر أنظمة متعددة — بدلاً من التحليل الفعلي.",
    traditionalState:
      "مراجع يقرأ مئات الصفحات يدوياً، يُعلّم عليها، يُنشئ ملخصات في Excel، ثم يعيد الكرة في الدورة التالية.",
    aqliyaApproach:
      "AuditOS يعالج مئات الوثائق المالية والتشغيلية، يُنشئ خريطة مخاطر مرتبطة بأدلة محددة، ويُنبّه المراجع على الانحرافات — مع سجل تدقيق كامل لكل نتيجة.",
    outcome:
      "تخفيض دورة جمع البيانات من أسابيع إلى ساعات، مع الحفاظ على المراجع الإنسانية كصاحب القرار النهائي.",
    systemLink: "/products/audit",
    systemLabel: "استكشف AuditOS",
  },
  {
    id: "decision-governance",
    category: "DecisionOS",
    categoryColor: "text-violet-400",
    categoryBorder: "border-violet-500/20",
    categoryBg: "bg-violet-500/5",
    title: "حوكمة القرارات المؤسسية",
    icon: "◉",
    problem:
      "القرارات المهمة تُتخذ في اجتماعات دون توثيق سياقها — من وافق، ما كان البديل، لماذا اختير هذا المسار. بعد ستة أشهر لا أحد يتذكر.",
    traditionalState:
      "دقائق اجتماع عامة، قرارات موزعة في رسائل بريد إلكتروني، ولا إمكانية لمراجعة منطق القرار عند الحاجة.",
    aqliyaApproach:
      "DecisionOS يُنشئ سجل قرارات منظم: السياق، الخيارات المدروسة، الأدلة الداعمة، المعتمدون، والنتائج — مع بحث وربط لاحق بين القرارات ذات الصلة.",
    outcome:
      "مؤسسة قادرة على تقديم تبرير موثق لأي قرار أمام مجلس الإدارة أو جهة التنظيم — بنقرات لا بساعات بحث.",
    systemLink: "/products/decision",
    systemLabel: "استكشف DecisionOS",
  },
  {
    id: "local-content",
    category: "LocalContentOS",
    categoryColor: "text-sky-400",
    categoryBorder: "border-sky-500/20",
    categoryBg: "bg-sky-500/5",
    title: "إدارة المحتوى المحلي والامتثال التنظيمي",
    icon: "◎",
    problem:
      "متطلبات المحتوى المحلي في العقود الحكومية والقطاعات المنظَّمة تتطلب رصداً مستمراً، تقارير دورية، وتوثيقاً يصعب الحفاظ عليه يدوياً مع توسع المشاريع.",
    traditionalState:
      "جداول Excel معقدة، بيانات سعودة مبعثرة، تقارير يدوية تُعدّ قبيل المواعيد النهائية مع مخاطر الخطأ البشري.",
    aqliyaApproach:
      "LocalContentOS يتتبع مسارات المحتوى المحلي في الوقت الفعلي، يُولّد تقارير الامتثال آلياً، ويُنبّه على الانحرافات قبل الاستحقاق.",
    outcome:
      "تقارير امتثال جاهزة في دقائق، مع سجل أدلة كامل يصمد أمام المراجعات التنظيمية.",
    systemLink: "/products/local-content",
    systemLabel: "استكشف LocalContentOS",
  },
  {
    id: "institutional-memory",
    category: "مخصص / Intelligence Core",
    categoryColor: "text-amber-400",
    categoryBorder: "border-amber-500/20",
    categoryBg: "bg-amber-500/5",
    title: "ذاكرة المؤسسة وإدارة المعرفة",
    icon: "◌",
    problem:
      "عندما يترك موظف خبير المؤسسة، يأخذ معه سنوات من السياق والمعرفة غير الموثقة. المؤسسة تبدأ من الصفر في كل دورة.",
    traditionalState:
      "وثائق إجراءات قديمة، ملفات SharePoint مهجورة، ومعرفة ضمنية موزعة على رؤوس الأفراد.",
    aqliyaApproach:
      "نظام مخصص فوق Intelligence Core يُنشئ قاعدة معرفة مؤسسية حية: السياسات، القرارات التاريخية، الدروس المستفادة، وأفضل الممارسات — قابلة للبحث والربط.",
    outcome:
      "معرفة المؤسسة تصبح أصلاً إنتاجياً لا ذاكرة فردية — جاهزة للموظف الجديد في أسبوع لا في أشهر.",
    systemLink: "/custom-product",
    systemLabel: "تصميم نظام مخصص",
  },
  {
    id: "contract-monitoring",
    category: "مخصص / AuditOS",
    categoryColor: "text-amber-400",
    categoryBorder: "border-amber-500/20",
    categoryBg: "bg-amber-500/5",
    title: "مراقبة العقود وإدارة الالتزامات",
    icon: "◐",
    problem:
      "مؤسسات تُدير عشرات أو مئات العقود تواجه صعوبة في تتبع الالتزامات، مواعيد الاستحقاق، وشروط التجديد — تكتشف الانتهاكات بعد وقوعها.",
    traditionalState:
      "قائمة بالعقود في Excel، تنبيهات يدوية في التقويم، ومراجعات سنوية تفقد فيها الكثير من التفاصيل الحرجة.",
    aqliyaApproach:
      "نظام يعالج نصوص العقود ويستخرج الالتزامات والمواعيد والشروط، يُنشئ لوحة مراقبة حية، ويُنبّه المسؤولين قبل الاستحقاقات.",
    outcome:
      "لا التزام يُفوَّت، كل انتهاك محتمل يُعالَج مسبقاً، وسجل كامل لكل تعديل أو تجديد.",
    systemLink: "/custom-product",
    systemLabel: "تصميم نظام مخصص",
  },
  {
    id: "regulatory-readiness",
    category: "مخصص / DecisionOS",
    categoryColor: "text-amber-400",
    categoryBorder: "border-amber-500/20",
    categoryBg: "bg-amber-500/5",
    title: "الجاهزية التنظيمية والرقابية",
    icon: "◑",
    problem:
      "التفتيش التنظيمي المفاجئ أو طلب الإفصاح يُربك المؤسسات التي لم تبنِ منهجية توثيق منتظمة — يستغرق إعداد الملف أسابيع.",
    traditionalState:
      "إعداد ملفات مكثف قبل كل زيارة تنظيمية، توثيق متأخر، وعدم تناسق في الروايات.",
    aqliyaApproach:
      "توثيق مستمر وآني لكل قرار وإجراء، مع بنية Evidence Chain تُتيح استخراج ملف امتثال متكامل في أي وقت — لا عند الحاجة فحسب.",
    outcome:
      "التفتيش يُصبح روتيناً لا أزمة. الملف جاهز دائماً، موثوق، ومرتبط بالأدلة الأصلية.",
    systemLink: "/governance",
    systemLabel: "بنية الحوكمة",
  },
  {
    id: "procurement-intelligence",
    category: "مخصص / Intelligence Core",
    categoryColor: "text-amber-400",
    categoryBorder: "border-amber-500/20",
    categoryBg: "bg-amber-500/5",
    title: "ذكاء المشتريات ودعم قرار الترسية",
    icon: "◒",
    problem:
      "لجان التقييم في المشتريات تغرق في مئات الصفحات من العروض التقنية والمالية — التقييم يستغرق أسابيع وتُفوَّت فيه تفاصيل مهمة.",
    traditionalState:
      "قراءة يدوية، ملاحظات شخصية، ومقارنات في جداول يبنيها كل عضو لجنة بطريقته.",
    aqliyaApproach:
      "نظام يُحلل وثائق العروض ويستخرج نقاط المقارنة المحددة في معايير التقييم، يُنشئ مصفوفة مقارنة موثقة، ويُنبّه على الانحرافات أو الثغرات.",
    outcome: "قرار ترسية مدعوم بأدلة موثقة، قابل للمراجعة، ومحمي من الطعن.",
    systemLink: "/custom-product",
    systemLabel: "تصميم نظام مخصص",
  },
];
