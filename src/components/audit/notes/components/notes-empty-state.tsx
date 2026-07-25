"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"

export function NotesEmptyState() {
  const t = useTranslations("audit.notes")

  return (
    <Card>
      <CardContent className="p-6 text-muted-foreground">{t("noNotes")}</CardContent>
    </Card>
  )
}
