import { Card, CardContent } from "@/components/ui/card";
import { SECTION_LABELS } from "./constants";

interface Props {
  sections: Record<string, { section: string; autoFilled: boolean; manualValue: number | null }[]>;
}

export function SectionGrid({ sections }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Object.entries(sections).map(([section, lines]) => {
        const filled = lines.filter(
          (l) => l.autoFilled || l.manualValue !== null,
        ).length;
        const pct = Math.round((filled / lines.length) * 100);
        return (
          <Card key={section}>
            <CardContent className="p-3 text-center">
              <p className="text-xs font-medium truncate">
                {SECTION_LABELS[section] || section}
              </p>
              <p className="text-lg font-bold">{pct}%</p>
              <p className="text-[10px] text-muted-foreground">
                {filled}/{lines.length}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
