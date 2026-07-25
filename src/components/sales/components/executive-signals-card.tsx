import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  ExecutiveCommercialSection,
  ExecutiveCommercialSignal,
} from "@/lib/sales/services/executive-commercial-dashboard-service";
import { SectionFallback } from "./section-fallback";

export function ExecutiveSignalsCard({
  section,
}: {
  section: ExecutiveCommercialSection<ExecutiveCommercialSignal[]>;
}) {
  return (
    <Card className="rounded-xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">إشارات تجارية</CardTitle>
      </CardHeader>
      <CardContent>
        {section.status !== "ok" || !section.data || section.data.length === 0 ? (
          <SectionFallback section={section} />
        ) : (
          <ul className="space-y-2 text-sm">
            {section.data.map((item) => (
              <li
                key={`${item.source}-${item.label}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 p-2"
              >
                <span className="font-medium">{item.label}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {item.count}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {item.source}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/sales/intelligence"
          className="mt-3 block text-xs text-primary hover:underline"
        >
          الذاكرة التجارية
        </Link>
      </CardContent>
    </Card>
  );
}
