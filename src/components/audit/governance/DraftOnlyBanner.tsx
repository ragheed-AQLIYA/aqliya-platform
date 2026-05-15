"use client"

import { FileWarning } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DraftOnlyBannerProps {
  taskType?: string
  className?: string
}

const contextualMessages: Record<string, string> = {
  evidence: "الأدلة في حالة مسودة ويجب مراجعتها قبل الاستخدام في التقارير النهائية.",
  finding: "هذه النتيجة هي مسودة فقط وتتطلب اعتماداً بشرياً قبل أن تصبح نهائية.",
  recommendation: "التوصية مصنفة كمسودة وتحتاج إلى مراجعة بشرية قبل التبني.",
  approval: "سير اعتماد العمل في وضع المسودة. الاعتماد النهائي يتطلب توقيعاً بشرياً.",
  publication: "محتوى النشر هو مسودة فقط ويجب اعتماده قبل الإصدار.",
}

function DraftOnlyBanner({ taskType, className }: DraftOnlyBannerProps) {
  const contextMsg = taskType ? contextualMessages[taskType.toLowerCase()] : undefined

  return (
    <Card
      size="sm"
      className={cn("border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40", className)}
    >
      <CardContent className="flex items-start gap-2 px-3 py-2">
        <FileWarning className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
            مسودة فقط — مراجعة بشرية واعتماد مطلوب
          </p>
          {contextMsg && (
            <p className="text-[11px] leading-snug text-amber-700/80 dark:text-amber-400/70">
              {contextMsg}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { DraftOnlyBanner }
