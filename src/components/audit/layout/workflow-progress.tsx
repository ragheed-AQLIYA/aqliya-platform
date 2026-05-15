"use client"

import { cn } from "@/lib/utils"
import { Check, Circle } from "lucide-react"

const workflowSteps = [
  "إعداد",
  "إدخال البيانات",
  "تعيين",
  "التحقق",
  "القوائم",
  "الأدلة",
  "النتائج",
  "التوصيات",
  "المراجعة",
  "الاعتماد",
  "النشر",
]

const engagementStepMap: Record<string, number> = {
  draft: 0,
  setup: 0,
  in_progress: 1,
  under_review: 8,
  awaiting_client: 4,
  ready_for_approval: 9,
  approved: 10,
  published: 11,
  archived: 11,
}

interface WorkflowProgressProps {
  currentStep?: number
  status?: string
  className?: string
}

function WorkflowProgress({ currentStep, status, className }: WorkflowProgressProps) {
  const step = currentStep ?? (status ? engagementStepMap[status] ?? 0 : 0)

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <div className="flex items-center gap-0 min-w-max px-2 py-3">
        {workflowSteps.map((label, index) => {
          const isCompleted = index < step
          const isCurrent = index === step
          const isFuture = index > step

          return (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                    isCompleted && "border-emerald-500 bg-emerald-500 text-white",
                    isCurrent && "border-primary bg-primary text-primary-foreground ring-2 ring-primary/20",
                    isFuture && "border-gray-200 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-900"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium whitespace-nowrap transition-colors",
                    isCompleted && "text-emerald-600 dark:text-emerald-400",
                    isCurrent && "text-primary font-semibold",
                    isFuture && "text-gray-400 dark:text-gray-600"
                  )}
                >
                  {label}
                </span>
              </div>
              {index < workflowSteps.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-0.5 w-8 sm:w-12 md:w-16 rounded-full transition-colors",
                    isCompleted
                      ? "bg-emerald-500"
                      : isCurrent
                        ? "bg-gradient-to-r from-emerald-500 to-gray-200 dark:to-gray-700"
                        : "bg-gray-200 dark:bg-gray-700"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { WorkflowProgress, workflowSteps, engagementStepMap }
