"use server";

import { revalidatePath } from "next/cache";
import { getAuditActor, requireRole } from "@/lib/audit/actor-context";
import { assertEngagementAccess } from "@/lib/audit/tenant-guard";
import {
  assignPresentationPolicyToEngagement,
  createOrgPresentationPolicyFromTemplate,
  getPresentationPolicyRulesById,
  listPresentationPoliciesForOrganization,
  updateOrgPresentationPolicy,
  type PresentationPolicyEditableFields,
} from "@/lib/audit/presentation/presentation-policy-service";
import { rebuildFinancialStatementsAfterProfileChange } from "@/lib/audit/presentation/presentation-profile-rebuild";
import { prisma } from "@/lib/prisma";

export async function listPresentationPoliciesAction() {
  const actor = await getAuditActor();
  requireRole(actor, ["admin"]);
  return listPresentationPoliciesForOrganization(actor.organizationId);
}

export async function getPresentationPolicyRulesAction(policyId: string) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin"]);
  const policy = await prisma.auditPresentationPolicy.findFirst({
    where: {
      id: policyId,
      OR: [{ isSystem: true }, { organizationId: actor.organizationId }],
    },
  });
  if (!policy) return null;
  return {
    summary: {
      id: policy.id,
      slug: policy.slug,
      name: policy.name,
      version: policy.version,
      isSystem: policy.isSystem,
      organizationId: policy.organizationId,
    },
    rules: await getPresentationPolicyRulesById(policyId),
  };
}

export async function createOrgPresentationPolicyAction(params: {
  templateSlug: string;
  name: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin"]);

  const created = await createOrgPresentationPolicyFromTemplate({
    organizationId: actor.organizationId,
    templateSlug: params.templateSlug,
    name: params.name,
  });

  revalidatePath("/audit");
  return created;
}

export async function updateOrgPresentationPolicyAction(params: {
  policyId: string;
  fields: PresentationPolicyEditableFields;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin"]);

  const updated = await updateOrgPresentationPolicy({
    organizationId: actor.organizationId,
    policyId: params.policyId,
    fields: params.fields,
  });

  revalidatePath("/audit");
  return updated;
}

export async function assignEngagementPresentationPolicyAction(params: {
  engagementId: string;
  policyId: string;
}) {
  const actor = await getAuditActor();
  requireRole(actor, ["admin"]);
  await assertEngagementAccess(params.engagementId, actor);

  const previous = await prisma.auditEngagement.findUnique({
    where: { id: params.engagementId },
    select: { presentationPolicyId: true },
  });

  await assignPresentationPolicyToEngagement({
    organizationId: actor.organizationId,
    engagementId: params.engagementId,
    policyId: params.policyId,
  });

  await prisma.auditEvent.create({
    data: {
      engagementId: params.engagementId,
      eventType: "engagement.presentation_policy_assigned",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "engagement",
      targetId: params.engagementId,
      previousState: previous?.presentationPolicyId ?? "",
      newState: params.policyId,
      description: `Presentation policy assigned: ${params.policyId}`,
    },
  });

  const fsRebuild = await rebuildFinancialStatementsAfterProfileChange(
    params.engagementId,
  );

  revalidatePath(`/audit/engagements/${params.engagementId}`);
  revalidatePath(`/audit/engagements/${params.engagementId}/statements`);

  return { policyId: params.policyId, fsRebuild };
}
