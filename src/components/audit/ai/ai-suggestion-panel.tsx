"use client"

import { Bot, CheckCircle2, XCircle, PencilLine, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface EvidenceTrace {
  id: string
  label: string
  type: string
  url?: string
}

interface AiSuggestion {
  content: string
  confidence?: number
  modelVersion?: string
  evidenceTrace?: EvidenceTrace[]
}

interface AiSuggestionPanelProps {
  suggestion: AiSuggestion
  onAccept: () => void
  onReject: () => void
  onEdit?: () => void
  className?: string
}

function AiSuggestionPanel({
  suggestion,
  onAccept,
  onReject,
  onEdit,
  className,
}: AiSuggestionPanelProps) {
  const confidence = suggestion.confidence
  const confidenceColor =
    confidence !== undefined
      ? confidence > 0.9
        ? "text-emerald-600"
        : confidence > 0.7
          ? "text-amber-600"
          : "text-red-600"
      : "text-muted-foreground"

  return (
    <div
      className={cn(
        "relative rounded-lg border-l-4 border-purple-400 bg-indigo-50/50 p-4 dark:border-purple-500 dark:bg-indigo-950/30",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300">
          <Bot className="h-2.5 w-2.5" />
          Suggested by AI
        </span>
        {suggestion.modelVersion && (
          <span className="text-[10px] font-mono text-muted-foreground">
            v{suggestion.modelVersion}
          </span>
        )}
        {confidence !== undefined && (
          <span className={cn("text-[10px] font-semibold", confidenceColor)}>
            {Math.round(confidence * 100)}% confidence
          </span>
        )}
      </div>

      <div className="mb-4 rounded-md border border-purple-200/50 bg-white p-3 text-sm text-foreground dark:border-purple-800/50 dark:bg-indigo-950/20">
        {suggestion.content}
      </div>

      {suggestion.evidenceTrace && suggestion.evidenceTrace.length > 0 && (
        <div className="mb-4">
          <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Evidence Trace
          </span>
          <div className="space-y-1">
            {suggestion.evidenceTrace.map((trace) => (
              <a
                key={trace.id}
                href={trace.url}
                className="group inline-flex items-center gap-1 rounded-md bg-white/50 px-2 py-1 text-xs text-muted-foreground hover:bg-white hover:text-foreground dark:bg-indigo-950/20 dark:hover:bg-indigo-950/50"
              >
                <ExternalLink className="h-3 w-3 shrink-0" />
                <span className="text-[10px] font-medium uppercase text-muted-foreground">
                  {trace.type}
                </span>
                <span className="mx-1 text-muted-foreground/40">·</span>
                <span>{trace.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button onClick={onAccept} size="sm" className="gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Accept
        </Button>
        <Button onClick={onReject} variant="destructive" size="sm" className="gap-1.5">
          <XCircle className="h-3.5 w-3.5" />
          Reject
        </Button>
        {onEdit && (
          <Button onClick={onEdit} variant="outline" size="sm" className="gap-1.5">
            <PencilLine className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
      </div>
    </div>
  )
}

export { AiSuggestionPanel }
export type { AiSuggestionPanelProps, AiSuggestion, EvidenceTrace }
