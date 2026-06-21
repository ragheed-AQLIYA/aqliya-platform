"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { AuditEngine } from "@/lib/core/audit";
import {
  processOutboxBatch,
  retryFailedOutboxEvents,
} from "@/lib/core/events/outbox-service";
import { getEnterpriseHealthSnapshot } from "@/lib/platform/enterprise-health";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) {
    throw new Error("Access denied: admin role required");
  }
  return user;
}

export async function getEnterpriseHealthAction() {
  await requireAdmin();
  return getEnterpriseHealthSnapshot();
}

export async function processPlatformOutboxAction() {
  const user = await requireAdmin();
  const result = await processOutboxBatch(50);

  await AuditEngine.write({
    productKey: "platform",
    sourceSystem: "outbox_operator",
    platformOrganizationId: user.organizationId,
    actorId: user.id,
    action: "platform.outbox.process",
    targetType: "outbox",
    targetId: "batch",
    metadata: result,
  }).catch(() => {});

  revalidatePath("/monitoring");
  revalidatePath("/operator");
  return { ok: true, ...result };
}

export async function retryFailedOutboxAction() {
  const user = await requireAdmin();
  const result = await retryFailedOutboxEvents({ limit: 50 });

  await AuditEngine.write({
    productKey: "platform",
    sourceSystem: "outbox_operator",
    platformOrganizationId: user.organizationId,
    actorId: user.id,
    action: "platform.outbox.retry",
    targetType: "outbox",
    targetId: result.ids.join(",") || "none",
    metadata: result,
  }).catch(() => {});

  revalidatePath("/monitoring");
  revalidatePath("/operator");
  return { ok: true, ...result };
}
