/**
 * Pilot FS Extraction v2 — Use getScreenshot to capture pages
 * Usage: node scripts/pilot-extract-fs2.cjs
 */

const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");

const PDF_PATH = "C:\\Users\\PC\\Documents\\Aqliya\\Audited FSs 31-12-2025.pdf";
const OUT_DIR = "C:\\Users\\PC\\Documents\\Aqliya\\docs\\review\\localcontent";

async function main() {
  const buf = fs.readFileSync(PDF_PATH);
  const parser = new PDFParse({ data: buf });

  // Get page info first
  const info = await parser.getInfo();
  console.log(`Pages: ${info.total}`);

  // Try to extract text with different options
  const textResult = await parser.getText({
    pageJoiner: "\n\n=== PAGE {{page_number}} ===\n",
    lineEnforce: false,
  });
  
  const fullText = textResult.text;
  console.log(`\nText length: ${fullText.length} chars`);

  // Save full raw
  fs.writeFileSync(path.join(OUT_DIR, "FS_RAW_TEXT.txt"), fullText, "utf-8");

  // Try screenshots for key pages (1=cover, 2-5=statements)
  console.log("\nCapturing page screenshots...");
  const imgs = await parser.getScreenshot({
    first: 1,
    last: 8,
    scale: 2,
  });
  
  for (const p of imgs.pages) {
    const fname = `FS_PAGE_${p.pageNumber}.png`;
    const fpath = path.join(OUT_DIR, fname);
    // p.data is Uint8Array of PNG
    fs.writeFileSync(fpath, Buffer.from(p.data));
    console.log(`  Page ${p.pageNumber}: ${p.width}x${p.height}`);
  }

  console.log("\nDone. Screenshots saved.");
}

main().catch(e => { console.error(e); process.exit(1); });
