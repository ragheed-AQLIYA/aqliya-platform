"use client";

import { Card, CardContent } from "@/components/ui/card";

interface Props {
  title: string;
  titleAr: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
}

export function StatCard({
  title,
  titleAr,
  value,
  subtitle,
  icon: Icon,
  color = "text-primary",
}: Props) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{titleAr}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className="shrink-0 mr-3">
            <Icon className={`h-6 w-6 ${color} opacity-70`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
