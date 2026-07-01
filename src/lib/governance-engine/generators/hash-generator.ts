export interface ManifestEntry {
  filename: string;
  version: string;
  hash: string;
  claims: number;
  products: string[];
}

export interface ManifestIndex {
  generated: string;
  manifests: Record<string, ManifestEntry>;
}

export class HashGenerator {
  generate(manifests: ManifestEntry[]): { content: string } {
    const sorted = [...manifests].sort((a, b) => a.filename.localeCompare(b.filename));

    const manifestRecord: Record<string, ManifestEntry> = {};
    for (const entry of sorted) {
      manifestRecord[entry.filename] = {
        filename: entry.filename,
        version: entry.version,
        hash: entry.hash,
        claims: entry.claims,
        products: [...entry.products].sort((a, b) => a.localeCompare(b)),
      };
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const index: ManifestIndex = {
      generated: `${year}-${month}-${day}`,
      manifests: manifestRecord,
    };

    const content = JSON.stringify(index, null, 2) + '\n';
    return { content };
  }
}
