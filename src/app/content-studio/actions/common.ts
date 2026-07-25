import { revalidatePath } from "next/cache";
import { createLogger } from "@/lib/observability/logger";
import { isExpectedAccessDeniedError } from "@/lib/auth";
import { ContentStudioError } from "@/lib/platform/content-studio";

const logger = createLogger({ product: "platform", action: "unknown" });

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

export async function safe<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    if (isExpectedAccessDeniedError(error)) {
      return { ok: false, error: "Access denied", code: "FORBIDDEN" };
    }
    if (error instanceof ContentStudioError) {
      return { ok: false, error: error.message };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("[ContentStudio]", error instanceof Error ? error : undefined);
    return { ok: false, error: message };
  }
}

export function revalidateAll() {
  revalidatePath("/content-studio");
}
