// @ts-nocheck
import {
  describe,
  expect,
  it,
  beforeEach,
  afterEach,
} from "@jest/globals";
import fs from "fs/promises";
import path from "path";
import type { SalesNextBestActionItem } from "../types";
import {
  DEFAULT_SNOOZE_DAYS,
  dismissNbaAction,
  filterVisibleNbaActions,
  filterVisibleNbaActionsSync,
  isNbaSuppressionActive,
  loadNbaSuppressionOverlay,
  resetNbaSuppressionStoreForTests,
  snoozeNbaAction,
  suppressionFilePath,
} from "../nba-suppression-store";

const ORG_A = "org-nba-suppress-a";
const ORG_B = "org-nba-suppress-b";

function nbaItem(id: string): SalesNextBestActionItem {
  return {
    id,
    labelAr: `إجراء ${id}`,
    labelEn: id,
    priority: "medium",
    href: "/sales",
    reasonAr: "سبب",
  };
}

describe("nba-suppression-store", () => {
  const originalFileFlag = process.env.SALESOS_FILE_PERSISTENCE;

  beforeEach(() => {
    resetNbaSuppressionStoreForTests();
    process.env.SALESOS_FILE_PERSISTENCE = "1";
  });

  afterEach(async () => {
    for (const org of [ORG_A, ORG_B]) {
      await fs.rm(suppressionFilePath(org), { force: true });
    }
    if (originalFileFlag === undefined) {
      delete process.env.SALESOS_FILE_PERSISTENCE;
    } else {
      process.env.SALESOS_FILE_PERSISTENCE = originalFileFlag;
    }
    resetNbaSuppressionStoreForTests();
  });

  it("filters dismissed NBA items after dismiss", async () => {
    await dismissNbaAction(ORG_A, "nba-stall-1", "user-1");
    const visible = await filterVisibleNbaActions(ORG_A, [
      nbaItem("nba-stall-1"),
      nbaItem("nba-stall-2"),
    ]);
    expect(visible.map((a) => a.id)).toEqual(["nba-stall-2"]);
  });

  it("re-shows snoozed items after snoozeUntil passes", async () => {
    await snoozeNbaAction(ORG_A, "nba-rule-1", { days: 0, actorId: "u1" });
    const record = (await loadNbaSuppressionOverlay(ORG_A))!.suppressions[0];
    const future = new Date(Date.now() + 60_000);
    expect(isNbaSuppressionActive(record, future)).toBe(false);
    const visible = filterVisibleNbaActionsSync(ORG_A, [nbaItem("nba-rule-1")]);
    expect(visible).toHaveLength(1);
  });

  it("hides snoozed items until snoozeUntil", async () => {
    await snoozeNbaAction(ORG_A, "nba-rule-2");
    const visible = await filterVisibleNbaActions(ORG_A, [nbaItem("nba-rule-2")]);
    expect(visible).toHaveLength(0);
  });

  it("persists overlay to file and reloads on ensure", async () => {
    await dismissNbaAction(ORG_A, "nba-x", "user-1");
    resetNbaSuppressionStoreForTests();
    const overlay = await loadNbaSuppressionOverlay(ORG_A);
    expect(overlay?.suppressions).toHaveLength(1);
    expect(overlay?.suppressions[0].actionId).toBe("nba-x");
    const visible = await filterVisibleNbaActions(ORG_A, [nbaItem("nba-x")]);
    expect(visible).toHaveLength(0);
  });

  it("enforces tenant isolation on overlay load", async () => {
    await dismissNbaAction(ORG_A, "nba-a-only");
    await dismissNbaAction(ORG_B, "nba-b-only");
    const overlayA = await loadNbaSuppressionOverlay(ORG_A);
    expect(overlayA?.suppressions.every((r) => r.organizationId === ORG_A)).toBe(
      true,
    );
    expect(overlayA?.suppressions.some((r) => r.actionId === "nba-b-only")).toBe(
      false,
    );
  });

  it("returns all actions when overlay file is missing (fail-soft)", async () => {
    const missing = path.join(process.cwd(), ".data", "sales", "org_missing_nba.json");
    await fs.rm(missing, { force: true });
    const visible = await filterVisibleNbaActions("org-missing-nba-overlay", [
      nbaItem("nba-1"),
    ]);
    expect(visible).toHaveLength(1);
  });

  it("uses default snooze window of seven days", async () => {
    const before = Date.now();
    await snoozeNbaAction(ORG_A, "nba-snooze-default");
    const overlay = await loadNbaSuppressionOverlay(ORG_A);
    const until = new Date(overlay!.suppressions[0].snoozeUntil!).getTime();
    const expectedMin = before + (DEFAULT_SNOOZE_DAYS - 1) * 86_400_000;
    expect(until).toBeGreaterThan(expectedMin);
  });
});
