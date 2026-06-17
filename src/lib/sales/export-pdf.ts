import "server-only";
import { existsSync } from "node:fs";

const REGULAR_FONT_PATHS = [
  "C:/Windows/Fonts/arial.ttf",
  "/usr/share/fonts/truetype/noto/NotoSansArabic-Regular.ttf",
  "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
  "/Library/Fonts/Arial Unicode.ttf",
];

const BOLD_FONT_PATHS = [
  "C:/Windows/Fonts/arialbd.ttf",
  "/usr/share/fonts/truetype/noto/NotoSansArabic-Bold.ttf",
  "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
  "/Library/Fonts/Arial Bold.ttf",
];

function firstExistingPath(paths: string[]): string | null {
  return paths.find((fontPath) => existsSync(fontPath)) ?? null;
}

export function configureSalesPdfFonts(doc: PDFKit.PDFDocument): {
  regular: string;
  bold: string;
} {
  const regularPath = firstExistingPath(REGULAR_FONT_PATHS);
  const boldPath = firstExistingPath(BOLD_FONT_PATHS);

  if (regularPath) {
    doc.registerFont("SalesPdfRegular", regularPath);
  }

  if (boldPath) {
    doc.registerFont("SalesPdfBold", boldPath);
  }

  return {
    regular: regularPath ? "SalesPdfRegular" : "Helvetica",
    bold: boldPath ? "SalesPdfBold" : "Helvetica-Bold",
  };
}

export async function finalizeSalesPdf(
  doc: PDFKit.PDFDocument,
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const endPromise = new Promise<void>((resolve, reject) => {
    doc.on("end", () => resolve());
    doc.on("error", reject);
  });

  doc.end();
  await endPromise;
  return Buffer.concat(chunks);
}

export function buildSalesExportSafeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, "_");
}
