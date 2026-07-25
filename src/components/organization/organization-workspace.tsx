"use client";

import { OrgHeader } from "./components/org-header";
import { OverviewCards } from "./components/overview-cards";
import { ProductsList } from "./components/products-list";
import { EmployeesSummary } from "./components/employees-summary";
import { OrganizationActions } from "./components/organization-actions";
import { useOrganizationWorkspace } from "./components/use-organization-workspace";
import type { OrgData } from "./components/use-organization-workspace";

export type { OrgData };

export function OrganizationWorkspace({ data }: { data: OrgData }) {
  const { products } = useOrganizationWorkspace(data);

  return (
    <div className="space-y-8" dir="rtl">
      <OrgHeader name={data.name} nameAr={data.nameAr} />
      <OverviewCards
        total={data.userCounts.total}
        admin={data.userCounts.admin}
        operator={data.userCounts.operator}
        viewer={data.userCounts.viewer}
      />
      <ProductsList products={products} />
      <EmployeesSummary
        admin={data.userCounts.admin}
        operator={data.userCounts.operator}
        viewer={data.userCounts.viewer}
        sunbulMembershipCount={data.sunbulMembershipCount}
        sunbulClientCount={data.sunbulClientCount}
      />
      <OrganizationActions
        orgId={data.orgId}
        name={data.name}
        platformOrgId={data.platformOrgId || ""}
      />
    </div>
  );
}
