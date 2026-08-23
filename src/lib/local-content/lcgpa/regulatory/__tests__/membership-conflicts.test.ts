import {
  detectConflicts,
  detectMembershipConflicts,
  renderConflict,
} from "../conflict-detection";
import { buildConflictAlert } from "../alerts";
import { clockAt, product, tier4Source, verifiedTier1Source } from "./fixtures";
import { makeDataset } from "./dataset-helpers";

const CLOCK = clockAt("2026-08-22T00:00:00.000Z");

const listSource = verifiedTier1Source({ id: "lcgpa-mandatory-list-government" });
const scheduleSource = verifiedTier1Source({ id: "lcgpa-minimum-lc-schedule" });

/** Mirrors the real July 2026 shape: the schedule states minimums for products
 *  that the Mandatory List does not contain. */
const listDataset = makeDataset(
  "LCGPA_MANDATORY_LIST_GOV_2026-07",
  [product("2353"), product("2354")],
  { sourceId: "lcgpa-mandatory-list-government" },
);

const scheduleDataset = makeDataset(
  "LCGPA_MINIMUM_LC_2026-07",
  [
    product("2353", { minimumLcPct: 23 }),
    product("2802", {
      minimumLcPct: null,
      minimumLcSchedule: [
        { year: 2026, pct: null, state: "NOT_APPLICABLE", raw: "-" },
        { year: 2028, pct: 30, state: "STATED", raw: "0.3" },
      ],
    }),
    product("2804", { minimumLcPct: 19 }),
    // States nothing binding — must NOT be reported as a conflict.
    product("9999", {
      minimumLcPct: null,
      minimumLcSchedule: [{ year: 2026, pct: null, state: "TBD", raw: "TBD" }],
    }),
  ],
  { sourceId: "lcgpa-minimum-lc-schedule" },
);

function detect() {
  return detectMembershipConflicts({
    obligationSource: scheduleSource,
    obligationDataset: scheduleDataset,
    listSource,
    listDataset,
    clock: CLOCK,
  });
}

describe("LCGPA :: membership conflicts between two official artifacts (§29)", () => {
  it("flags a product that carries a published minimum but is not on the list", () => {
    const conflicts = detect();
    expect(conflicts.map((c) => c.productCode)).toEqual(["2802", "2804"]);
  });

  it("does NOT flag a product that states nothing binding", () => {
    // 9999 is absent from the list but only carries TBD — nothing to conflict about.
    expect(detect().map((c) => c.productCode)).not.toContain("9999");
  });

  it("does NOT flag a product both artifacts agree on", () => {
    expect(detect().map((c) => c.productCode)).not.toContain("2353");
  });

  it("recognises an obligation stated only in a future schedule year", () => {
    const c = detect().find((x) => x.productCode === "2802");
    expect(c?.conflictingFields[0].valueB).toMatch(/MINIMUM_STATED: 30% from 2028/);
  });

  it("records both artifacts and resolves nothing", () => {
    const c = detect()[0];
    expect(c.artifactAHash).toBe(listDataset.artifactSha256);
    expect(c.artifactBHash).toBe(scheduleDataset.artifactSha256);
    expect(c.sourceAId).toBe("lcgpa-mandatory-list-government");
    expect(c.sourceBId).toBe("lcgpa-minimum-lc-schedule");
    expect(c.resolution).toBe("PENDING_HUMAN_REVIEW");
    expect(c.conflictingFields[0].field).toBe("mandatoryListMembership");
    expect(c.conflictingFields[0].valueA).toBe("ABSENT_FROM_LIST");
  });

  it("is deterministic", () => {
    expect(detect().map((c) => c.conflictId)).toEqual(detect().map((c) => c.conflictId));
  });

  it("NEVER treats a third-party source as an official conflict (§30)", () => {
    expect(
      detectMembershipConflicts({
        obligationSource: tier4Source(),
        obligationDataset: scheduleDataset,
        listSource,
        listDataset,
        clock: CLOCK,
      }),
    ).toHaveLength(0);
  });

  it("says nothing when both datasets come from the same source", () => {
    expect(
      detectMembershipConflicts({
        obligationSource: listSource,
        obligationDataset: scheduleDataset,
        listSource,
        listDataset,
        clock: CLOCK,
      }),
    ).toHaveLength(0);
  });

  it("raises a CRITICAL alert carrying both artifact hashes", () => {
    const alert = buildConflictAlert(detect()[0], CLOCK);
    expect(alert.severity).toBe("CRITICAL");
    expect(alert.category).toBe("REGULATORY_CONFLICT");
    expect(alert.recommendedAction).toMatch(/Do not select one/);
  });

  it("renders for an operator", () => {
    const rendered = renderConflict(detect()[0]);
    expect(rendered).toMatch(/product {5}2802/);
    expect(rendered).toMatch(/resolution {2}PENDING_HUMAN_REVIEW/);
  });

  it("complements value conflicts rather than replacing them", () => {
    // Value conflicts still only fire where BOTH sources state a value.
    const valueConflicts = detectConflicts({
      sourceA: listSource,
      datasetA: makeDataset("a", [product("2353", { minimumLcPct: 23 })]),
      sourceB: scheduleSource,
      datasetB: makeDataset("b", [product("2353", { minimumLcPct: 40 })], {
        sourceId: "lcgpa-minimum-lc-schedule",
      }),
      clock: CLOCK,
    });
    expect(valueConflicts).toHaveLength(1);
    expect(valueConflicts[0].conflictingFields[0].field).toBe("minimumLcPct");
  });
});
