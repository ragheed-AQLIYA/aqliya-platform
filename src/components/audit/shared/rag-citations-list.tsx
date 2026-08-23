"use client"

import { BookMarked } from "lucide-react"
import { RagCitation } from "@/components/audit/shared/rag-citation"
import type { IfrsRagCitation } from "@/lib/audit/rules/types"

interface RagCitationsListProps {
  citations: IfrsRagCitation[]
  size?: "sm" | "md"
}

function RagCitationsList({ citations, size = "md" }: RagCitationsListProps) {
  if (citations.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <BookMarked className="size-3.5 shrink-0 text-violet-600 dark:text-violet-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          مرجع IFRS المعرفي
        </span>
      </div>
      <ul className="space-y-1.5">
        {citations.map((citation) => (
          <li key={citation.chunkId}>
            <RagCitation citation={citation} size={size} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export { RagCitationsList }
export type { RagCitationsListProps }
