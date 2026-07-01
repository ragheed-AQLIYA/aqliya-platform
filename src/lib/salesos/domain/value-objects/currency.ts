/**
 * Currency Value Object — SPEC-01a §2
 * Immutable. 3-letter ISO 4217 code.
 */

import { ValidationError } from "../errors";

export class Currency {
  private constructor(public readonly code: string) {
    if (code.length !== 3 || code !== code.toUpperCase()) {
      throw new ValidationError("Currency must be a 3-letter ISO 4217 code", { code });
    }
  }

  static readonly SAR = new Currency("SAR");
  static readonly USD = new Currency("USD");
  static readonly AED = new Currency("AED");

  static create(code: string): Currency {
    return new Currency(code.toUpperCase());
  }

  equals(other: Currency): boolean {
    return this.code === other.code;
  }

  toString(): string {
    return this.code;
  }

  toJSON(): string {
    return this.code;
  }
}
