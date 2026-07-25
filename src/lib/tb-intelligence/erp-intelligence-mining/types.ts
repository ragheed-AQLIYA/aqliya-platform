/**
 * Types for ERP intelligence mining.
 */

export type ErpTrainingRow = {
  accountCode: string;
  accountName: string;
  canonicalCode: string;
  map1?: string | null;
  map2?: string | null;
};

export type MineErpOptions = {
  includeExactNames?: boolean;
  useMap2Refinement?: boolean;
  prefixLengths?: number[];
  minPrefixSupport?: number;
  minPrefixCount?: number;
  minMapSupport?: number;
  minMapCount?: number;
  minNamePatternCount?: number;
  maxNamePatterns?: number;
};
