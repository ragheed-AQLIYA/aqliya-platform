"use server";

import { auth } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { encrypt, decrypt } from "@/lib/auth/encryption";
import { generateTOTPSecret, generateMFAQRCodeURI, verifyMFAToken, generateBackupCodes, hashBackupCode, verifyBackupCode } from "@/lib/auth/mfa";

export async function getMFASetup() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, mfaEnabled: true, mfaSecret: true },
  });
  if (!user) throw new Error("User not found");
  if (user.mfaEnabled) return { enabled: true };

  const secret = generateTOTPSecret();
  const qrUri = generateMFAQRCodeURI(secret, user.email);

  // Store encrypted secret for verification
  await prisma.user.update({
    where: { id: user.id },
    data: { mfaSecret: encrypt(secret) },
  });

  return { enabled: false, secret, qrUri };
}

export async function enableMFA(token: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, mfaEnabled: true, mfaSecret: true },
  });
  if (!user) throw new Error("User not found");
  if (user.mfaEnabled) throw new Error("MFA already enabled");
  if (!user.mfaSecret) throw new Error("No MFA secret configured. Call getMFASetup first.");

  const plainSecret = decrypt(user.mfaSecret);
  if (!verifyMFAToken(token, plainSecret)) throw new Error("Invalid verification code");

  const backupCodes = generateBackupCodes();
  const hashedCodes = backupCodes.map(hashBackupCode);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      mfaEnabled: true,
      mfaBackupCodes: JSON.stringify(hashedCodes),
    },
  });

  return { success: true, backupCodes };
}

export async function disableMFA(password: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, passwordHash: true, mfaEnabled: true },
  });
  if (!user) throw new Error("User not found");
  if (!user.mfaEnabled) throw new Error("MFA not enabled");
  if (!user.passwordHash) throw new Error("Cannot disable MFA: no password set");

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new Error("Invalid password");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      mfaEnabled: false,
      mfaSecret: null,
      mfaBackupCodes: null,
    },
  });

  return { success: true };
}

export async function verifyLoginMFA(token: string, backupCode?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, mfaSecret: true, mfaBackupCodes: true },
  });
  if (!user) throw new Error("User not found");

  if (backupCode && user.mfaBackupCodes) {
    const codes: string[] = JSON.parse(user.mfaBackupCodes);
    const idx = codes.findIndex((h) => verifyBackupCode(backupCode, [h]));
    if (idx === -1) throw new Error("Invalid backup code");

    // Remove used backup code
    codes.splice(idx, 1);
    await prisma.user.update({
      where: { id: user.id },
      data: { mfaBackupCodes: codes.length > 0 ? JSON.stringify(codes) : null },
    });
    return { verified: true };
  }

  if (!user.mfaSecret) throw new Error("MFA not configured");
  const plainSecret = decrypt(user.mfaSecret);
  if (!verifyMFAToken(token, plainSecret)) throw new Error("Invalid verification code");

  return { verified: true };
}
