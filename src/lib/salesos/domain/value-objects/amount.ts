/**
 * Amount Value Object — SPEC-01a §2
 * Immutable. Enforces DI-01: value >= 0.
 * Currency must be 3-letter ISO 4217.
 */

import { BusinessRuleError, ValidationError } from "../errors";

export class Amount {
  private constructor(
    public readonly value: number,
    public readonly currency: string,
  ) {
    if (value < 0) {
      throw new BusinessRuleError("Amount value must be >= 0", { value });
    }
    if (currency.length !== 3 || currency !== currency.toUpperCase()) {
      throw new ValidationError("Currency must be a 3-letter ISO 4217 code", { currency });
    }
  }

  static create(value: number, currency = "SAR"): Amount {
    return new Amount(value, currency.toUpperCase());
  }

  add(other: Amount): Amount {
    if (this.currency !== other.currency) {
      throw new BusinessRuleError("Cannot add amounts with different currencies", {
        left: this.currency,
        right: other.currency,
      });
    }
    return new Amount(this.value + other.value, this.currency);
  }

  multiply(factor: number): Amount {
    return new Amount(this.value * factor, this.currency);
  }

  equals(other: Amount): boolean {
    return this.value === other.value && this.currency === other.currency;
  }

  toString(): string {
    return `${this.value.toLocaleString()} ${this.currency}`;
  }

  toJSON(): { value: number; currency: string } {
    return { value: this.value, currency: this.currency };
  }
}
