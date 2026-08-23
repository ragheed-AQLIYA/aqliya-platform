"use client";

import { useEffect, useId, useRef, useState } from "react";
import { BookOpen, ChevronDown, Loader2 } from "lucide-react";
import { RagCitationsList } from "@/components/audit/shared/rag-citations-list";
import { getFindingIfrsCitations } from "@/actions/audit/finding-citation-actions";
import { cn } from "@/lib/utils";
import type { IfrsRagCitation } from "@/lib/audit/rules/types";

interface FindingRagCitationsProps {
  title: string;
  description: string;
}

export function FindingRagCitations({
  title,
  description,
}: FindingRagCitationsProps) {
  const [expanded, setExpanded] = useState(false);
  // Ref, not state: flipping a state flag inside the effect would change the
  // effect deps, re-run it, and fire the cleanup that cancels the in-flight
  // request — leaving the panel stuck on the loading spinner forever.
  const fetchedRef = useRef(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [citations, setCitations] = useState<IfrsRagCitation[]>([]);
  const sectionId = useId();

  useEffect(() => {
    if (!expanded || fetchedRef.current) return;

    let cancelled = false;
    fetchedRef.current = true;
    setLoading(true);
    setFailed(false);

    getFindingIfrsCitations({ title, description })
      .then((result) => {
        if (!cancelled) setCitations(result);
      })
      .catch(() => {
        if (!cancelled) {
          setCitations([]);
          setFailed(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [expanded, title, description]);

  return (
    <div className="rounded border border-violet-200 bg-violet-50/50 p-2 dark:border-violet-800 dark:bg-violet-950/30">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={sectionId}
        aria-label="مراجع IFRS ذات الصلة"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded((value) => !value);
        }}
        className="flex w-full items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-400"
      >
        <BookOpen className="size-3.5 shrink-0" aria-hidden="true" />
        <span>مراجع IFRS ذات الصلة</span>
        <ChevronDown
          className={cn(
            "size-3.5 ms-auto shrink-0 transition-transform",
            expanded && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>
      {expanded && (
        <div id={sectionId} className="mt-2 space-y-2">
          {loading && (
            <div
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
              role="status"
            >
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              جارٍ البحث في قاعدة المعرفة IFRS...
            </div>
          )}
          {!loading && failed && (
            <p className="text-xs text-muted-foreground">
              تعذّر تحميل مراجع IFRS حالياً، حاول لاحقاً.
            </p>
          )}
          {!loading && !failed && citations.length === 0 && (
            <p className="text-xs text-muted-foreground">
              لا توجد مراجع ذات صلة
            </p>
          )}
          {!loading && !failed && citations.length > 0 && (
            <RagCitationsList citations={citations} size="sm" />
          )}
        </div>
      )}
    </div>
  );
}
