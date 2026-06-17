import type { UserRole } from "@prisma/client";

import { isMFARequiredForRoleName } from "@/lib/auth/mfa-roles";

export type MfaGateState = "allow" | "enroll" | "challenge";

export function resolveMfaGateState(input: {
  role: string | undefined;
  mfaEnabled: boolean | undefined;
  mfaVerified: boolean | undefined;
  isExempt: boolean;
}): MfaGateState {
  if (input.isExempt) return "allow";
  if (!input.role || !isMFARequiredForRoleName(input.role as UserRole)) {
    return "allow";
  }
  if (!input.mfaEnabled) return "enroll";
  if (!input.mfaVerified) return "challenge";
  return "allow";
}
