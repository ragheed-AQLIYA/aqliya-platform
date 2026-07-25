import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { SalesEvidenceRef } from "@/lib/sales/store";

interface OpportunityEvidenceCardProps {
  evidence: SalesEvidenceRef[];
}

export function OpportunityEvidenceCard({
  evidence,
}: OpportunityEvidenceCardProps) {
  return (
    <EnterpriseCard>
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>الأدلة التجارية المرتبطة</EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent>
        {evidence.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد أدلة بعد</p>
        ) : (
          <ul className="space-y-2">
            {evidence.map((e) => (
              <li key={e.id} className="text-sm">
                {e.label} ({e.typeId})
              </li>
            ))}
          </ul>
        )}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
