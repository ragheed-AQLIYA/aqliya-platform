/**
 * Migrate all @/lib/rag/ consumers to canonical @/lib/core/knowledge/rag/
 *
 * Phase 1: Migrate consumers
 * Phase 2: Remove shims (only after zero consumers remain)
 *
 * Current consumers (from grep):
 * - src/lib/core/ai/orchestrator-rag-inject.ts
 * - src/lib/core/ai/ingestion/ingestion-pipeline.ts
 * - src/lib/core/ai/embedding/embedding-provider.ts
 * - src/lib/core/knowledge/engine.ts
 * - src/lib/core/knowledge/__tests__/engine.test.ts
 * - src/__tests__/unit/orchestrator-rag-inject.test.ts
 * - src/__tests__/unit/knowledge-api.test.ts
 * - src/__tests__/unit/hybrid-search.test.ts
 * - src/app/api/ai/knowledge/search/route.ts
 * - src/app/api/ai/knowledge/route.ts
 * - src/app/api/ai/knowledge/metadata/route.ts
 * - src/app/api/ai/knowledge/ingest/route.ts
 */

import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { existsSync } from "node:fs";

const SRC = join(process.cwd(), "src");

const files = [
  "lib/core/ai/orchestrator-rag-inject.ts",
  "lib/core/ai/ingestion/ingestion-pipeline.ts",
  "lib/core/ai/embedding/embedding-provider.ts",
  "lib/core/knowledge/engine.ts",
  "lib/core/knowledge/__tests__/engine.test.ts",
  "__tests__/unit/orchestrator-rag-inject.test.ts",
  "__tests__/unit/knowledge-api.test.ts",
  "__tests__/unit/hybrid-search.test.ts",
  "app/api/ai/knowledge/search/route.ts",
  "app/api/ai/knowledge/route.ts",
  "app/api/ai/knowledge/metadata/route.ts",
  "app/api/ai/knowledge/ingest/route.ts",
];

let updated = 0;
let unchanged = 0;

for (const file of files) {
  const filePath = join(SRC, file);
  if (!existsSync(filePath)) {
    console.log(`⚠  Not found: ${filePath}`);
    continue;
  }

  let content = await readFile(filePath, "utf-8");
  const original = content;

  // Replace @/lib/rag/ → @/lib/core/knowledge/rag/
  content = content.replace(/@\/lib\/rag\//g, "@/lib/core/knowledge/rag/");

  if (content !== original) {
    await writeFile(filePath, content);
    console.log(`✓ Updated: ${file}`);
    updated++;
  } else {
    console.log(`  No change: ${file}`);
    unchanged++;
  }
}

console.log(`\n✅ Done: ${updated} updated, ${unchanged} unchanged`);

// Verify no remaining @/lib/rag/ consumers outside src/lib/rag/
console.log(`\n🔍 Checking for remaining @/lib/rag/ consumers...`);
