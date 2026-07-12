/**
 * Shared filesystem helpers for Engineering Excellence agents.
 * Read-only against application source.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SKIP_DIRS, SOURCE_EXTS, SCAN_ROOTS } from "../config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, "../..");
export const ENG_ROOT = path.resolve(__dirname, "..");

export function rel(absPath) {
  return path.relative(REPO_ROOT, absPath).split(path.sep).join("/");
}

export function abs(...parts) {
  return path.join(REPO_ROOT, ...parts);
}

export function engPath(...parts) {
  return path.join(ENG_ROOT, ...parts);
}

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

export function writeText(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
}

export function writeJson(filePath, data) {
  writeText(filePath, JSON.stringify(data, null, 2) + "\n");
}

export function readText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

export function exists(filePath) {
  return fs.existsSync(filePath);
}

function shouldSkipDir(name, fullRel) {
  if (SKIP_DIRS.has(name)) return true;
  for (const skip of SKIP_DIRS) {
    if (fullRel === skip || fullRel.startsWith(skip + "/")) return true;
  }
  return false;
}

/**
 * Walk directories under repo roots. Yields absolute paths.
 */
export function* walkFiles(roots = SCAN_ROOTS, { extensions = SOURCE_EXTS } = {}) {
  const queue = roots.map((r) => abs(r)).filter((p) => fs.existsSync(p));

  while (queue.length) {
    const dir = queue.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      const fullRel = rel(full);
      if (entry.isDirectory()) {
        if (shouldSkipDir(entry.name, fullRel)) continue;
        queue.push(full);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions === null || extensions.has(ext)) {
          yield full;
        }
      }
    }
  }
}

export function collectSourceFiles(roots = SCAN_ROOTS) {
  return [...walkFiles(roots)];
}

export function lineCount(content) {
  if (!content) return 0;
  return content.split(/\r?\n/).length;
}

export function countMatches(content, re) {
  if (!content) return 0;
  const flags = re.flags.includes("g") ? re.flags : re.flags + "g";
  const global = new RegExp(re.source, flags);
  return (content.match(global) || []).length;
}

export function isoNow() {
  return new Date().toISOString();
}

export function loadPackageJson() {
  const raw = readText(abs("package.json"));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loadLockPackages() {
  const lock = readText(abs("package-lock.json"));
  if (!lock) return null;
  try {
    return JSON.parse(lock);
  } catch {
    return null;
  }
}
