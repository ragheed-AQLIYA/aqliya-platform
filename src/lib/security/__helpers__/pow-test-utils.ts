import { createHash } from "crypto";
import { createChallenge } from "../pow";

/**
 * Generate a valid proof-of-work solution for testing.
 * Solves the hashcash puzzle programmatically.
 */
export function solvePowChallenge(difficulty: number = 2) {
  const challenge = createChallenge(difficulty);
  const prefix = "0".repeat(difficulty);

  let nonce = 0;
  let hash = "";
  while (true) {
    hash = createHash("sha256")
      .update(`${challenge.token}${challenge.salt}${nonce}`)
      .digest("hex");
    if (hash.startsWith(prefix)) break;
    nonce++;
  }

  return {
    token: challenge.token,
    nonce: String(nonce),
    hash,
  };
}
