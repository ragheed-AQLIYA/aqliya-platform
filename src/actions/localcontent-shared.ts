import { revalidatePath } from "next/cache";
import { isExpectedAccessDeniedError } from "@/lib/auth";
import { auditLogger, Product } from "@/lib/platform/audit-logger";
import {
  resolveProjectContext,
  ProjectAccessError,
} from "@/lib/local-content/guards";
import { type ActionResult, safe as _safe } from "@/lib/platform/action-result";
import type { ErrorCode } from "@/lib/platform/action-result";

// ─── Domain error mapper ───

function mapLocalContentError(error: unknown): { code: ErrorCode; message: string } | null {
  if (error instanceof ProjectAccessError) {
    return { code: (error.code as ErrorCode) ?? "FORBIDDEN", message: error.message };
  }
  if (isExpectedAccessDeniedError(error)) {
    return { code: "FORBIDDEN", message: "Access denied" };
  }
  return null;
}

/** File-local safe wrapper with LocalContentOS error mapping */
export async function safe<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  return _safe(fn, { mapError: mapLocalContentError, defaultCode: "INTERNAL_ERROR" });
}

// ─── Platform audit helper ───

export async function logToPlatform(params: {
  projectId: string;
  user: { id: string; name: string; email: string };
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const context = await resolveProjectContext(params.projectId);
    const alog = auditLogger({
      productKey: Product.LOCAL_CONTENT,
      sourceSystem: "localcontent_compliance",
      organization: {
        platformOrganizationId: context?.platformOrganizationId ?? undefined,
        clientWorkspaceId: context?.clientWorkspaceId ?? undefined,
        projectId: context?.projectId ?? undefined,
      },
      actor: {
        id: params.user.id,
        name: params.user.name,
        email: params.user.email,
        type: "user",
      },
    });
    await alog.record(
      params.action,
      {
        type: params.targetType,
        id: params.targetId,
      },
      {
        severity: "info",
        status: "recorded",
        sourceModel: params.targetType,
        sourceId: params.targetId,
        metadata: params.metadata,
      },
    );
  } catch {
    // Dual-write must not block the primary action
  }
}

// ─── Revalidation helper ───

export type LocalContentPathSegment =
  | "suppliers"
  | "spend"
  | "classification"
  | "evidence"
  | "findings"
  | "review"
  | "approval"
  | "reports"
  | "audit-trail"
  | "verification"
  | "tender-match";

export function revalidateLocalContentPaths(
  projectId: string,
  segments: LocalContentPathSegment[] = [],
) {
  revalidatePath("/local-content");
  revalidatePath("/local-content/projects");
  revalidatePath(`/local-content/projects/${projectId}`);
  for (const segment of segments) {
    revalidatePath(`/local-content/projects/${projectId}/${segment}`);
  }
}
