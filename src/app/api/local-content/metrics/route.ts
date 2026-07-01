import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireUserContext();

    const projectCount = await prisma.localContentProject.count();
    const workbookCount = await prisma.lcWorkbook.count();
    const supplierCount = await prisma.localContentSupplier.count();
    const spendCount = await prisma.localContentSpendRecord.count();
    const evidenceCount = await prisma.localContentEvidence.count();
    const findingCount = await prisma.localContentFinding.count();
    const reviewCount = await prisma.localContentReview.count();

    const lines = [
      "# HELP lcos_projects_total Total number of LCOS projects",
      "# TYPE lcos_projects_total gauge",
      `lcos_projects_total ${projectCount}`,
      "",
      "# HELP lcos_workbooks_total Total number of LCOS workbooks",
      "# TYPE lcos_workbooks_total gauge",
      `lcos_workbooks_total ${workbookCount}`,
      "",
      "# HELP lcos_suppliers_total Total number of LCOS suppliers",
      "# TYPE lcos_suppliers_total gauge",
      `lcos_suppliers_total ${supplierCount}`,
      "",
      "# HELP lcos_spend_records_total Total number of LCOS spend records",
      "# TYPE lcos_spend_records_total gauge",
      `lcos_spend_records_total ${spendCount}`,
      "",
      "# HELP lcos_evidence_total Total number of LCOS evidence records",
      "# TYPE lcos_evidence_total gauge",
      `lcos_evidence_total ${evidenceCount}`,
      "",
      "# HELP lcos_findings_total Total number of LCOS findings",
      "# TYPE lcos_findings_total gauge",
      `lcos_findings_total ${findingCount}`,
      "",
      "# HELP lcos_reviews_total Total number of LCOS reviews",
      "# TYPE lcos_reviews_total gauge",
      `lcos_reviews_total ${reviewCount}`,
      "",
    ];

    return new NextResponse(lines.join("\n"), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
