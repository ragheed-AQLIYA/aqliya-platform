"use client"

import { Check, X, Send, Upload, StopCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ModelItem } from "./use-model-governance"

interface ModelsTableProps {
  models: ModelItem[]
  onSubmitForReview: (id: string) => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onDeploy: (id: string) => void
  onDeprecate: (id: string) => void
}

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  PENDING_REVIEW: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  DEPRECATED: "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
}

const RISK_BADGE: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "مسودة",
  PENDING_REVIEW: "قيد المراجعة",
  APPROVED: "معتمد",
  REJECTED: "مرفوض",
  DEPRECATED: "موقوف",
}

export function ModelsTable({
  models,
  onSubmitForReview,
  onApprove,
  onReject,
  onDeploy,
  onDeprecate,
}: ModelsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">النماذج المسجلة في قاعدة البيانات</CardTitle>
      </CardHeader>
      <CardContent>
        {models.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {"لا توجد نماذج مسجلة بعد. سجّل أول نموذج بالضغط على \"تسجيل نموذج جديد\"."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium">الاسم</th>
                  <th className="pb-2 font-medium">المزود</th>
                  <th className="pb-2 font-medium">الإصدار</th>
                  <th className="pb-2 font-medium">النوع</th>
                  <th className="pb-2 font-medium">المخاطرة</th>
                  <th className="pb-2 font-medium">الحالة</th>
                  <th className="pb-2 font-medium">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.id} className="border-b last:border-0">
                    <td className="py-2">{m.name}</td>
                    <td className="py-2">{m.provider}</td>
                    <td className="py-2 font-mono text-xs">{m.version}</td>
                    <td className="py-2">{m.modelType}</td>
                    <td className="py-2">
                      <Badge className={RISK_BADGE[m.riskLevel] ?? ""}>{m.riskLevel}</Badge>
                    </td>
                    <td className="py-2">
                      <Badge className={STATUS_BADGE[m.status] ?? ""}>{STATUS_LABELS[m.status] ?? m.status}</Badge>
                    </td>
                    <td className="py-2">
                      <div className="flex gap-1">
                        {m.status === "DRAFT" && (
                          <Button size="sm" variant="outline" onClick={() => onSubmitForReview(m.id)} title="إرسال للمراجعة">
                            <Send className="h-3 w-3" />
                          </Button>
                        )}
                        {m.status === "PENDING_REVIEW" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => onApprove(m.id)} title="اعتماد">
                              <Check className="h-3 w-3 text-green-600" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => onReject(m.id)} title="رفض">
                              <X className="h-3 w-3 text-red-600" />
                            </Button>
                          </>
                        )}
                        {m.status === "APPROVED" && (
                          <Button size="sm" variant="outline" onClick={() => onDeploy(m.id)} title="نشر">
                            <Upload className="h-3 w-3" />
                          </Button>
                        )}
                        {(m.status === "APPROVED" || m.status === "DEPRECATED") && (
                          <Button size="sm" variant="outline" onClick={() => onDeprecate(m.id)} title="إيقاف">
                            <StopCircle className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
