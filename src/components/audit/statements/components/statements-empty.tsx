"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

export function StatementsEmpty() {
  const t = useTranslations("audit.statements");
  return (
    <Card>
      <CardContent className="p-6 text-muted-foreground">
        {t("noStatements")}
      </CardContent>
    </Card>
  );
}
