import type { ExtractedRegistries } from '../types/extracted-registries';
import { createLogger } from "@/lib/observability/logger";
import {
  GOVERNANCE_DIR,
  EVIDENCE_CATALOG_DIR,
  SOURCE_FILES,
  OUTPUT_DIR,
  OUTPUT_FILE,
  readMarkdown,
  countEntities,
  joinSegments,
} from './common';
import { extractClaims } from './claims';
import { extractProducts } from './products';
import { extractDecisions } from './decisions';
import { extractEvidence } from './evidence';
import { extractAuthorities } from './authorities';

const logger = createLogger({ product: "platform", action: "registry-extract" });

export class RegistryExtractor {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  async extractAll(): Promise<ExtractedRegistries> {
    const [claimContent, productContent, decisionContent, evidenceContent, authorityContent] =
      await Promise.all([
        readMarkdown(this.projectRoot, joinSegments(GOVERNANCE_DIR, SOURCE_FILES.claims)),
        readMarkdown(this.projectRoot, joinSegments(EVIDENCE_CATALOG_DIR, SOURCE_FILES.products)),
        readMarkdown(this.projectRoot, joinSegments(EVIDENCE_CATALOG_DIR, SOURCE_FILES.decisions)),
        readMarkdown(this.projectRoot, joinSegments(EVIDENCE_CATALOG_DIR, SOURCE_FILES.evidence)),
        readMarkdown(this.projectRoot, joinSegments(GOVERNANCE_DIR, SOURCE_FILES.authorities)),
      ]);

    const claims = extractClaims(claimContent);
    const products = extractProducts(productContent);
    const decisions = extractDecisions(decisionContent);
    const evidence = extractEvidence(evidenceContent);
    const authorities = extractAuthorities(authorityContent);

    return {
      claims,
      products,
      decisions,
      evidence,
      authorities,
      metadata: {
        extractedAt: new Date().toISOString(),
        sourceFiles: {
          claims: joinSegments(GOVERNANCE_DIR, SOURCE_FILES.claims),
          products: joinSegments(EVIDENCE_CATALOG_DIR, SOURCE_FILES.products),
          decisions: joinSegments(EVIDENCE_CATALOG_DIR, SOURCE_FILES.decisions),
          evidence: joinSegments(EVIDENCE_CATALOG_DIR, SOURCE_FILES.evidence),
          authorities: joinSegments(GOVERNANCE_DIR, SOURCE_FILES.authorities),
        },
        entityCounts: {
          claims: countEntities(claims),
          products: countEntities(products),
          decisions: countEntities(decisions),
          evidence: countEntities(evidence),
          authorities: countEntities(authorities),
        },
      },
    };
  }

  async writeOutput(registries: ExtractedRegistries): Promise<string> {
    const outDir = joinSegments(this.projectRoot, OUTPUT_DIR);
    const outFile = joinSegments(outDir, OUTPUT_FILE);

    const fs = await import('node:fs/promises');
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(outFile, JSON.stringify(registries, null, 2), { encoding: 'utf-8' });

    return outFile;
  }

  async run(): Promise<string> {
    const registries = await this.extractAll();
    return this.writeOutput(registries);
  }
}

async function main(): Promise<void> {
  const projectRoot = process.cwd();
  const extractor = new RegistryExtractor(projectRoot);

  try {
    const outPath = await extractor.run();
    logger.info("Registry extraction complete", { status: "ok", output: outPath });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("Registry extraction failed", error instanceof Error ? error : new Error(message), { status: "error", message });
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
