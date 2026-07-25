/**
 * Proof-of-Work utility for AQLIYA public form endpoints.
 *
 * Implements a lightweight hashcash-style challenge to prevent bot spam
 * without requiring external CAPTCHA services.
 *
 * Flow:
 * 1. Client requests a challenge: GET /api/pow/challenge
 * 2. Server returns { token, difficulty, salt }
 * 3. Client computes nonce where SHA-256(token + salt + nonce) has N leading zeros
 * 4. Client submits form with { pow: { token, nonce, hash } }
 * 5. Server verifies the hash meets difficulty and token is not expired
 *
 * Difficulty levels:
 * - 2: ~256 attempts (fast, ~100ms on modern hardware)
 * - 3: ~4096 attempts (medium, ~1-2s)
 * - 4: ~65536 attempts (slow, ~5-10s) — use for high-value actions
 */

import { createHash, randomBytes } from "crypto"

const CHALLENGE_TTL_MS = 5 * 60 * 1000 // 5 minutes
const DEFAULT_DIFFICULTY = 2
const MAX_DIFFICULTY = 4

interface Challenge {
  token: string
  salt: string
  difficulty: number
  createdAt: number
}

interface PowSubmission {
  token: string
  nonce: string
  hash: string
}

// In-memory challenge store (resets on server restart — acceptable for anti-spam)
const challenges = new Map<string, Challenge>()

/**
 * Generate a new challenge for the client.
 */
export function createChallenge(difficulty: number = DEFAULT_DIFFICULTY): {
  token: string
  salt: string
  difficulty: number
  expiresAt: number
} {
  const safeDifficulty = Math.min(Math.max(1, difficulty), MAX_DIFFICULTY)
  const token = randomBytes(32).toString("hex")
  const salt = randomBytes(16).toString("hex")
  const createdAt = Date.now()

  challenges.set(token, { token, salt, difficulty: safeDifficulty, createdAt })

  // Cleanup expired challenges
  if (challenges.size > 1000) {
    const cutoff = Date.now() - CHALLENGE_TTL_MS
    for (const [key, challenge] of challenges) {
      if (challenge.createdAt < cutoff) {
        challenges.delete(key)
      }
    }
  }

  return {
    token,
    salt,
    difficulty: safeDifficulty,
    expiresAt: createdAt + CHALLENGE_TTL_MS,
  }
}

/**
 * Verify a proof-of-work submission.
 * Returns { valid: true } if the hash meets the difficulty requirement.
 * Returns { valid: false, reason: string } if verification fails.
 */
export function verifyPow(submission: PowSubmission): {
  valid: boolean
  reason?: string
} {
  const { token, nonce, hash } = submission

  // 1. Check token exists
  const challenge = challenges.get(token)
  if (!challenge) {
    return { valid: false, reason: "Invalid or expired challenge token" }
  }

  // 2. Check token expiry
  if (Date.now() - challenge.createdAt > CHALLENGE_TTL_MS) {
    challenges.delete(token)
    return { valid: false, reason: "Challenge token expired" }
  }

  // 3. Verify hash computation
  const expectedHash = createHash("sha256")
    .update(`${token}${challenge.salt}${nonce}`)
    .digest("hex")

  if (expectedHash !== hash) {
    return { valid: false, reason: "Invalid hash computation" }
  }

  // 4. Verify difficulty (hash must start with N zeros)
  const prefix = "0".repeat(challenge.difficulty)
  if (!hash.startsWith(prefix)) {
    return {
      valid: false,
      reason: `Hash does not meet difficulty ${challenge.difficulty}`,
    }
  }

  // 5. Consumed — delete to prevent replay
  challenges.delete(token)

  return { valid: true }
}

/**
 * Express-style middleware for API routes.
 * Adds verifyPow middleware to POST handlers.
 */
export function powMiddleware(
  handler: (request: Request) => Promise<Response>,
  difficulty: number = DEFAULT_DIFFICULTY,
) {
  return async (request: Request): Promise<Response> => {
    // Only verify on POST requests
    if (request.method !== "POST") {
      return handler(request)
    }

    // Clone request to read body without consuming it
    const cloned = request.clone()
    let body: Record<string, unknown>
    try {
      body = await cloned.json()
    } catch {
      return Response.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      )
    }

    const pow = body.pow as PowSubmission | undefined
    if (!pow || !pow.token || !pow.nonce || !pow.hash) {
      return Response.json(
        { error: "Proof-of-work required. Request a challenge first." },
        { status: 403 },
      )
    }

    const verification = verifyPow(pow)
    if (!verification.valid) {
      return Response.json(
        { error: `Proof-of-work verification failed: ${verification.reason}` },
        { status: 403 },
      )
    }

    return handler(request)
  }
}
