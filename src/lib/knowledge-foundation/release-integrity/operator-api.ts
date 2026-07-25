import "server-only";
import { verifyReleaseIntegrity } from "./integrity-verifier";

/** Operator-facing verification API (read-only). */
export async function verifyFoundationRelease(
  versionId: string,
  actorId: string,
) {
  return verifyReleaseIntegrity(versionId, { actorId, emitAudit: true });
}
