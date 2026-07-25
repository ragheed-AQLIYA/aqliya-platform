import { NextResponse } from "next/server"
import { createChallenge } from "@/lib/security/pow"

/**
 * GET /api/pow/challenge
 *
 * Returns a proof-of-work challenge for public form endpoints.
 * Client must solve the hashcash puzzle before submitting forms.
 *
 * Response: { token, salt, difficulty, expiresAt }
 */
export async function GET() {
  const challenge = createChallenge(2) // difficulty 2 = ~256 attempts (~100ms)
  return NextResponse.json(challenge)
}
