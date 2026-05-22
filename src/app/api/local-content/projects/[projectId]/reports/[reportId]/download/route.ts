import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { assertProjectAccess } from "@/lib/local-content/guards";
import { calculateProjectScore } from "@/lib/local-content/services";
import {
  buildAssessmentSummaryPDF,
  buildSpendClassificationXLSX,
  buildEvidenceIndexXLSX,
} from "@/lib/local-content/export";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string; reportId: string }> },
) {
  const { projectId, reportId } = await params;

  try {
    const user = await getCurrentUser();
    await assertProjectAccess(projectId, "view");

    const report = await prisma.localContentReport.findUnique({
      where: { id: reportId },
      select: {
        projectId: true,
        reportType: true,
        disclaimer: true,
        format: true,
      },
    });

    if (!report || report.projectId !== projectId) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const project = await prisma.localContentProject.findUnique({
      where: { id: projectId },
      select: { name: true, reportingPeriod: true },
    });

    const score = await calculateProjectScore(projectId);

    const input = {
      projectName: project?.name || "Unknown",
      reportingPeriod: project?.reportingPeriod || "FY2025",
      generatedBy: user.name,
      generatedAt: new Date().toISOString(),
      reviewStatus: "Pending",
      approvalStatus: "Pending",
      score,
      disclaimer: report.disclaimer || "",
    };

    let result: { filename: string; mimeType: string; content: string };
    switch (report.reportType) {
      case "spend_classification":
        result = buildSpendClassificationXLSX(input);
        break;
      case "evidence_index":
        result = buildEvidenceIndexXLSX(input);
        break;
      default:
        result = buildAssessmentSummaryPDF(input);
        break;
    }

    return new NextResponse(result.content, {
      status: 200,
      headers: {
        "Content-Type": result.mimeType,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthenticated") {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 },
        );
      }
      if (error.message.startsWith("Access denied")) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}
