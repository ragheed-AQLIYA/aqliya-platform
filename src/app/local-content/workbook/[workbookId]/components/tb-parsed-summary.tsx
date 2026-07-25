"use client";

import type { TbLine } from "@/lib/local-content/workbook/types";

interface Props {
  parsedLines: TbLine[];
}

export function TbParsedSummary({ parsedLines }: Props) {
  if (parsedLines.length === 0) return null;

  return (
    <div className="text-sm text-muted-foreground border rounded-lg p-3 max-h-40 overflow-y-auto">
      <p className="font-medium mb-1">
        البنود المستوردة ({parsedLines.length}):
      </p>
      {parsedLines.slice(0, 10).map((line, idx) => (
        <div key={idx} className="flex gap-2 text-xs font-mono py-0.5">
          <span className="w-24 truncate">{line.accountCode}</span>
          <span className="flex-1 truncate">{line.accountName}</span>
          <span className="w-24 text-left shrink-0">
            {line.debit > 0
              ? `مدين ${line.debit.toLocaleString("ar-SA")}`
              : line.credit > 0
                ? `دائن ${line.credit.toLocaleString("ar-SA")}`
                : "-"}
          </span>
        </div>
      ))}
      {parsedLines.length > 10 && (
        <p className="text-xs text-muted-foreground mt-1">
          ...و {parsedLines.length - 10} بند آخر
        </p>
      )}
    </div>
  );
}
