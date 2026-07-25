"use client";

type OverviewSectionsProps = {
  decision: Record<string, unknown>;
};

export function OverviewSectionObjectives({ decision }: OverviewSectionsProps) {
  const objectives = decision.objectives as Array<{ id: string; description: string }> | undefined | null;
  if (!objectives || objectives.length === 0) return null;
  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">الأهداف</h2>
      <ul className="list-disc pl-5 text-sm">
        {objectives.map((obj) => (
          <li key={obj.id}>{obj.description}</li>
        ))}
      </ul>
    </section>
  );
}

export function OverviewSectionConstraints({ decision }: OverviewSectionsProps) {
  const constraints = decision.constraints as Array<{ id: string; description: string }> | undefined | null;
  if (!constraints || constraints.length === 0) return null;
  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">القيود</h2>
      <ul className="list-disc pl-5 text-sm">
        {constraints.map((con) => (
          <li key={con.id}>{con.description}</li>
        ))}
      </ul>
    </section>
  );
}

export function OverviewSectionAssumptions({ decision }: OverviewSectionsProps) {
  const assumptions = decision.assumptions as Array<{ id: string; description: string }> | undefined | null;
  if (!assumptions || assumptions.length === 0) return null;
  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">الافتراضات</h2>
      <ul className="list-disc pl-5 text-sm">
        {assumptions.map((ass) => (
          <li key={ass.id}>{ass.description}</li>
        ))}
      </ul>
    </section>
  );
}

export function OverviewSectionAlternatives({ decision }: OverviewSectionsProps) {
  const alternatives = decision.alternatives as Array<{ id: string; description: string }> | undefined | null;
  if (!alternatives || alternatives.length === 0) return null;
  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">البدائل</h2>
      <ul className="list-disc pl-5 text-sm">
        {alternatives.map((alt) => (
          <li key={alt.id}>{alt.description}</li>
        ))}
      </ul>
    </section>
  );
}

export function OverviewSectionRisks({ decision }: OverviewSectionsProps) {
  const risks = decision.risks as Array<{ id: string; description: string; level: string }> | undefined | null;
  if (!risks || risks.length === 0) return null;
  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">المخاطر</h2>
      <ul className="list-disc pl-5 text-sm">
        {risks.map((risk) => (
          <li key={risk.id}>
            {risk.description} -{" "}
            <span className="font-medium">{risk.level}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function OverviewSectionTenderProfile({ decision }: OverviewSectionsProps) {
  const tenderProfile = decision.tenderProfile as {
    clientName?: string;
    estimatedContractValue?: number;
    durationMonths?: number;
    marginEstimate?: number;
  } | undefined | null;
  if (!tenderProfile) return null;
  return (
    <section>
      <h2 className="text-lg font-semibold mb-2">ملف المنافسة</h2>
      <div className="text-sm grid grid-cols-2 gap-2">
        <div>
          <span className="text-muted-foreground">العميل:</span>{" "}
          {tenderProfile.clientName}
        </div>
        <div>
          <span className="text-muted-foreground">قيمة العقد:</span>{" "}
          {tenderProfile.estimatedContractValue?.toLocaleString()}{" "}
          ريال
        </div>
        <div>
          <span className="text-muted-foreground">المدة:</span>{" "}
          {tenderProfile.durationMonths} شهراً
        </div>
        <div>
          <span className="text-muted-foreground">الهامش:</span>{" "}
          {tenderProfile.marginEstimate}%
        </div>
      </div>
    </section>
  );
}
