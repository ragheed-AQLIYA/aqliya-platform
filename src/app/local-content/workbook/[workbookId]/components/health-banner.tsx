import type { AiHealthReport } from "@/lib/local-content/workbook/ai-health";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  health: AiHealthReport | null;
}

export function HealthBanner({ health }: Props) {
  if (!health || health.healthy) return null;

  return (
    <Card className="border-amber-300 bg-amber-50">
      <CardContent className="p-3 text-sm text-amber-800">
        ⚠️ {health.recommendation}
      </CardContent>
    </Card>
  );
}
