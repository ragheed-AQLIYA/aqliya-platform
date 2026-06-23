import type { Metadata } from "next";
import { DeploymentDepthPage } from "@/components/marketing/v2/deployment-depth-page";
import { deploymentModelsEn } from "@/lib/marketing/deployment-page-content-en";

export const metadata: Metadata = {
  title: "Deployment Options | AQLIYA",
  description:
    "Managed cloud (available), private cloud (planned), air-gapped (strategic). Saudi data residency by default.",
};

export default function EnglishDeploymentPage() {
  return <DeploymentDepthPage locale="en" models={deploymentModelsEn} />;
}
