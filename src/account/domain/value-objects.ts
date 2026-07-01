/**
 * Account Value Objects — reusable templates with content change only
 */
import { BusinessRuleError, ValidationError } from "./errors";

export class IcpScore {
  private constructor(public readonly value: number, public readonly dimensions: Record<string, number>, public readonly computedAt: string) {
    if (value < 0 || value > 100) throw new BusinessRuleError("ICP score must be between 0 and 100");
  }
  static create(value: number, dimensions: Record<string, number>, computedAt?: string): IcpScore {
    return new IcpScore(value, dimensions, computedAt ?? new Date().toISOString());
  }
  equals(other: IcpScore): boolean { return this.value === other.value; }
}

export class HealthScore {
  private constructor(public readonly value: number, public readonly factors: string[], public readonly computedAt: string) {
    if (value < 0 || value > 100) throw new BusinessRuleError("Health score must be between 0 and 100");
  }
  static create(value: number, factors: string[], computedAt?: string): HealthScore {
    return new HealthScore(value, factors, computedAt ?? new Date().toISOString());
  }
  equals(other: HealthScore): boolean { return this.value === other.value; }
}

export class Sensitivity {
  private constructor(public readonly level: string) {}
  static readonly STANDARD = new Sensitivity("standard");
  static readonly RESTRICTED = new Sensitivity("restricted");
  static readonly CONFIDENTIAL = new Sensitivity("confidential");
  static create(level: string): Sensitivity {
    if (!["standard", "restricted", "confidential"].includes(level)) throw new ValidationError("Invalid sensitivity level");
    return new Sensitivity(level);
  }
  equals(other: Sensitivity): boolean { return this.level === other.level; }
}

export type AccountStatus = "Prospect" | "Active" | "Dormant" | "Archived";

export function isArchived(status: AccountStatus): boolean {
  return status === "Archived";
}
