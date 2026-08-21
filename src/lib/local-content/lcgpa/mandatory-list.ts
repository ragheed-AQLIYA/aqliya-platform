// ─── LocalContentOS — LCGPA Mandatory List Service ───
// Deterministic, explainable, versioned, auditable, reproducible.
// Implements LCGPA Mandatory List: 1,444+ products across 16 sectors.

import type {
  MandatoryListVersion,
  MandatoryListItem,
  MandatoryListSearchResult,
  MandatoryListClassification,
  MandatoryListImportResult,
  LcgpaSectorCode,
} from "./types";
import { LCGPA_SECTORS } from "./types";

/**
 * In-memory store for mandatory list versions.
 * In production, this would be backed by Prisma models LcMandatoryList / LcMandatoryListItem.
 */
const mandatoryListStore = new Map<string, {
  version: MandatoryListVersion;
  items: MandatoryListItem[];
  searchIndex: Map<string, MandatoryListItem[]>;
}>();

/**
 * Normalize Arabic text for search.
 * Removes diacritics, normalizes Alef variants, trims whitespace.
 */
function normalizeArabic(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[\u064B-\u065F]/g, "") // Remove diacritics
    .replace(/[أإآ]/g, "ا") // Normalize Alef variants
    .replace(/[ة]/g, "ه") // Normalize Ta Marbuta
    .replace(/[ى]/g, "ي") // Normalize Alef Maksura
    .trim()
    .toLowerCase();
}

/**
 * Normalize English text for search.
 */
function normalizeEnglish(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[^a-z0-9\s]/gi, "") // Keep alphanumeric and spaces
    .trim()
    .toLowerCase();
}

/**
 * Build search index for a list of items.
 * Indexes by: productCode, normalized productNameAr, normalized productNameEn, sectorCode
 */
function buildSearchIndex(items: MandatoryListItem[]): Map<string, MandatoryListItem[]> {
  const index = new Map<string, MandatoryListItem[]>();

  for (const item of items) {
    // Index by product code (exact)
    const codeKey = `code:${item.productCode.toLowerCase()}`;
    if (!index.has(codeKey)) index.set(codeKey, []);
    index.get(codeKey)!.push(item);

    // Index by normalized Arabic name
    const arKey = `name_ar:${normalizeArabic(item.productNameAr)}`;
    if (!index.has(arKey)) index.set(arKey, []);
    index.get(arKey)!.push(item);

    // Index by normalized English name
    if (item.productNameEn) {
      const enKey = `name_en:${normalizeEnglish(item.productNameEn)}`;
      if (!index.has(enKey)) index.set(enKey, []);
      index.get(enKey)!.push(item);
    }

    // Index by sector code
    const sectorKey = `sector:${item.sectorCode.toLowerCase()}`;
    if (!index.has(sectorKey)) index.set(sectorKey, []);
    index.get(sectorKey)!.push(item);

    // Index by partial Arabic name (3-grams for fuzzy matching)
    const arNormalized = normalizeArabic(item.productNameAr);
    for (let i = 0; i <= arNormalized.length - 3; i++) {
      const gram = arNormalized.slice(i, i + 3);
      if (/[ا-ي]/.test(gram)) { // Only index Arabic n-grams
        const gramKey = `gram:${gram}`;
        if (!index.has(gramKey)) index.set(gramKey, []);
        index.get(gramKey)!.push(item);
      }
    }
  }

  return index;
}

/**
 * Calculate similarity score between two strings (0-1).
 * Uses Jaro-Winkler-like approach for Arabic.
 */
function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (!a || !b) return 0;

  const lenA = a.length;
  const lenB = b.length;
  const maxLen = Math.max(lenA, lenB);

  // Simple Levenshtein-like similarity
  const dp = Array.from({ length: lenA + 1 }, (_, i) => Array(lenB + 1).fill(0));
  for (let i = 0; i <= lenA; i++) dp[i][0] = i;
  for (let j = 0; j <= lenB; j++) dp[0][j] = j;

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
      }
    }
  }

  return 1 - dp[lenA][lenB] / maxLen;
}

/**
 * Import mandatory list from XLSX data.
 * Expected columns: productCode, productNameAr, productNameEn, sectorCode, sectorNameAr, sectorNameEn, effectiveDate
 */
