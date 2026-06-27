import "server-only";
import PDFDocument from "pdfkit";

export interface DecisionExportInput {
  decisionId: string;
  title: string;
  status: string;
  ownerName: string | null;
  organizationName: string | null;
  createdAt: Date;
  recommendation: {
    type: string;
    confidenceScore: number | null;
    reasoning: string | null;
    conditions: string | null;
    riskNotes: string | null;
  } | null;
  tenderProfile: {
    clientName: string;
    estimatedContractValue: number | null;
    estimatedCost: number | null;
    durationMonths: number | null;
    marginEstimate: number | null;
    riskLevel: string | null;
    requiredCapacity: string | null;
    internalAvailableCapacity: string | null;
    strategicFitScore: number | null;
  } | null;
  scenarios: {
    type: string;
    feasibilityScore: number | null;
    financialScore: number | null;
    capacityScore: number | null;
    riskScore: number | null;
    strategicFitScore: number | null;
    overallDecisionScore: number | null;
  }[];
  auditLogs: {
    action: string;
    userName: string | null;
    createdAt: Date;
  }[];
  exportedAt: Date;
  exportedById: string;
}

export interface DecisionExportResult {
  format: "pdf";
  filename: string;
  mimeType: string;
  content: Buffer;
}

export async function buildDecisionReportPDF(
  input: DecisionExportInput,
): Promise<DecisionExportResult> {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 40, bottom: 50, left: 50, right: 50 },
    info: {
      Title: `Decision Report - ${input.title}`,
      Author: "AQLIYA DecisionOS",
      Subject: "Decision Report",
      Creator: "AQLIYA DecisionOS",
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const endPromise = new Promise<void>((resolve) =>
    doc.on("end", () => resolve()),
  );

  const sar = (v: number | null | undefined): string =>
    v != null ? `SAR ${v.toLocaleString("en-US")}` : "N/A";
  const pct = (v: number | null | undefined): string =>
    v != null ? `${v}%` : "N/A";
  const val = (v: string | null | undefined): string => v ?? "N/A";
  const bold = (text: string) =>
    doc.font("Helvetica-Bold").fontSize(9).text(text);
  const normal = (text: string) =>
    doc.font("Helvetica").fontSize(9).text(text);
  const section = (title: string) => {
    doc.moveDown(0.5);
    doc.fontSize(12).font("Helvetica-Bold").text(title);
    doc.moveDown(0.2);
  };

  doc.fontSize(16).font("Helvetica-Bold").text("DecisionOS", {
    align: "center",
  });
  doc.fontSize(12).font("Helvetica").text("Decision Report", {
    align: "center",
  });
  doc.moveDown(0.5);

  doc.fontSize(8).font("Helvetica");
  doc.text(`Exported: ${input.exportedAt.toISOString()}`);
  doc.text(`Status: ${input.status}`);
  doc.moveDown(0.5);

  section("Decision Header");
  bold("Title:");
  normal(input.title);
  bold("Owner:");
  normal(val(input.ownerName));
  bold("Organization:");
  normal(val(input.organizationName));
  bold("Created:");
  normal(input.createdAt.toISOString().split("T")[0]);

  if (input.tenderProfile) {
    const t = input.tenderProfile;
    section("Tender Context");
    bold("Client:");
    normal(t.clientName);
    bold("Contract Value:");
    normal(sar(t.estimatedContractValue));
    bold("Estimated Cost:");
    normal(sar(t.estimatedCost));
    bold("Duration:");
    normal(t.durationMonths != null ? `${t.durationMonths} months` : "N/A");
    bold("Margin:");
    normal(pct(t.marginEstimate));
    bold("Risk Level:");
    normal(val(t.riskLevel));
    bold("Required Capacity:");
    normal(val(t.requiredCapacity));
    bold("Available Capacity:");
    normal(val(t.internalAvailableCapacity));
    bold("Strategic Fit:");
    normal(pct(t.strategicFitScore));
  }

  section("Scenario Comparison");
  if (input.scenarios.length > 0) {
    const tableTop = doc.y;
    const colX = [50, 120, 190, 260, 330, 400, 470];
    const colW = 65;
    const headers = [
      "Scenario",
      "Feasibility",
      "Financial",
      "Capacity",
      "Risk",
      "Strategic",
      "Overall",
    ];

    doc.font("Helvetica-Bold").fontSize(7);
    for (let i = 0; i < headers.length; i++) {
      doc.text(headers[i], colX[i], tableTop, {
        width: colW,
        align: "left",
      });
    }
    doc.moveDown(0.3);

    doc.font("Helvetica").fontSize(7);
    for (const s of input.scenarios) {
      const y = doc.y;
      const row = [
        s.type.replace(/_/g, " "),
        s.feasibilityScore?.toString() ?? "N/A",
        s.financialScore?.toString() ?? "N/A",
        s.capacityScore?.toString() ?? "N/A",
        s.riskScore?.toString() ?? "N/A",
        s.strategicFitScore?.toString() ?? "N/A",
        s.overallDecisionScore?.toString() ?? "N/A",
      ];
      for (let i = 0; i < row.length; i++) {
        doc.text(row[i], colX[i], y, { width: colW, align: "left" });
      }
      doc.moveDown(0.2);
    }
  }

  if (input.recommendation) {
    const r = input.recommendation;
    section("Recommendation");
    bold("Type:");
    normal(r.type);
    if (r.confidenceScore != null) {
      bold("Confidence:");
      normal(`${r.confidenceScore}%`);
    }
    if (r.reasoning) {
      bold("Reasoning:");
      normal(r.reasoning);
    }
    if (r.conditions) {
      bold("Conditions:");
      normal(r.conditions);
    }
    if (r.riskNotes) {
      bold("Risk Notes:");
      normal(r.riskNotes);
    }
  }

  const range = doc.bufferedPageRange();
  if (range && range.count > 0) {
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(7).fillColor("#888888").font("Helvetica");
      doc.text(
        `AQLIYA DecisionOS — Page ${i + 1}`,
        50,
        doc.page.height - 50 - 10,
        { align: "center", width: 495 },
      );
    }
  }

  doc.end();
  await endPromise;

  const buffer = Buffer.concat(chunks);

  return {
    format: "pdf",
    filename: `decision_report_${input.decisionId.substring(0, 8)}.pdf`,
    mimeType: "application/pdf",
    content: buffer,
  };
}
