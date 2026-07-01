/**
 * Stage Value Object — SPEC-01a §2, SPEC-01c §1.2
 * Immutable. Enforces DI-06: must be a valid stage name.
 * 7 stages: Draft → Qualified → In Review → Approved → Negotiation → Closed Won → Closed Lost
 */

import { ValidationError } from "../errors";

export type StageName =
  | "Draft"
  | "Qualified"
  | "In Review"
  | "Approved"
  | "Negotiation"
  | "Closed Won"
  | "Closed Lost";

const VALID_STAGE_NAMES: readonly StageName[] = [
  "Draft",
  "Qualified",
  "In Review",
  "Approved",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
];

export class Stage {
  private constructor(public readonly name: StageName) {}

  static readonly DRAFT = new Stage("Draft");
  static readonly QUALIFIED = new Stage("Qualified");
  static readonly IN_REVIEW = new Stage("In Review");
  static readonly APPROVED = new Stage("Approved");
  static readonly NEGOTIATION = new Stage("Negotiation");
  static readonly CLOSED_WON = new Stage("Closed Won");
  static readonly CLOSED_LOST = new Stage("Closed Lost");

  static readonly ALL: readonly Stage[] = [
    Stage.DRAFT, Stage.QUALIFIED, Stage.IN_REVIEW, Stage.APPROVED,
    Stage.NEGOTIATION, Stage.CLOSED_WON, Stage.CLOSED_LOST,
  ];

  static create(name: string): Stage {
    if (!VALID_STAGE_NAMES.includes(name as StageName)) {
      throw new ValidationError(
        `Invalid stage: ${name}. Valid stages: ${VALID_STAGE_NAMES.join(", ")}`,
        { name },
      );
    }
    return new Stage(name as StageName);
  }

  get isClosed(): boolean {
    return this.name === "Closed Won" || this.name === "Closed Lost";
  }

  get isTerminal(): boolean {
    return this.isClosed;
  }

  equals(other: Stage): boolean {
    return this.name === other.name;
  }

  toString(): string {
    return this.name;
  }

  toJSON(): string {
    return this.name;
  }
}
