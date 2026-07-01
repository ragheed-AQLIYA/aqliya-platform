import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

let _basePathOverride: string | undefined;

export function setBasePathOverride(path: string): void {
  _basePathOverride = path;
}

function resolveRoot(): string {
  if (_basePathOverride) {
    return _basePathOverride;
  }
  return process.cwd();
}

export function registryBasePath(): string {
  return resolve(join(resolveRoot(), 'docs', 'governance'));
}

export function governanceFilePath(relativePath: string): string {
  return resolve(join(registryBasePath(), relativePath));
}

export function readGovernanceFile(relativePath: string): string {
  const fullPath = governanceFilePath(relativePath);
  return readFileSync(fullPath, 'utf-8');
}