export function importMandatoryListFromXlsx(
  version: string,
  sourceUrl: string,
  effectiveDate: Date,
  rows: Array<{
    productCode: string;
    productNameAr: string;
    productNameEn?: string;
    sectorCode: string;
    sectorNameAr: string;
    sectorNameEn?: string;
    effectiveDate: string | Date;
  }>,
  importedById: string | null = null,
): MandatoryListImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const items: MandatoryListItem[] = [];
  const seenCodes = new Set<string>();

  // Validate version format
  if (!version || !/^\d{4}-Q[1-4]$/.test(version)) {
    errors.push(`Invalid version format: "${version}". Expected format: "YYYY-QN" (e.g., "2026-Q1")`);
    return {
      success: false,
      version: null,
      productCount: 0,
      sectorCount: 0,
      errors,
      warnings,
    };
  }

  // Check if version already exists
  if (mandatoryListStore.has(version)) {
    errors.push(`Version "${version}" already exists`);
    return {
      success: false,
      version: null,
      productCount: 0,
      sectorCount: 0,
      errors,
      warnings,
    };
  }

  // Process each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 1-indexed + header

    // Validate required fields
    if (!row.productCode || !row.productCode.trim()) {
      errors.push(`Row ${rowNum}: Missing productCode`);
      continue;
    }
    if (!row.productNameAr || !row.productNameAr.trim()) {
      errors.push(`Row ${rowNum}: Missing productNameAr`);
      continue;
    }
    if (!row.sectorCode || !row.sectorCode.trim()) {
      errors.push(`Row ${rowNum}: Missing sectorCode`);
      continue;
    }
    if (!row.sectorNameAr || !row.sectorNameAr.trim()) {
      errors.push(`Row ${rowNum}: Missing sectorNameAr`);
      continue;
    }

    const productCode = row.productCode.trim();
    const sectorCode = row.sectorCode.trim().padStart(2, "0");

    // Check for duplicate product codes
    if (seenCodes.has(productCode)) {
      warnings.push(`Row ${rowNum}: Duplicate productCode "${productCode}" - skipping`);
      continue;
    }
    seenCodes.add(productCode);

    // Validate sector code
    const validSector = LCGPA_SECTORS.find(s => s.code === sectorCode);
    if (!validSector) {
      warnings.push(`Row ${rowNum}: Unknown sectorCode "${sectorCode}" - importing anyway`);
    }

    // Parse effective date
    let effectiveDateParsed: Date;
    try {
      effectiveDateParsed = new Date(row.effectiveDate);
      if (isNaN(effectiveDateParsed.getTime())) {
        throw new Error("Invalid date");
      }
    } catch {
      effectiveDateParsed = effectiveDate; // Fallback to list effective date
      warnings.push(`Row ${rowNum}: Invalid effectiveDate, using list effective date`);
    }

    items.push({
      productCode,
      productNameAr: row.productNameAr.trim(),
      productNameEn: row.productNameEn?.trim() || null,
      sectorCode,
      sectorNameAr: row.sectorNameAr.trim(),
      sectorNameEn: row.sectorNameEn?.trim() || null,
      effectiveDate: effectiveDateParsed,
    });
  }

  if (items.length === 0 && errors.length === 0) {
    warnings.push("No valid products found in import");
  }

  // Create version metadata
  const sectorCodes = new Set(items.map(i => i.sectorCode));
  const versionMeta: MandatoryListVersion = {
    version,
    sourceUrl,
    effectiveDate,
    productCount: items.length,
    sectorCount: sectorCodes.size,
    status: "active",
    importedAt: new Date(),
    importedById,
  };

  // Build search index
  const searchIndex = buildSearchIndex(items);

  // Store in memory
  mandatoryListStore.set(version, {
    version: versionMeta,
    items,
    searchIndex,
  });

  // Supersede previous active version if any
  for (const [v, data] of mandatoryListStore.entries()) {
    if (v !== version && data.version.status === "active") {
      data.version.status = "superseded";
    }
  }

  return {
    success: errors.length === 0,
    version,
    productCount: items.length,
    sectorCount: sectorCodes.size,
    errors,
    warnings,
  };
}

/**
 * Get the active mandatory list version.
 */
export function getActiveMandatoryListVersion(): MandatoryListVersion | null {
  for (const data of mandatoryListStore.values()) {
    if (data.version.status === "active") {
      return data.version;
    }
  }
  return null;
}

/**
 * Get all mandatory list versions.
 */
export function getAllMandatoryListVersions(): MandatoryListVersion[] {
  return Array.from(mandatoryListStore.values())
    .map(d => d.version)
    .sort((a, b) => b.effectiveDate.getTime() - a.effectiveDate.getTime());
}

/**
 * Get items for a specific version.
 */
export function getMandatoryListItems(version: string): MandatoryListItem[] {
  const data = mandatoryListStore.get(version);
  return data ? [...data.items] : [];
}

/**
 * Search mandatory list by product code, name (Arabic/English), or sector.
 */
