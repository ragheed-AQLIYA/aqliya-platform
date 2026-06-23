import type { DeploymentModel } from "./deployment-page-content";

export const deploymentModelsEn: DeploymentModel[] = [
  {
    id: "cloud",
    name: "Managed cloud",
    status: "Available now",
    statusTone: "available",
    summary:
      "Production environment for most institutions — AQLIYA operates infrastructure and continuity; you control data and permissions.",
    highlights: [
      "Saudi/GCC data residency by default",
      "Tenant isolation at DB and app layer",
      "Daily encrypted backups",
      "99.5% monthly availability target",
    ],
  },
  {
    id: "private",
    name: "Private cloud",
    status: "Planned",
    statusTone: "planned",
    summary:
      "Full platform in your cloud account — network and data control with joint engineering support.",
    highlights: [
      "AWS / Azure / GCP in your account",
      "IAM and enterprise security tool integration",
      "Updates on your approval cycle",
    ],
    note: "Requires joint feasibility assessment — not an instant activation package.",
  },
  {
    id: "airgapped",
    name: "Air-gapped",
    status: "Strategic",
    statusTone: "strategic",
    summary:
      "Fully offline operation for the most sensitive environments — deep co-design, not a ready product today.",
    highlights: [
      "No external connectivity — secure media updates",
      "Local models without cloud dependency",
      "Internal identity integration",
    ],
    note: "On-Prem / Air-Gapped is strategic — contact for design scope, not a readiness claim.",
  },
];
