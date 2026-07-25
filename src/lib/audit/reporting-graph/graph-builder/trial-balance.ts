import type { GraphBuildInput } from "../types";

export interface TbLineInfo {
  code: string;
  name: string;
  balance: number;
  id: string;
}

export function buildTbIndex(input: GraphBuildInput): Map<string, TbLineInfo> {
  const tbByCode = new Map<string, TbLineInfo>();
  for (const line of input.tbLines) {
    tbByCode.set(line.accountCode, {
      code: line.accountCode,
      name: line.accountName,
      balance: line.balance,
      id: line.id,
    });
  }
  return tbByCode;
}
