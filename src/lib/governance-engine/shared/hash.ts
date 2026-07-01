import { createHash } from 'node:crypto';

export function hashContent(content: string): string {
  return createHash('sha256').update(content, 'utf-8').digest('hex');
}

export function hashObject(obj: unknown): string {
  const serialized = JSON.stringify(obj, Object.keys(obj as Record<string, unknown>).sort());
  return hashContent(serialized);
}
