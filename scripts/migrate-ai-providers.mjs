/**
 * Migrate src/lib/ai/providers/ → src/lib/core/ai/providers/
 *
 * 1. Copies each provider file to core/ai/providers/ with updated imports
 * 2. Replaces original with a re-export shim
 * 3. Fixes import paths in src/lib/core/ai/ files
 */

import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

const AI_PROVIDERS = join(process.cwd(), "src/lib/ai/providers");
const CORE_PROVIDERS = join(process.cwd(), "src/lib/core/ai/providers");
const CORE_AI = join(process.cwd(), "src/lib/core/ai");

// ── 1. Copy all files from ai/providers/ to core/ai/providers/ ──
const entries = await readdir(AI_PROVIDERS, { withFileTypes: true });
const tsFiles = entries.filter(e => e.isFile() && (e.name.endsWith(".ts") || e.name.endsWith(".tsx")));

for (const entry of tsFiles) {
  const src = join(AI_PROVIDERS, entry.name);
  const dst = join(CORE_PROVIDERS, entry.name);
  let content = await readFile(src, "utf-8");

  // Replace `"../types"` → `"@/lib/core/ai/types"` (both value and type-only imports)
  content = content.replace(
    /from\s+["']\.\.\/types["']/g,
    `from "@/lib/core/ai/types"`
  );

  await writeFile(dst, content);
  console.log(`✓ Created ${dst}`);
}

// ── 2. Replace src/lib/ai/providers/ files with re-export shims ──
for (const entry of tsFiles) {
  const filePath = join(AI_PROVIDERS, entry.name);
  const nameNoExt = entry.name.replace(/\.tsx?$/, "");
  
  let shim;
  if (entry.name === "index.ts") {
    shim = `/**
 * Backward-compatible re-export. Canonical providers now live at @/lib/core/ai/providers.
 * New code should import from @/lib/core/ai/providers directly.
 */
export * from "@/lib/core/ai/providers";
`;
  } else {
    shim = `/**
 * Backward-compatible re-export. Canonical implementation at @/lib/core/ai/providers/${entry.name}
 * New code should import from @/lib/core/ai/providers directly.
 */
export * from "@/lib/core/ai/providers/${nameNoExt}";
`;
  }

  await writeFile(filePath, shim);
  console.log(`✓ Shim created ${filePath}`);
}

// ── 3. Update import paths in src/lib/core/ai/ ──
const coreFiles = [
  "orchestrator.ts",
  "provider-factory.ts",
  "provider-router.ts",
  "observability.ts",
  "index.ts",
];

for (const file of coreFiles) {
  const filePath = join(CORE_AI, file);
  if (!existsSync(filePath)) {
    console.log(`⚠  Skipping ${filePath} (not found)`);
    continue;
  }
  let content = await readFile(filePath, "utf-8");

  // Replace @/lib/ai/providers/ → @/lib/core/ai/providers/
  const newContent = content.replace(
    /@\/lib\/ai\/providers\//g,
    "@/lib/core/ai/providers/"
  );

  if (newContent !== content) {
    await writeFile(filePath, newContent);
    console.log(`✓ Updated imports in ${filePath}`);
  } else {
    console.log(`  No changes needed in ${filePath}`);
  }
}

// ── 4. Fix src/lib/core/ai/index.ts export * from "@/lib/ai/providers" ──
const indexPath = join(CORE_AI, "index.ts");
let indexContent = await readFile(indexPath, "utf-8");
indexContent = indexContent.replace(
  `export * from "@/lib/ai/providers"`,
  `export * from "./providers"`
);
await writeFile(indexPath, indexContent);
console.log(`✓ Updated index.ts barrel export`);

// ── 5. Update embedding-provider.ts in RAG ──
const ragProviderPath = join(process.cwd(), "src/lib/core/knowledge/rag/embedding-provider.ts");
if (existsSync(ragProviderPath)) {
  let ragContent = await readFile(ragProviderPath, "utf-8");
  const newRagContent = ragContent.replace(
    /@\/lib\/ai\/providers\/openai-embedding-provider/g,
    "@/lib/core/ai/providers/openai-embedding-provider"
  );
  if (newRagContent !== ragContent) {
    await writeFile(ragProviderPath, newRagContent);
    console.log(`✓ Updated RAG embedding-provider.ts import`);
  }
}

console.log("\n✅ Providers migration complete!");
