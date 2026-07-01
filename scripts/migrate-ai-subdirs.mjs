/**
 * Migrate remaining src/lib/ai/ subdirectories to src/lib/core/ai/
 *
 * Subdirectories: eval/, runtime/, embedding/, retrieval/, ingestion/, review/, handlers/
 * Plus: eval-gate.ts (root-level real implementation)
 */

import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { existsSync } from "node:fs";

const AI_DIR = join(process.cwd(), "src/lib/ai");
const CORE_AI_DIR = join(process.cwd(), "src/lib/core/ai");

// ─── Subdirectory configurations ───
// Each entry: { name, files: [{ src, importUpdates }] }
// importUpdates: array of [fromPattern, toPattern]

const SUBDIRS = [
  {
    name: "eval",
    files: [
      "eval-types.ts",
      "eval-runner.ts",
    ],
    suites: [
      "index.ts",
      "financial-analysis.ts",
      "disclosure-notes.ts",
      "finding-summary.ts",
      "framework-self-test.ts",
    ],
  },
  {
    name: "runtime",
    files: [
      "index.ts",
      "inference-service.ts",
    ],
  },
  {
    name: "embedding",
    files: [
      "embedding-provider.ts",
    ],
  },
  {
    name: "retrieval",
    files: [
      "similarity-search.ts",
      "context-builder.ts",
    ],
  },
  {
    name: "ingestion",
    files: [
      "ingestion-pipeline.ts",
    ],
  },
  {
    name: "review",
    files: [
      "ai-review-gate.ts",
    ],
  },
  {
    name: "handlers",
    files: [
      "register-handlers.ts",
      "analytical-review-handler.ts",
      "commercial-claim-assist-handler.ts",
      "disclosure-enrichment-handler.ts",
      "draft-notes-handler.ts",
      "evidence-suggestions-handler.ts",
      "finding-drafts-handler.ts",
      "pilot-decision-assist-handler.ts",
      "recommendation-drafts-handler.ts",
    ],
  },
];

// ─── Import path replacements (ordered: most specific first) ───
// These transformations are applied to files being copied to core/ai/