export function searchMandatoryList(
  query: string,
  version?: string,
  options?: {
    limit?: number;
    minScore?: number;
  },
): MandatoryListSearchResult[] {
  const limit = options?.limit ?? 50;
  const minScore = options?.minScore ?? 0.3;

  // Determine which versions to search
  const versionsToSearch = version
    ? [version]
    : Array.from(mandatoryListStore.keys()).filter(v => mandatoryListStore.get(v)!.version.status === "active");

  const results: Map<string, { item: MandatoryListItem; score: number; matchType: MandatoryListSearchResult["matchType"] }> = new Map();

  for (const v of versionsToSearch) {
    const data = mandatoryListStore.get(v);
    if (!data) continue;

    const normalizedQuery = normalizeArabic(query);
    const normalizedQueryEn = normalizeEnglish(query);

    // 1. Exact product code match (highest priority)
    const codeKey = `code:${query.toLowerCase()}`;
    if (data.searchIndex.has(codeKey)) {
      for (const item of data.searchIndex.get(codeKey)!) {
        const key = `${v}:${item.productCode}`;
        if (!results.has(key) || results.get(key)!.score < 1) {
          results.set(key, { item, score: 1, matchType: "exact_code" });
        }
      }
    }

    // 2. Exact Arabic name match
    const arKey = `name_ar:${normalizedQuery}`;
    if (data.searchIndex.has(arKey)) {
      for (const item of data.searchIndex.get(arKey)!) {
        const key = `${v}:${item.productCode}`;
        if (!results.has(key) || results.get(key)!.score < 0.95) {
          results.set(key, { item, score: 0.95, matchType: "exact_name" });
        }
      }
    }

    // 3. Exact English name match
    if (normalizedQueryEn) {
      const enKey = `name_en:${normalizedQueryEn}`;
      if (data.searchIndex.has(enKey)) {
        for (const item of data.searchIndex.get(enKey)!) {
          const key = `${v}:${item.productCode}`;
          if (!results.has(key) || results.get(key)!.score < 0.9) {
            results.set(key, { item, score: 0.9, matchType: "exact_name" });
          }
        }
      }
    }

    // 4. Partial Arabic name match (using n-grams)
    if (normalizedQuery.length >= 3) {
      const grams = new Set<string>();
      for (let i = 0; i <= normalizedQuery.length - 3; i++) {
        grams.add(normalizedQuery.slice(i, i + 3));
      }

      const candidateItems = new Map<string, { item: MandatoryListItem; count: number }>();
      for (const gram of grams) {
        const gramKey = `gram:${gram}`;
        if (data.searchIndex.has(gramKey)) {
          for (const item of data.searchIndex.get(gramKey)!) {
            const key = `${v}:${item.productCode}`;
            const current = candidateItems.get(key) || { item, count: 0 };
            current.count++;
            candidateItems.set(key, current);
          }
        }
      }

      // Score based on n-gram overlap
      for (const [key, { item, count }] of candidateItems.entries()) {
        const score = Math.min(0.85, 0.4 + (count / grams.size) * 0.45);
        if (score >= minScore && (!results.has(key) || results.get(key)!.score < score)) {
          results.set(key, { item, score, matchType: "partial_name" });
        }
      }
    }

    // 5. Sector match (lower priority)
    const sectorKey = `sector:${query.toLowerCase().padStart(2, "0")}`;
    if (data.searchIndex.has(sectorKey)) {
      for (const item of data.searchIndex.get(sectorKey)!) {
        const key = `${v}:${item.productCode}`;
        if (!results.has(key)) {
          results.set(key, { item, score: 0.3, matchType: "sector" });
        }
      }
    }
  }

  // Convert to array, sort by score descending, apply limit
  return Array.from(results.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ item, score, matchType }) => ({ item, score, matchType }));
}

/**
 * Classify a spend item against the mandatory list.
 * Returns whether the item is mandatory and the matching product info.
 * Also includes the official sector LC% rate from Appendix B when a sector is identified.
 */
