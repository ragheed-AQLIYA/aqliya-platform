"use server";

import { cookies } from "next/headers";
import { createLogger } from "@/lib/observability/logger";

const logger = createLogger({ product: "platform", action: "sales-oauth-initiate" });

export async function storeOAuthStateAction(state: string, codeVerifier: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set("oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
    cookieStore.set("oauth_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
    return { ok: true };
  } catch (err) {
    logger.error("Failed to store OAuth state", err instanceof Error ? err : undefined);
    return { ok: false, error: "Failed to store OAuth state" };
  }
}
