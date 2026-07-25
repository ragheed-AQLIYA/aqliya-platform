// ─── Pipeline Stage 6: What-If Simulations ───

import "server-only";

import { prisma } from "@/lib/prisma";
import {
  runSimulation,
  createSupplierOptimizationScenario,
  createWorkforceLocalizationScenario,
  createAssetLocalizationScenario,
  createMixedScenario,
} from "../workbook/simulation-engine";
import { getLineValue } from "../workbook/scoring";
import type { StageOutcome } from "./common";

export async function stageRunSimulations(
  organizationId: string,
  workbookId: string,
): Promise<StageOutcome> {
  const lines = await prisma.lcWorkbookLine.findMany({
    where: { workbookId, workbook: { project: { organizationId } } },
    take: 100,
  });
  const spn01 = lines.find((l) => l.code === "SPN-01");
  const spn03 = lines.find((l) => l.code === "SPN-03");
  const wrk01 = lines.find((l) => l.code === "WRK-01");
  const wrk02 = lines.find((l) => l.code === "WRK-02");
  const ast01 = lines.find((l) => l.code === "AST-01");
  const ast02 = lines.find((l) => l.code === "AST-02");

  const simulations: Array<{ label: string; scenario: ReturnType<typeof createSupplierOptimizationScenario> }> = [];

  // Supplier: increase local spend by 15%
  if (spn01 && spn03) {
    const localVal = getLineValue(spn01) ?? 0;
    const increase = Math.round(localVal * 0.15);
    simulations.push({
      label: "supplier_15pct",
      scenario: createSupplierOptimizationScenario(increase, spn03),
    });
    // Supplier: increase local spend by 30%
    simulations.push({
      label: "supplier_30pct",
      scenario: createSupplierOptimizationScenario(Math.round(localVal * 0.3), spn03),
    });
  }

  // Workforce: hire additional 10 Saudi employees
  if (wrk01 && wrk02) {
    const saudiVal = getLineValue(wrk01) ?? 0;
    simulations.push({
      label: "workforce_10pct",
      scenario: createWorkforceLocalizationScenario(saudiVal + 10),
    });
  }

  // Asset: increase local assets by 20%
  if (ast01) {
    const assetVal = getLineValue(ast01) ?? 0;
    const increase = Math.round(assetVal * 0.2);
    simulations.push({
      label: "asset_20pct",
      scenario: createAssetLocalizationScenario(increase),
    });
  }

  // Mixed: supplier + workforce + asset combined
  if (spn01 && spn03 && wrk01 && wrk02 && ast01 && ast02) {
    const localVal = getLineValue(spn01) ?? 0;
    const saudiVal = getLineValue(wrk01) ?? 0;
    const totalWorkforceVal = getLineValue(wrk02) ?? 0;
    const assetVal = getLineValue(ast01) ?? 0;
    const totalAssetVal = getLineValue(ast02) ?? 0;
    const saudiHireDelta = 5; // hire 5 more saudis
    simulations.push({
      label: "mixed_combined",
      scenario: createMixedScenario(
        Math.round(localVal * 0.2),
        saudiHireDelta,
        saudiVal + saudiHireDelta,
        totalWorkforceVal + saudiHireDelta,
        Math.round(assetVal * 0.1),
        totalAssetVal,
      ),
    });
  }

  // Run all simulations
  let successCount = 0;
  const simResults: string[] = [];
  for (const sim of simulations) {
    try {
      const result = await runSimulation(organizationId, workbookId, sim.scenario);
      successCount++;
      const deltaStr = result.delta !== null
        ? `+${result.delta.toFixed(1)}%`
        : "N/A";
      simResults.push(`${sim.label}: ${deltaStr}`);
    } catch {
      simResults.push(`${sim.label}: failed`);
    }
  }

  return {
    status: successCount > 0 ? "success" : "skipped",
    summary: successCount > 0
      ? `Ran ${successCount}/${simulations.length} simulations: ${simResults.join("; ")}`
      : "No simulations run",
    details: {
      attempted: simulations.length,
      succeeded: successCount,
      results: simResults,
    },
  };
}
