import type { Metadata } from "next";
import { StartHubPage } from "@/components/marketing/v2/start-hub-page";
import { buyerJourneys, universalJourneySteps } from "@/lib/marketing/buyer-journeys";
import {
  engagementModelsAr,
  processPhasesAr,
  processPrinciplesAr,
} from "@/lib/marketing/start-hub-content";

export const metadata: Metadata = {
  title: "من أين تبدأ؟ | AQLIYA",
  description:
    "اختر دورك — قيادة، مالية، تقنية، تدقيق، مشتريات، أو حكومة — واحصل على مسار واضح للإثبات والتواصل.",
};

export default function StartPage() {
  return (
    <StartHubPage
      locale="ar"
      journeys={buyerJourneys}
      universalSteps={universalJourneySteps}
      engagementModels={engagementModelsAr}
      processPhases={processPhasesAr}
      processPrinciples={processPrinciplesAr}
      copy={{
        heroEyebrow: "مسار المشتري",
        heroTitle: "من أين تبدأ مع عقلية؟",
        heroSubtitle:
          "لا نطلب الإيمان بالكلام. اختر دورك — نرشدك إلى المحتوى المناسب خلال دقائق، ثم تقرر بالأدلة.",
        chooseRole: "اختر دورك",
        chooseRoleHint: "كل مسار: ٣ خطوات محتوى → ثم جلسة تشخيص عند الجاهزية.",
        engagementTitle: "نماذج التعاون",
        engagementHint: "من تشخيص مجاني إلى تفعيل مؤسسي — بدون عقد واسع قبل الإثبات.",
        processTitle: "كيف نعمل",
        processHint: "نفس المنهجية لكل دور — من التشخيص إلى التوسع.",
        proof: "مركز الإثبات",
        useCases: "حالات الاستخدام",
        contactHref: "/contact",
      }}
    />
  );
}
