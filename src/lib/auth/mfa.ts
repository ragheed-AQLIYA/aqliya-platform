import { createHash, randomBytes } from "crypto";

const TOTP_DIGITS = 6;
const TOTP_INTERVAL = 30;

function base32Encode(data: Buffer): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let result = "";
  let buffer = 0;
  let bitsRemaining = 0;

  for (const byte of data) {
    buffer = (buffer << 8) | byte;
    bitsRemaining += 8;
    while (bitsRemaining >= 5) {
      bitsRemaining -= 5;
      result += alphabet[(buffer >>> bitsRemaining) & 31];
    }
  }
  if (bitsRemaining > 0) {
    result += alphabet[(buffer << (5 - bitsRemaining)) & 31];
  }
  return result;
}

function base32Decode(str: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = str.replace(/=+$/, "").toUpperCase();
  const bytes: number[] = [];
  let buffer = 0;
  let bitsRemaining = 0;

  for (const char of cleaned) {
    const idx = alphabet.indexOf(char);
    if (idx === -1) continue;
    buffer = (buffer << 5) | idx;
    bitsRemaining += 5;
    if (bitsRemaining >= 8) {
      bitsRemaining -= 8;
      bytes.push((buffer >>> bitsRemaining) & 0xff);
    }
  }
  return Buffer.from(bytes);
}

export function generateTOTPSecret(): string {
  return base32Encode(randomBytes(20));
}

export function generateTOTPToken(secret: string, timestamp: number = Math.floor(Date.now() / 1000)): string {
  const counter = Math.floor(timestamp / TOTP_INTERVAL);
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigInt64BE(BigInt(counter));

  const key = base32Decode(secret);
  const hmac = createHash("sha1").update(key).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binaryCode = ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(binaryCode % Math.pow(10, TOTP_DIGITS)).padStart(TOTP_DIGITS, "0");
}

export function verifyMFAToken(token: string, secret: string): boolean {
  const now = Math.floor(Date.now() / 1000);
  return [0, -1, 1].some(offset =>
    generateTOTPToken(secret, now + offset * TOTP_INTERVAL) === token
  );
}

export function generateBackupCodes(count = 8): string[] {
  return Array.from({ length: count }, () => randomBytes(4).toString("hex").toUpperCase());
}

export function hashBackupCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export function verifyBackupCode(code: string, hashedCodes: string[]): boolean {
  return hashedCodes.includes(hashBackupCode(code));
}

export function generateMFAQRCodeURI(secret: string, email: string, issuer = "AQLIYA"): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_INTERVAL}`;
}
