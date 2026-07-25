import Link from "next/link";
import type { SalesAccount, SalesOpportunity } from "@/lib/sales/types";

interface OpportunityHeaderProps {
  opportunity: SalesOpportunity;
  account: SalesAccount | null | undefined;
}

export function OpportunityHeader({
  opportunity,
  account,
}: OpportunityHeaderProps) {
  return (
    <div>
      <Link
        href="/sales/opportunities"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← المسار
      </Link>
      <h1 className="mt-2 text-h2 font-black">{opportunity.name}</h1>
      {account && (
        <p className="text-sm text-muted-foreground">
          الحساب:{" "}
          <Link
            href={`/sales/accounts/${account.id}`}
            className="text-primary hover:underline"
          >
            {account.nameAr ?? account.name}
          </Link>
        </p>
      )}
    </div>
  );
}
