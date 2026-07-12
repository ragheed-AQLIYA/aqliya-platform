"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface BulkAction {
  label: string
  action: string
  confirmMessage?: string
  requiresAdmin?: boolean
}

interface BulkActionBarProps {
  selectedCount: number
  onClearSelection: () => void
  actions: BulkAction[]
  onExecute: (action: string) => Promise<{ success: number; failed: number; errors: Array<{ id: string; error: string }> }>
  productType: string
}

export function BulkActionBar({ selectedCount, onClearSelection, actions, onExecute, productType }: BulkActionBarProps) {
  const [executing, setExecuting] = useState<string | null>(null)
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null)
  const router = useRouter()

  if (selectedCount === 0) return null

  async function handleAction(action: string) {
    const actionDef = actions.find((a) => a.action === action)
    if (actionDef?.confirmMessage) {
      if (!confirm(actionDef.confirmMessage)) return
    }

    setExecuting(action)
    setResult(null)

    try {
      const res = await onExecute(action)
      setResult({ success: res.success, failed: res.failed })
      if (res.failed === 0) {
        setTimeout(() => {
          setResult(null)
          onClearSelection()
          router.refresh()
        }, 2000)
      }
    } catch {
      setResult({ success: 0, failed: selectedCount })
    } finally {
      setExecuting(null)
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-xl border bg-card px-5 py-3 shadow-lg">
        <span className="text-sm font-medium">
          تم تحديد {selectedCount} {productType}
        </span>

        <div className="flex gap-2">
          {actions.map((action) => (
            <button
              key={action.action}
              onClick={() => handleAction(action.action)}
              disabled={executing !== null}
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
            >
              {executing === action.action ? "..." : action.label}
            </button>
          ))}
        </div>

        <button
          onClick={onClearSelection}
          className="text-sm text-muted-foreground underline hover:text-foreground"
        >
          إلغاء التحديد
        </button>

        {result && (
          <span className={`text-sm ${result.failed > 0 ? "text-red-600" : "text-green-600"}`}>
            {result.success} نجاح، {result.failed} فشل
          </span>
        )}
      </div>
    </div>
  )
}
