import {
  ManifestGenerator,
  DossierGenerator,
  CoverageGenerator,
  FreshnessGenerator,
  HashGenerator,
  ReportGenerator,
} from '../../generators';
import { loadRegistries } from '../helpers';

const VALID_ARTIFACTS = [
  'manifest', 'dossier', 'coverage', 'freshness', 'hash', 'report', 'all',
] as const;

type ArtifactType = typeof VALID_ARTIFACTS[number];

function isArtifactType(value: string): value is ArtifactType {
  return VALID_ARTIFACTS.includes(value as ArtifactType);
}

export async function generateCommand(
  artifact: string,
  options: { product?: string; force?: boolean },
): Promise<number> {
  if (!isArtifactType(artifact)) {
    process.stderr.write(`Unknown artifact "${artifact}". Valid artifacts: ${VALID_ARTIFACTS.join(', ')}\n`);
    return 2;
  }

  const { registries, exitCode } = await loadRegistries();
  if (exitCode !== 0) return exitCode;

  const artifactsToGenerate: ArtifactType[] = artifact === 'all'
    ? [...VALID_ARTIFACTS].filter(a => a !== 'all') as ArtifactType[]
    : [artifact];

  let hasError = false;

  for (const art of artifactsToGenerate) {
    try {
      switch (art) {
        case 'manifest': {
          if (!options.product) {
            process.stderr.write('Error: --product is required for manifest generation\n');
            hasError = true;
            continue;
          }
          const gen = new ManifestGenerator();
          const result = gen.generate(options.product, registries);
          process.stdout.write(`Manifest generated for ${options.product} (hash: ${result.hash})\n`);
          break;
        }
        case 'dossier': {
          if (!options.product) {
            process.stderr.write('Error: --product is required for dossier generation\n');
            hasError = true;
            continue;
          }
          const mGen = new ManifestGenerator();
          const mResult = mGen.generate(options.product, registries);
          const dGen = new DossierGenerator();
          const dResult = dGen.generate(options.product, mResult.content, mResult.hash, registries);
          process.stdout.write(`Dossier generated for ${options.product} (hash: ${dResult.hash})\n`);
          break;
        }
        case 'coverage': {
          const gen = new CoverageGenerator();
          const result = gen.generate(registries);
          process.stdout.write(`Coverage report generated (${result.content.length} chars)\n`);
          break;
        }
        case 'freshness': {
          const gen = new FreshnessGenerator();
          const result = gen.generate(registries);
          process.stdout.write(`Freshness report generated (${result.content.length} chars)\n`);
          break;
        }
        case 'hash': {
          const gen = new HashGenerator();
          const manifests = registries.manifests.map(m => ({
            filename: `MANIFEST-${m.productId}.md`,
            version: m.version,
            hash: m.hash,
            claims: m.claims.length,
            products: [m.productId],
          }));
          const result = gen.generate(manifests);
          process.stdout.write(`Hash index generated (${result.content.length} chars)\n`);
          break;
        }
        case 'report': {
          const gen = new ReportGenerator();
          const result = gen.generate(registries, {});
          process.stdout.write(`Governance report generated (${result.content.length} chars)\n`);
          break;
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      process.stderr.write(`Error generating ${art}: ${message}\n`);
      hasError = true;
    }
  }

  return hasError ? 1 : 0;
}
