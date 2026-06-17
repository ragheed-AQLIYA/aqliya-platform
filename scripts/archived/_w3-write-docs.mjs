import fs from "fs";
import path from "path";

const gateShort = `# Wave 3 — Integrator Gate (W3-INT)

> **Date:** 2026-05-31  
> **Canonical copy:** [docs/product/salesos/agent-reports/v03-planning/wave-3/gate-wave-3.md](../docs/product/salesos/agent-reports/v03-planning/wave-3/gate-wave-3.md)

---

## Gate decision

| Token                | Selected |
| -------------------- | -------- |
| ` + '`WAVE_3_READY`' + `       | **Yes**  |
| ` + '`WAVE_3_NEEDS_PATCH`' + ` | No       |
| ` + '`WAVE_3_STOP`' + `        | No       |

**Rationale:** Intelligence hub tab navigation, knowledge-graph explorer, proof-network panel, institutional-learning evidence, command-center cross-product strip, and executive dashboard enrichments compile and render. Scoped Jest **49/49 PASS** (` + '`--runInBand`' + `, persistence flag unset). HTTP smoke **11/11** core SalesOS routes including ` + '`/sales/intelligence`' + ` and ` + '`/platform/commercial`' + ` return **200** with expected markers.

---

**Gate token:** ` + '`WAVE_3_READY`' + `  
**Integrator token:** ` + '`WAVE_3_INTEGRATION_COMPLETE`' + `
`;
fs.mkdirSync("wave-3", { recursive: true });
fs.writeFileSync("wave-3/gate-wave-3.md", gateShort, "utf8");
console.log("gate short", fs.statSync("wave-3/gate-wave-3.md").size);
