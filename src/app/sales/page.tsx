import { getCurrentUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SalesDashboardClient } from "./sales-dashboard-client";

export default async function SalesDashboardPage() {
  const user = await getCurrentUser();
  if (!user) notFound();

  const organizationId = user.organizationId;
  if (!organizationId) {
    return (
      <SalesDashboardClient
        stats={null}
        statsError="لم يتم تعيين المؤسسة للمستخدم الحالي"
        hasDbData={false}
      />
    );
  }

  try {
    const [accountCount, dealCount, openDealCount, stagesWithDeals, latestDeals] =
      await Promise.all([
        prisma.salesAccount.count({ where: { organizationId } }),
        prisma.salesDeal.count({ where: { organizationId } }),
        prisma.salesDeal.count({
          where: { organizationId, status: "open" },
        }),
        prisma.salesPipelineStage.findMany({
          where: { organizationId },
          orderBy: { sortOrder: "asc" },
          include: {
            deals: {
              where: { organizationId },
              select: {
                id: true,
                title: true,
                amount: true,
                currency: true,
                status: true,
                account: { select: { name: true } },
              },
              take: 5,
            },
            _count: { select: { deals: true } },
          },
        }),
        prisma.salesDeal.findMany({
          where: { organizationId },
          select: {
            id: true,
            title: true,
            status: true,
            updatedAt: true,
            account: { select: { name: true } },
          },
          orderBy: { updatedAt: "desc" },
          take: 5,
        }),
      ]);

    const stats = {
      accountCount,
      dealCount,
      openDealCount,
      dealsByStage: stagesWithDeals.map((stage) => ({
        id: stage.id,
        name: stage.name,
        slug: stage.slug,
        sortOrder: stage.sortOrder,
        _count: { deals: stage._count.deals },
        deals: stage.deals.map((d) => ({
          id: d.id,
          title: d.title,
          amount: d.amount,
          currency: d.currency,
          status: d.status,
          account: { name: d.account.name },
        })),
      })),
      latestDeals: latestDeals.map((d) => ({
        id: d.id,
        title: d.title,
        status: d.status,
        updatedAt: d.updatedAt,
        account: { name: d.account.name },
      })),
    };

    return (
      <SalesDashboardClient
        stats={stats}
        hasDbData={accountCount > 0 || dealCount > 0}
      />
    );
  } catch (error) {
    return (
      <SalesDashboardClient
        stats={null}
        statsError={
          error instanceof Error ? error.message : "خطأ في تحميل بيانات مسار البيع"
        }
        hasDbData={false}
      />
    );
  }
}