export function classifySpendAgainstMandatoryList(
  spendItem: {
    productCode?: string;
    productNameAr?: string;
    productNameEn?: string;
    sectorCode?: string;
  },
  version?: string,
): MandatoryListClassification {
  // Pre-compute sector info for all branches
  const sectorRate = spendItem.sectorCode ? getSectorLcRate(spendItem.sectorCode) : null;
  const sectorInfo = sectorRate !== null
    ? { sectorLcRate: sectorRate, identifiedSectorCode: spendItem.sectorCode! }
    : {};

  // Try exact product code match first
  if (spendItem.productCode) {
    const results = searchMandatoryList(spendItem.productCode, version, { limit: 1, minScore: 0.9 });
    if (results.length > 0 && results[0].matchType === "exact_code") {
      return {
        isMandatory: true,
        match: results[0].item,
        confidence: 1.0,
        notes: "Exact product code match",
        ...sectorInfo,
      };
    }
  }

  // Try Arabic name match
  if (spendItem.productNameAr) {
    const results = searchMandatoryList(spendItem.productNameAr, version, { limit: 3, minScore: 0.7 });
    if (results.length > 0) {
      const best = results[0];
      if (best.matchType === "exact_name") {
        return {
          isMandatory: true,
          match: best.item,
          confidence: 0.95,
          notes: "Exact Arabic name match",
          ...sectorInfo,
        };
      } else if (best.matchType === "partial_name" && best.score >= 0.75) {
        return {
          isMandatory: true,
          match: best.item,
          confidence: best.score,
          notes: `Partial Arabic name match (score: ${best.score.toFixed(2)})`,
          ...sectorInfo,
        };
      }
    }
  }

  // Try English name match
  if (spendItem.productNameEn) {
    const results = searchMandatoryList(spendItem.productNameEn, version, { limit: 3, minScore: 0.7 });
    if (results.length > 0) {
      const best = results[0];
      if (best.matchType === "exact_name") {
        return {
          isMandatory: true,
          match: best.item,
          confidence: 0.9,
          notes: "Exact English name match",
          ...sectorInfo,
        };
      }
    }
  }

  // Try sector match (lower confidence)
  if (spendItem.sectorCode) {
    const results = searchMandatoryList(spendItem.sectorCode, version, { limit: 1, minScore: 0.3 });
    const sectorRate = getSectorLcRate(spendItem.sectorCode);
    if (results.length > 0 && results[0].matchType === "sector") {
      return {
        isMandatory: false, // Sector match alone doesn't mean mandatory
        match: null,
        confidence: 0.3,
        notes: `Sector match only - not classified as mandatory`,
        sectorLcRate: sectorRate ?? undefined,
        identifiedSectorCode: spendItem.sectorCode,
      };
    }
    // Even without a mandatory list match, if we know the sector, include its rate
    if (sectorRate !== null) {
      return {
        isMandatory: false,
        match: null,
        confidence: 0.2,
        notes: `Sector ${spendItem.sectorCode} identified, official LC rate applied`,
        sectorLcRate: sectorRate,
        identifiedSectorCode: spendItem.sectorCode,
      };
    }
  }

  return {
    isMandatory: false,
    match: null,
    confidence: 0,
    notes: "No match found in mandatory list",
  };
}

/**
 * Get all mandatory products for a specific sector.
 */
export function getMandatoryProductsBySector(
  sectorCode: string,
  version?: string,
): MandatoryListItem[] {
  const versionsToSearch = version
    ? [version]
    : Array.from(mandatoryListStore.keys()).filter(v => mandatoryListStore.get(v)!.version.status === "active");

  const items: MandatoryListItem[] = [];
  for (const v of versionsToSearch) {
    const data = mandatoryListStore.get(v);
    if (!data) continue;

    const sectorKey = `sector:${sectorCode.toLowerCase().padStart(2, "0")}`;
    if (data.searchIndex.has(sectorKey)) {
      items.push(...data.searchIndex.get(sectorKey)!);
    }
  }

  return items;
}

/**
 * Get sector info by code.
 */
export function getSectorInfo(sectorCode: string): { code: string; nameAr: string; nameEn: string } | null {
  const sector = LCGPA_SECTORS.find(s => s.code === sectorCode);
  return sector ? { code: sector.code, nameAr: sector.nameAr, nameEn: sector.nameEn } : null;
}

/**
 * Get the official LC% rate for a sector from Appendix B.
 * @param sectorCode - Sector code (e.g., "S01", "P09")
 * @returns LC% rate as decimal (0-1), or null if sector not found
 */
export function getSectorLcRate(sectorCode: string): number | null {
  const sector = LCGPA_SECTORS.find(s => s.code === sectorCode);
  return sector ? sector.lcRate : null;
}

/**
 * Get all sectors with their LC% rates.
 */
export function getAllSectorRates(): readonly { code: string; nameAr: string; nameEn: string; lcRate: number }[] {
  return LCGPA_SECTORS;
}

/**
 * Get all 16 LCGPA sectors.
 */
export function getAllSectors(): readonly { code: string; nameAr: string; nameEn: string }[] {
  return LCGPA_SECTORS;
}

/**
 * Clear all mandatory list data (for testing).
 */
export function clearMandatoryListStore(): void {
  mandatoryListStore.clear();
}

/**
 * Load mandatory list from Prisma models (for production use).
 * This would replace the in-memory store with database-backed queries.
 */
export async function loadMandatoryListFromDatabase(
  prisma: any, // PrismaClient
  version?: string,
): Promise<MandatoryListVersion | null> {
  // This is a placeholder for the database-backed implementation
  // In production, this would query LcMandatoryList and LcMandatoryListItem models
  throw new Error("Database-backed implementation not yet available. Use importMandatoryListFromXlsx for now.");
}