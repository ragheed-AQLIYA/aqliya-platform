import type { KernelResult } from "../types";

export interface IEncryptionService {
  encrypt(plaintext: string): string;
  decrypt(ciphertext: string): string;
  hash(data: string): string;
  verify(data: string, hash: string): boolean;
}