function transformImports(content, subdirName, fileName) {
  const REPLACEMENTS = [
    // Relative parent imports from files 2 levels deep (handlers/, eval/suites/)
    { from: /from\s+["']\.\.\/\.\.\/types["']/g, to: `from "@/lib/core/ai/types"` },
    { from: /from\s+["']\.\.\/\.\.\/orchestrator["']/g, to: `from "@/lib/core/ai/orchestrator"` },

    // Relative parent imports from files 1 level deep
    { from: /from\s+["']\.\.\/types["']/g, to: `from "@/lib/core/ai/types"` },
    { from: /from\s+["']\.\.\/orchestrator["']/g, to: `from "@/lib/core/ai/orchestrator"` },

    // Relative provider imports
    { from: /from\s+["']\.\.\/providers\/deterministic-provider["']/g, to: `from "@/lib/core/ai/providers/deterministic-provider"` },

    // eval/ subdirectory relative parent imports (suites -> eval/)
    { from: /from\s+["']\.\.\/eval-types["']/g, to: `from "@/lib/core/ai/eval/eval-types"` },

    // @/lib/ai/ absolute imports → @/lib/core/ai/
    { from: /@\/lib\/ai\//g, to: `@/lib/core/ai/` },
  ];

  for (const { from, to } of REPLACEMENTS) {
    content = content.replace(from, to);
  }

  return content;
}

function createShim(fileName, coreSubdir) {
  const nameNoExt = fileName.replace(/\.tsx?$/, "");
  if (fileName === "index.ts") {
    return `/**
 * Backward-compatible re-export. Canonical implementation at @/lib/core/ai/${coreSubdir}.
 * New code should import from @/lib/core/ai/${coreSubdir} directly.
 */
export * from "@/lib/core/ai/${coreSubdir}";
`;
  }
  return `/**
 * Backward-compatible re-export. Canonical implementation at @/lib/core/ai/${coreSubdir}/${fileName}
 * New code should import from @/lib/core/ai/${coreSubdir} directly.
 */
export * from "@/lib/core/ai/${coreSubdir}/${nameNoExt}";
`;
}

async function ensureDir(dir) {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
    console.log(`  Created directory: ${dir}`);
  }
}

// ─── Process each subdirectory ───
for (const subdir of SUBDIRS) {
  const srcDir = join(AI_DIR, subdir.name);
  const dstDir = join(CORE_AI_DIR, subdir.name);
  const testDir = join(srcDir, "__tests__");

  console.log(`\n📁 Processing ${subdir.name}/ ...`);

  // Create canonical directory
  await ensureDir(dstDir);

  // Copy each file with import transformations
  for (const file of subdir.files) {
    const srcFile = join(srcDir, file);
    if (!existsSync(srcFile)) {
      console.log(`  ⚠  Source not found: ${srcFile}`);
      continue;
    }
    const content = await readFile(srcFile, "utf-8");
    const transformed = transformImports(content, subdir.name, file);

    // Write canonical version
    await writeFile(join(dstDir, file), transformed);
    console.log(`  ✓ Canonical: ${dstDir}\\${file}`);

    // Write shim
    await writeFile(srcFile, createShim(file, subdir.name));
    console.log(`  ✓ Shim: ${srcFile}`);
  }

  // Handle suites/ sub-subdirectory
  if (subdir.suites) {
    const suitesSrcDir = join(srcDir, "suites");
    const suitesDstDir = join(dstDir, "suites");
    await ensureDir(suitesDstDir);

    for (const file of subdir.suites) {
      const srcFile = join(suitesSrcDir, file);
      if (!existsSync(srcFile)) {
        console.log(`  ⚠  Source not found: ${srcFile}`);
        continue;
      }
      const content = await readFile(srcFile, "utf-8");
      const transformed = transformImports(content, `${subdir.name}/suites`, file);

      await writeFile(join(suitesDstDir, file), transformed);
      console.log(`  ✓ Canonical: ${suitesDstDir}\\${file}`);

      await writeFile(srcFile, createShim(file, `${subdir.name}/suites`));
      console.log(`  ✓ Shim: ${srcFile}`);
    }
  }

  // Handle __tests__ directory — copy as-is (no shims needed, tests import direct)
  if (existsSync(testDir)) {
    const testDstDir = join(dstDir, "__tests__");
    await ensureDir(testDstDir);
    const testEntries = await readdir(testDir, { withFileTypes: true });
    for (const entry of testEntries) {
      if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
        const content = await readFile(join(testDir, entry.name), "utf-8");
        const transformed = transformImports(content, `${subdir.name}/__tests__`, entry.name);
        await writeFile(join(testDstDir, entry.name), transformed);
        console.log(`  ✓ Test: ${testDstDir}\\${entry.name}`);
        // Keep original test files in place (they still work via shims)
      }
    }
  }

  // Update imports in src/lib/core/ai/ files that reference this subdirectory
  // This is handled by the @/lib/ai/ → @/lib/core/ai/ replacement in the transform
}

// ─── Special handling: eval-gate.ts root-level file ───
console.log(`\n📄 Processing eval-gate.ts ...`);

// Read the real implementation
const evalGateReal = join(AI_DIR, "eval-gate.ts");
const evalGateCore = join(CORE_AI_DIR, "eval-gate.ts");
const realContent = await readFile(evalGateReal, "utf-8");

// Transform imports: ./eval/ → ./eval/ (stays the same since both are in core/ai/)
// But also need to handle any @/lib/ai/ references
let evalGateTransformed = realContent.replace(
  /@\/lib\/ai\//g,
  `@/lib/core/ai/`
);

// Write canonical version (overwrite the thin wrapper)
await writeFile(evalGateCore, evalGateTransformed);
console.log(`  ✓ Canonical: ${evalGateCore} (overwrote thin wrapper with real implementation)`);

// Add runEvalGate and AIEvalGate exports for backward compatibility if not present
if (!evalGateTransformed.includes("runEvalGate")) {
  const withCompat = evalGateTransformed + `
// ── Backward compatibility exports ──
export async function runEvalGate(
  suiteId: string,
  taskType: string,
  actualOutput: string,
  organizationId?: string,
): Promise<EvalGateResult> {
  return evaluateWithGate(suiteId, taskType, actualOutput, organizationId);
}

export const AIEvalGate = {
  evaluate: runEvalGate,
};
`;
  await writeFile(evalGateCore, withCompat);
  console.log(`  ✓ Added backward-compat exports to canonical eval-gate.ts`);
}

// Write shim in src/lib/ai/
const evalGateShim = `/**
 * Backward-compatible re-export. Canonical implementation at @/lib/core/ai/eval-gate.
 * New code should import from @/lib/core/ai/eval-gate directly.
 */
export * from "@/lib/core/ai/eval-gate";
`;
await writeFile(evalGateReal, evalGateShim);
console.log(`  ✓ Shim: ${evalGateReal}`);

// ─── Update remaining core/ai/ files that import from @/lib/ai/ ---
// We already did this for providers/ in the first script.
// Now ensure all imports in core/ai/ point to @/lib/core/ai/ instead of @/lib/ai/
console.log(`\n🔄 Updating remaining @/lib/ai/ imports in src/lib/core/ai/ ...`);

const coreFiles = [
  "orchestrator.ts",
  "provider-factory.ts",
  "provider-router.ts",
  "observability.ts",
  "governed-ai-executor.ts",
  "generate.ts",
  "hybrid-router.ts",
  "model-registry.ts",
  "orchestrator-rag-inject.ts",
  "prompt-registry.ts",
  "spend-tracker.ts",
  "engine.ts",
  "cost-governance.ts",
  "provider-router-constants.ts",
  "governed-ai-metadata.ts",
  "intelligence-runtime.ts",
];

for (const file of coreFiles) {
  const filePath = join(CORE_AI_DIR, file);
  if (!existsSync(filePath)) {
    continue;
  }
  let content = await readFile(filePath, "utf-8");
  
  // Replace @/lib/ai/ → @/lib/core/ai/ but only in import paths
  const updated = content.replace(
    /from\s+["']@\/lib\/ai\//g,
    `from "@/lib/core/ai/`
  );

  if (updated !== content) {
    await writeFile(filePath, updated);
    console.log(`  ✓ Updated imports in ${file}`);
  }
}

// ─── Also update dynamic imports in orchestrator ───
// import("@/lib/ai/providers/ai-provider-factory") was already handled in first script
// but check for any other dynamic imports
const orchestratorPath = join(CORE_AI_DIR, "orchestrator.ts");
let orchContent = await readFile(orchestratorPath, "utf-8");
// Check if there are any remaining @/lib/ai/ references (dynamic imports)
if (orchContent.includes("@/lib/ai/")) {
  orchContent = orchContent.replace(/@\/lib\/ai\//g, `@/lib/core/ai/`);
  await writeFile(orchestratorPath, orchContent);
  console.log(`  ✓ Fixed remaining @/lib/ai/ references in orchestrator.ts`);
}

// ─── Update test files that import from @/lib/ai/ ───
// Tests in src/lib/ai/__tests__/ can keep importing from @/lib/ai/ — they work through shims
// Tests in src/lib/core/ai/__tests__/ should import from @/lib/core/ai/
// This is already correct since they use relative imports

console.log(`\n✅ All subdirectory migrations complete!`);
