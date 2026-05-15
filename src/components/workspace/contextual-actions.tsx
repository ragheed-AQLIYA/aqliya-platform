import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Eye,
  CheckCircle2,
  Download,
  Share2,
  Edit,
  Trash2,
  FileText,
  Send,
} from "lucide-react"

export type ActionVariant = "default" | "secondary" | "ghost" | "destructive" | "outline"

interface ContextualAction {
  id: string
  label: string
  labelAr?: string
  icon: React.ElementType | string
  variant: ActionVariant
  action: () => void
  disabled?: boolean
  shortcut?: string
}

interface ContextualActionsProps {
  actions: ContextualAction[]
  className?: string
  orientation?: "horizontal" | "vertical"
}

const iconMap: Record<string, React.ElementType> = {
  Plus,
  Eye,
  CheckCircle2,
  Download,
  Share2,
  Edit,
  Trash2,
  FileText,
  Send,
}

function getActionSize(variant: ActionVariant): "default" | "sm" | "icon" {
  return variant === "ghost" ? "sm" : "default"
}

export function ContextualActions({
  actions,
  className,
  orientation = "horizontal",
}: ContextualActionsProps) {
  if (actions.length === 0) return null

  if (orientation === "vertical") {
    return (
      <div className={cn("space-y-1", className)}>
        {actions.map((action) => {
          const Icon = typeof action.icon === "string" ? (iconMap[action.icon as keyof typeof iconMap] || FileText) : action.icon
          return (
            <Button
              key={action.id}
              variant={action.variant}
              size={getActionSize(action.variant)}
              onClick={action.action}
              disabled={action.disabled}
              className="w-full justify-start"
            >
              <Icon className="h-4 w-4" />
              {action.label}
              {action.shortcut && (
                <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                  {action.shortcut}
                </kbd>
              )}
            </Button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {actions.map((action) => {
        const Icon = typeof action.icon === "string" ? (iconMap[action.icon as keyof typeof iconMap] || FileText) : action.icon
        return (
          <Button
            key={action.id}
            variant={action.variant}
            size={getActionSize(action.variant)}
            onClick={action.action}
            disabled={action.disabled}
          >
            <Icon className="h-4 w-4" />
            {action.label}
          </Button>
        )
      })}
    </div>
  )
}
