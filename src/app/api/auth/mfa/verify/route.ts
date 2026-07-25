import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/observability/logger";
import { getToken, encode } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/auth/encryption";
import { verifyMFAToken, verifyBackupCode } from "@/lib/auth/mfa";

const mfaVerifySchema = z.object({
  token: z.string().optional(),
  backupCode: z.string().optional(),
}).refine((data) => data.token || data.backupCode, {
  message: "Either token or backupCode is required",
});


const logger = createLogger({ product: "platform", action: "unknown" });

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body", code: "VALIDATION_ERROR" },
        { status: 400 },
      );
    }

    const parsed = mfaVerifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request", code: "VALIDATION_ERROR" },
        { status: 400 },
      );
    }

    const { token, backupCode } = parsed.data;

    const sessionToken = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
    });

    if (!sessionToken?.sub) {
      return NextResponse.json(
        { error: "Not authenticated", code: "UNAUTHENTICATED" },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionToken.sub },
      select: { id: true, mfaSecret: true, mfaBackupCodes: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found", code: "USER_NOT_FOUND" },
        { status: 404 },
      );
    }

    let verified = false;

    if (backupCode && user.mfaBackupCodes) {
      const codes: string[] = JSON.parse(user.mfaBackupCodes);
      const idx = codes.findIndex((h) => verifyBackupCode(backupCode, [h]));
      if (idx >= 0) {
        codes.splice(idx, 1);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            mfaBackupCodes:
              codes.length > 0 ? JSON.stringify(codes) : null,
          },
        });
        verified = true;
      }
    } else if (token && user.mfaSecret) {
      const plainSecret = decrypt(user.mfaSecret);
      verified = verifyMFAToken(token, plainSecret);
    }

    if (!verified) {
      return NextResponse.json(
        { error: "Invalid verification code", code: "INVALID_CODE" },
        { status: 400 },
      );
    }

    const cookieName =
      process.env.NODE_ENV === "production"
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token";

    const newJwt = await encode({
      token: {
        ...sessionToken,
        mfaEnabled: true,
        mfaVerified: true,
      },
      secret: process.env.AUTH_SECRET!,
      salt: cookieName,
    });

    const response = NextResponse.json({ success: true });

    response.cookies.set(cookieName, newJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    logger.error("MFA verify error:", err instanceof Error ? err : undefined);
    return NextResponse.json(
      { error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
