import type { Metadata } from "next";
import { DeploymentDepthPage } from "@/components/marketing/v2/deployment-depth-page";
import { deploymentModelsAr } from "@/lib/marketing/deployment-page-content";

export const metadata: Metadata = {
  title: "بيئات النشر | AQLIYA",
  description:
    "سحابة مُدارة (متاح)، خوادم خاصة (قيد التخطيط)، بيئة معزولة (استراتيجي) — إقامة بيانات في المملكة.",
};

export default function DeploymentPage() {
  return <DeploymentDepthPage locale="ar" models={deploymentModelsAr} />;
}
