"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isExpectedAccessDeniedError } from "@/lib/auth";
import {
  requireReadAccess,
  requireMutationAccess,
} from "@/core/access/server-action-guard";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { updateOrganizationAction } from "@/actions/platform-org-actions";
import {
  saveUserPreferencesForUser,
  type UserPreferences,
} from "@/lib/platform/user-preferences";

export type { UserPreferences };

export interface SettingsData {
  userName: string;
  userEmail: string;
  orgName: string;
  orgId: string;
  platformOrganizationId: string | null;
  canEditOrganization: boolean;
}

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

export async function getSettingsData(): Promise<SettingsData> {
  const user = await requireReadAccess("settings");

  let orgName = "";
  try {
    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      select: { name: true },
    });
    orgName = org?.name ?? "";
  } catch {
    orgName = "";
  }

  const canEditOrganization =
    user.role === "ADMIN" || user.role === "OPERATOR";

  return {
    userName: user.name,
    userEmail: user.email,
    orgName,
    orgId: user.organizationId,
    platformOrganizationId: user.platformOrganizationId ?? null,
    canEditOrganization,
  };
}

export async function saveOrganizationSettingsAction(data: {
  orgName: string;
}): Promise<ActionResult<{ orgName: string }>> {
  try {
    const user = await requireMutationAccess("settings", "update");

    const result = await updateOrganizationAction(user.organizationId, {
      name: data.orgName,
    });

    if (!result.ok) {
      return result;
    }

    writePlatformAuditLog({
      productKey: "platform",
      action: "settings.organization.save",
      targetType: "organization",
      targetId: user.organizationId,
      targetLabel: result.data.name,
      actorId: user.id,
      actorType: "user",
      actorEmail: user.email,
      actorName: user.name,
      metadata: { orgName: result.data.name },
    });

    revalidatePath("/settings");
    return { ok: true, data: { orgName: result.data.name } };
  } catch (error) {
    if (isExpectedAccessDeniedError(error)) {
      return { ok: false, error: "Access denied", code: "FORBIDDEN" };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[Settings Action]", message);
    return { ok: false, error: message };
  }
}

/** Pilot — persist user prefs via platform org metadata. */
export async function saveUserPreferencesAction(
  prefs: UserPreferences,
): Promise<ActionResult<UserPreferences>> {
  try {
    const user = await requireMutationAccess("settings", "update");
    const saved = await saveUserPreferencesForUser(user, prefs);
    revalidatePath("/settings");
    return { ok: true, data: saved };
  } catch (error) {
    if (isExpectedAccessDeniedError(error)) {
      return { ok: false, error: "Access denied", code: "FORBIDDEN" };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[saveUserPreferencesAction]", message);
    return { ok: false, error: message };
  }
}
