#!/usr/bin/env node
/**
 * Fix misplaced logger declarations from phase 4 script.
 * The script inserted `const logger = createLogger(...)` between:
 * - Union type branches (| { ok: true; data: T }  <HERE>  | { ok: false; ... })
 * - Multi-line import statements (import type { <HERE> Engagement, ... })
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = join(process.cwd(), "src");

// All files from tsc output with TS errors
const FILES = [
  "actions/sales-read-actions.ts",
  "actions/sales-review-list-actions.ts",
  "actions/sales-actions-helpers.ts",
  "actions/sales-actions/common.ts",
  "actions/audit-admin-actions.ts",
  "actions/audit-evidence-actions.ts",
  "app/api/auth/saml/[providerId]/initiate/route.ts",
  "app/api/custom-product-submit/route.ts",
  "app/api/pilot-review/route.ts",
  "app/sales/intelligence/actions.ts",
  "components/audit/trial-balance/trial-balance-page.tsx",
  "components/ui/error-boundary.tsx",
  "lib/audit/archival/run.ts",
  "lib/audit/db/types.ts",
  "lib/audit/reconciliation/reconciliation-engine.ts",
  "lib/audit/reporting-graph/graph-sync-service/sync-orchestrator.ts",
  "lib/audit/services/evidence.ts",
  "lib/audit/services/review.ts",
  "lib/core/ai/providers/llm-http-client.ts",
  "lib/core/ai/providers/openai-embedding-provider.ts",
  "lib/core/events/outbox-service.ts",
  "lib/knowledge-foundation/events.ts",
  "lib/local-content/audit-events.ts",
  "lib/platform/rate-limit/index.ts",
  "lib/platform/rate-limiter/memory-rate-limiter.ts",
  "lib/sales/audit-events.ts",
  "lib/sales/l5-governance.ts",
  "lib/sales/store/common.ts",
  "lib/salesos/api/safe.ts",
  "products/audit-os/audit-os-plugin.ts",
  "products/local-content-os/plugin.ts",
  "products/sales-os/sales-os-plugin.ts",
];

function fixFile(relPath) {
  const fp = join(ROOT, relPath);
  let content;
  try { content = readFileSync(fp, "utf-8"); } catch { return false; }
  
  const lines = content.split('\n');
  const loggerPattern = /^\s*const logger = createLogger\(\{[^}]+\}\);?\s*$/;
  
  // Find misplaced logger lines
  const misplaced = [];
  for (let i = 0; i < lines.length; i++) {
    if (loggerPattern.test(lines[i])) {
      const prev = i > 0 ? lines[i-1].trim() : '';
      const next = i < lines.length - 1 ? lines[i+1].trim() : '';
      
      // Misplaced if between union branches, inside import, or after incomplete statement
      const isMisplaced = 
        next.startsWith('|') ||        // union type branch
        next.startsWith('&') ||        // intersection type
        prev.includes('import type {') && !prev.includes('}') ||
        (prev.endsWith(',') && (next.startsWith('}') || next.startsWith('  '))) ||
        prev.endsWith('{') && !next.startsWith('}');
      
      if (isMisplaced) {
        misplaced.push(i);
      }
    }
  }
  
  if (misplaced.length === 0) return false;
  
  // Extract logger product/action from the misplaced lines
  let loggerProduct = "platform";
  let loggerAction = "unknown";
  
  for (const idx of misplaced) {
    const m = lines[idx].match(/product:\s*"([^"]+)"/);
    if (m) loggerProduct = m[1];
    const a = lines[idx].match(/action:\s*"([^"]+)"/);
    if (a) loggerAction = a[1];
  }
  
  // Remove misplaced logger lines (in reverse order to preserve indices)
  for (let i = misplaced.length - 1; i >= 0; i--) {
    lines.splice(misplaced[i], 1);
  }
  
  // Find correct insertion point: after all imports
  let lastImportEnd = -1;
  let inMultiLineImport = false;
  let braceDepth = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const trimmed = l.trim();
    
    if (trimmed.startsWith('import ')) {
      if (trimmed.includes('{')) {
        braceDepth = (trimmed.match(/{/g) || []).length - (trimmed.match(/}/g) || []).length;
        if (braceDepth > 0) {
          inMultiLineImport = true;
        } else {
          lastImportEnd = i;
          inMultiLineImport = false;
        }
      } else {
        lastImportEnd = i;
        inMultiLineImport = false;
      }
    } else if (inMultiLineImport) {
      braceDepth += (trimmed.match(/{/g) || []).length - (trimmed.match(/}/g) || []).length;
      if (braceDepth <= 0) {
        lastImportEnd = i;
        inMultiLineImport = false;
      }
    }
  }
  
  // Check if import already exists
  const hasImport = lines.some(l => l.includes('from "@/lib/observability/logger"'));
  
  const loggerDecl = `const logger = createLogger({ product: "${loggerProduct}", action: "${loggerAction}" });`;
  
  if (lastImportEnd >= 0) {
    if (!hasImport) {
      const importLine = 'import { createLogger } from "@/lib/observability/logger";';
      lines.splice(lastImportEnd + 1, 0, '', importLine, '', loggerDecl, '');
    } else {
      lines.splice(lastImportEnd + 1, 0, '', loggerDecl, '');
    }
  } else {
    // No imports found, add at top
    if (!hasImport) {
      const importLine = 'import { createLogger } from "@/lib/observability/logger";';
      lines.unshift(importLine, '', loggerDecl, '');
    } else {
      lines.unshift(loggerDecl, '');
    }
  }
  
  let result = lines.join('\n').replace(/\n{3,}/g, '\n\n');
  
  // Fix specific known patterns
  // Pattern: logger.warn(`msg ${...}:`, { detail: }) - broken ternary
  result = result.replace(/\{ detail: \}\)/g, '{ detail: undefined })');
  // Pattern: (e as Error }) - extra brace
  result = result.replace(/\(e as Error \}\)/g, '(e as Error)');
  // Pattern: engagementId: string, }) - broken function params
  // Pattern: logger.info("dry-run-output", { data: report }), null, 2)); - leftover from console.log conversion
  
  writeFileSync(fp, result, "utf-8");
  console.log(`Fixed: ${relPath}`);
  return true;
}

let fixed = 0;
for (const f of FILES) {
  if (fixFile(f)) fixed++;
}
console.log(`\nFixed ${fixed}/${FILES.length} files`);
