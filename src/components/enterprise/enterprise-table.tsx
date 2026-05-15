import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown, MoreHorizontal } from "lucide-react"

interface EnterpriseTableProps {
  columns: {
    key: string
    header: string
    sortable?: boolean
    align?: "left" | "right" | "center"
    className?: string
  }[]
  data: Record<string, unknown>[]
  className?: string
  onSort?: (key: string, direction: "asc" | "desc") => void
  sortKey?: string
  sortDirection?: "asc" | "desc"
  emptyMessage?: string
  rowAction?: (row: Record<string, unknown>) => void
}

export function EnterpriseTable({
  columns,
  data,
  className,
  onSort,
  sortKey,
  sortDirection,
  emptyMessage = "No data available",
  rowAction,
}: EnterpriseTableProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border bg-card", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "h-10 px-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.className
                  )}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => onSort?.(col.key, sortKey === col.key && sortDirection === "asc" ? "desc" : "asc")}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      {col.header}
                      {sortKey === col.key ? (
                        sortDirection === "asc" ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ChevronUp className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
              {rowAction && <th className="h-10 w-10 px-2" />}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                className={cn(
                  "border-b last:border-0 transition-colors",
                  rowAction && "cursor-pointer hover:bg-muted/50"
                )}
                onClick={() => rowAction?.(row)}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "h-12 px-4 text-foreground",
                      col.align === "right" && "text-right tabular-nums",
                      col.align === "center" && "text-center",
                      col.className
                    )}
                  >
                    {String(row[col.key] ?? "")}
                  </td>
                ))}
                {rowAction && (
                  <td className="h-12 px-2">
                    <button
                      className="rounded-md p-1 hover:bg-muted transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
