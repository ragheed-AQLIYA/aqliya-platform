import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });

process.env.FF_AUDIT_RECONCILIATION = "true";
process.env.FF_AUDIT_FS_V2 = "true";

const mod = await import("../../src/lib/audit/reconciliation/reconciliation-engine.ts");
const r = await mod.runReconciliationForEngagement("eng-gulf-2025");
for (const c of r.checks) {
  console.log(JSON.stringify(c, null, 0));
}
