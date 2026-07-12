"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { globalSearch, type SearchResult } from "@/actions/search-actions"

const TYPE_LABELS: Record<SearchResult["type"], string> = {
  engagement: "مهمة تدقيق",
  decision: "قرار",
  project: "مشروع محتوى محلي",
  client: "عميل",
  contact: "جهة اتصال",
  evidence: "دليل",
  finding: "نتيجة تدقيق",
}

const TYPE_COLORS: Record<SearchResult["type"], string> = {
  engagement: "text-blue-600",
  decision: "text-purple-600",
  project: "text-emerald-600",
  client: "text-amber-600",
  contact: "text-cyan-600",
  evidence: "text-rose-600",
  finding: "text-orange-600",
}

export function GlobalSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const res = await globalSearch(q, 8)
      setResults(res)
      setIsOpen(true)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  function handleChange(value: string) {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 300)
  }

  function handleSelect(result: SearchResult) {
    setIsOpen(false)
    setQuery("")
    setResults([])
    router.push(result.url)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setIsOpen(false)
      inputRef.current?.blur()
    }
    if (e.key === "Enter" && results.length > 0) {
      handleSelect(results[0])
    }
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <svg
          className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="بحث في المنصة..."
          className="w-full rounded-xl border bg-background py-2.5 pr-10 pl-4 text-sm outline-none focus:border-primary"
          aria-label="بحث في المنصة"
        />
        {loading && (
          <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-muted border-t-primary" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border bg-card shadow-xl">
            {results.map((result) => (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleSelect(result)}
                className="flex w-full items-start gap-3 border-b p-3 text-right last:border-0 hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{result.title}</p>
                  {result.subtitle && (
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                      {result.subtitle}
                    </p>
                  )}
                </div>
                <span className={`shrink-0 text-[10px] font-medium ${TYPE_COLORS[result.type]}`}>
                  {TYPE_LABELS[result.type]}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
