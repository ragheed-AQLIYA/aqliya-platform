"use client"

import { useState, useCallback } from "react"
import { Bot, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { updateAIOutputStatusAction } from "@/actions/audit-actions"

interface AIOutputDisplay {
  id: string
  suggestionType: string
  outputContent: string
  status: string
  confidence: number | null
  createdAt: string
  acceptedBy?: string
  rejectedBy?: string
}

interface AIOutputsPanelProps {
  engagementId: string
  initialOutputs: AIOutputDisplay[]
}

const statusConfig: Record<string, { label: string; color: string }> = {
  suggested: { label: "مسودة ذكاء اصطناعي", color: "bg-violet-100 text-violet-700 border-violet-200" },
  accepted_by_human: { label: "مقبول", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  rejected: { label: "مرفوض", color: "bg-red-100 text-red-700 border-red-200" },
}

export function AIOutputsPanel({ engagementId, initialOutputs }: AIOutputsPanelProps) {
  const [outputs, setOutputs] = useState<AIOutputDisplay[]>(initialOutputs)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAccept = useCallback(async (id: string) => {
    setLoadingId(id)
    setError(null)
    try {
      const result = await updateAIOutputStatusAction(id, "accepted_by_human")
      if (result) {
        setOutputs(prev => prev.map(o => o.id === id ? { ...o, status: "accepted_by_human" } : o))
      }
    } catch {
      setError("فشل قبول مخرج الذكاء الاصطناعي")
    } finally {
      setLoadingId(null)
    }
  }, [])

  const handleReject = useCallback(async (id: string) => {
    setLoadingId(id)
    setError(null)
    try {
      const result = await updateAIOutputStatusAction(id, "rejected")
      if (result) {
        setOutputs(prev => prev.map(o => o.id === id ? { ...o, status: "rejected" } : o))
      }
    } catch {
      setError("فشل رفض مخرج الذكاء الاصطناعي")
    } finally {
      setLoadingId(null)
    }
  }, [])

  if (outputs.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Bot className="h-4 w-4 text-violet-500" />
            مخرجات الذكاء الاصطناعي
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">لا توجد مخرجات ذكاء اصطناعي بعد.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Bot className="h-4 w-4 text-violet-500" />
          مخرجات الذكاء الاصطناعي
          <span className="text-[10px] font-normal text-muted-foreground mr-1">مسودة · تتطلب مراجعة بشرية · ليست نهائية</span>
        </CardTitle>
        <Badge variant="outline" className="text-[10px]">
          {outputs.filter(o => o.status === "suggested").length} قيد المراجعة
        </Badge>
      </CardHeader>
      <CardContent className="divide-y pt-0">
        {error && (
          <div className="flex items-center gap-2 py-2 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        )}
        {outputs.map((output) => {
          const config = statusConfig[output.status] ?? { label: output.status, color: "bg-gray-100 text-gray-700 border-gray-200" }
          return (
            <div key={output.id} className="flex items-start gap-3 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-200 bg-violet-50">
                <Bot className="h-4 w-4 text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={config.color}>
                    {config.label}
                  </Badge>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {output.suggestionType.replace(/_/g, " ")}
                  </span>
                  {output.confidence !== null && (
                    <span className="text-[10px] text-muted-foreground">
                      {Math.round(output.confidence * 100)}% ثقة
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground line-clamp-2">{output.outputContent}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {new Date(output.createdAt).toLocaleDateString("ar-SA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {output.status === "suggested" && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    onClick={() => handleAccept(output.id)}
                    disabled={loadingId === output.id}
                    title="قبول"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleReject(output.id)}
                    disabled={loadingId === output.id}
                    title="رفض"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {(output.status === "accepted_by_human" || output.status === "rejected") && (
                <div className="shrink-0">
                  {output.status === "accepted_by_human" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
