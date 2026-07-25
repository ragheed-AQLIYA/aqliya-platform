/**
 * Shared helpers for ERP intelligence mining.
 */

import { normaliseAccountText } from "../synonyms";

export function dominantCanonical(
  counts: Record<string, number>,
): { code: string; count: number; total: number; ratio: number } | null {
  const entries = Object.entries(counts);
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  const [topCode, topCount] = entries[0]!;
  const total = entries.reduce((s, [, c]) => s + c, 0);
  return { code: topCode, count: topCount, total, ratio: topCount / total };
}

export function extractBankPatterns(name: string): string[] {
  const patterns: string[] = [];
  const bankMatch = name.match(/بنك\s+[\u0600-\u06FF\w]+|bank\s+[\w\s]+/gi);
  if (bankMatch) patterns.push(...bankMatch.map((m) => m.trim()));
  for (const token of ["الرياض", "الجزيرة", "البلاد", "الأهلي", "الراجحي"]) {
    if (name.includes(token)) patterns.push(`بنك ${token}`);
  }
  return patterns;
}

export function extractSubstrings(name: string, minLen = 5): string[] {
  const norm = normaliseAccountText(name);
  return norm.split(" ").filter((t) => t.length >= minLen);
}
