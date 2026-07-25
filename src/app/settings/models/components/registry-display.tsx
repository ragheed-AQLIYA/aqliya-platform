"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { RegistryEntry } from "./use-model-governance"

interface RegistryDisplayProps {
  entries: RegistryEntry[]
}

export function RegistryDisplay({ entries }: RegistryDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">سجل النماذج (ملف)</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-xs text-muted-foreground">
          نماذج مسجلة في ملف model-registry.ts (قراءة فقط — تستخدم كمرجع للمزودين الافتراضيين)
        </p>
        <div className="flex flex-wrap gap-2">
          {entries.map((e, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {e.provider}: {e.id} ({e.status})
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
