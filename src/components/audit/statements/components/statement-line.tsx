"use client";

import type { FinancialStatementLine } from "@/types/audit";

interface StatementLineProps {
  line: FinancialStatementLine;
  sar: (v: number | null | undefined) => string;
  onClick: () => void;
}

export function StatementLine({ line, sar, onClick }: StatementLineProps) {
  return (
    <div
      className={`flex items-center justify-between py-1 px-2 rounded cursor-pointer hover:bg-muted/50 ${line.isTotal ? "font-bold border-t border-dashed mt-1 pt-2" : ""}`}
      onClick={onClick}
      style={{
        paddingLeft: `${12 + (line.indentLevel ?? 0) * 20}px`,
      }}
    >
      <span
        className={
          line.isTotal ? "text-foreground" : "text-muted-foreground"
        }
      >
        {line.label}
      </span>
      <span className={line.isTotal ? "text-foreground" : ""}>
        {sar(line.amount)}
      </span>
    </div>
  );
}
