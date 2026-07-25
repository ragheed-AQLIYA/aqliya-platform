import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";

interface OpportunityRisksCardProps {
  risks: string[];
}

export function OpportunityRisksCard({ risks }: OpportunityRisksCardProps) {
  if (risks.length === 0) return null;

  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>مخاطر مسجّلة على الفرصة</EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent>
        <ul className="list-inside list-disc text-sm">
          {risks.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
