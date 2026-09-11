import type { Metadata } from "next";
import { DeploymentDepthPage } from "@/components/marketing/v2/deployment-depth-page";
import { deploymentModelsAr } from "@/lib/marketing/deployment-page-content";
import { buildAlternates } from "@/lib/marketing/seo";

export const metadata: Metadata = {
  title: "بيئات النشر",
  description:
    "سحابة مُدارة (متاح)، خوادم خاصة (قيد التخطيط)، بيئة معزولة (استراتيجي)  إقامة بيانات في المملكة.",
  alternates: buildAlternates("/deployment"),
};

export default function DeploymentPage() {
  return <DeploymentDepthPage locale="ar" models={deploymentModelsAr} />;
}
