/**
 * Probability Value Object — SPEC-01a §2
 * Immutable. Enforces DI-02: integer 0-100.
 */

import { BusinessRuleError } from "../errors";

export class Probability {
  private constructor(public readonly value: number) {
    if (!Number.isInteger(value) || value < 0 || value > 100) {
      throw new BusinessRuleError("Probability must be an integer between 0 and 100", { value });
    }
  }

  static create(value: number): Probability {
    return new Probability(value);
  }

  asPercentage(): number {
    return this.value;
  }

  asDecimal(): number {
    return this.value / 100;
  }

  equals(other: Probability): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return `${this.value}%`;
  }

  toJSON(): number {
    return this.value;
  }
}
