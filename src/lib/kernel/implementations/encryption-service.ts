import type { IEncryptionService } from "../contracts/encryption";
import { encrypt, decrypt } from "@/lib/auth/encryption";
import { createHash } from "crypto";

export class EncryptionServiceWrapper implements IEncryptionService {
  encrypt(plaintext: string): string {
    return encrypt(plaintext);
  }

  decrypt(ciphertext: string): string {
    return decrypt(ciphertext);
  }

  hash(data: string): string {
    return createHash("sha256").update(data).digest("hex");
  }

  verify(data: string, hash: string): boolean {
    return this.hash(data) === hash;
  }
}
