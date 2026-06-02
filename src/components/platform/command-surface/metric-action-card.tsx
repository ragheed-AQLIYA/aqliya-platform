import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface MetricActionCardProps {
  id: string;
  labelAr: string;
  value: string | number;
  metricKey: string;
  productSlug: string;
  href: string;
}

export function MetricActionCard({
  id,
  labelAr,
  value,
  href,
}: MetricActionCardProps) {
  return (
    <Link href={href} id={id}>
      <Card className="rounded-xl transition-colors hover:bg-muted/50">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">{labelAr}</p>
          <p className="mt-1 text-lg font-bold">{value}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
