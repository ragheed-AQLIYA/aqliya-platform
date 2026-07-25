/**
 * Mock for engineering/lib/fs-utils.mjs
 * Provides controlled test data for scanner regression tests.
 */

const mockFiles = new Map();
const mockExistsResults = new Map();

export function setMockFile(relPath, content) {
  mockFiles.set(relPath, content);
}

export function setMockExists(absPath, exists) {
  mockExistsResults.set(absPath, exists);
}

export function resetMocks() {
  mockFiles.clear();
  mockExistsResults.clear();
}

export function collectSourceFiles() {
  return [...mockFiles.keys()];
}

export function readText(absPath) {
  // Try to find content by relative path match
  for (const [rel, content] of mockFiles) {
    if (absPath.endsWith(rel) || absPath.includes(rel)) return content;
  }
  return null;
}

export function rel(absPath) {
  // Return the path as-is if it's already relative, or strip common prefixes
  if (absPath.startsWith("src/") || absPath.startsWith("prisma/")) return absPath;
  return absPath.replace(/^.*?[\\/](src|prisma)/, "$1");
}

export function abs(...parts) {
  return parts.join("/");
}

export function exists(absPath) {
  if (mockExistsResults.has(absPath)) return mockExistsResults.get(absPath);
  // Check if any mock file matches
  for (const key of mockFiles.keys()) {
    if (absPath.endsWith(key) || absPath.includes(key)) return true;
  }
  return false;
}

export function lineCount(content) {
  if (!content) return 0;
  return content.split(/\r?\n/).length;
}
