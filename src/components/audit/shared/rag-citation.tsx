"use client"

import { BookOpen, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { IfrsRagCitation } from "@/lib/audit/rules/types"

interface RagCitationProps {
  citation: IfrsRagCitation
  size?: "sm" | "md"
  showPreview?: boolean
}

function getRelevanceColor(relevance: number) {
  if (relevance > 0.8) {
    return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800"
  }
  if (relevance > 0.6) {
    return "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-800"
  }
  return "text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-900 dark:border-gray-700"
}

function RagCitation({
  citation,
  size = "md",
  showPreview = true,
}: RagCitationProps) {
  const previewText =
    citation.contentPreview.length > 200
      ? citation.contentPreview.slice(0, 200) + "…"
      : citation.contentPreview

  const label = !citation.paragraphRef
    ? citation.standardCode
    : !citation.standardCode
      ? citation.paragraphRef
      : citation.paragraphRef.toUpperCase().startsWith(citation.standardCode.toUpperCase())
        ? citation.paragraphRef
        : `${citation.standardCode}.${citation.paragraphRef}`
  const relevancePercent = Math.round(citation.relevance * 100)

  if (size === "sm") {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs">
        <BookOpen className="size-3 shrink-0 text-violet-600 dark:text-violet-400" />
        <span className="font-medium text-foreground">{label}</span>
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium leading-none",
            getRelevanceColor(citation.relevance)
          )}
        >
          {relevancePercent}%
        </span>
        {citation.sourceUrl && (
          <a
            href={citation.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="size-3" />
          </a>
        )}
      </div>
    )
  }

  return (
    <Card className="border-violet-200 dark:border-violet-800">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <BookOpen className="size-3.5 shrink-0 text-violet-600 dark:text-violet-400" />
            <span className="text-xs font-semibold text-foreground">
              {label}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium leading-none",
                getRelevanceColor(citation.relevance)
              )}
            >
              {relevancePercent}%
            </span>
          </div>
          {citation.sourceUrl && (
            <a
              href={citation.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
        {showPreview && previewText && (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {previewText}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export { RagCitation }
export type { RagCitationProps }
