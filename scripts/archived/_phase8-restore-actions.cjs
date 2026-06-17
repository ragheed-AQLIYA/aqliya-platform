const fs = require("fs");
const path = require("path");
const file = path.join(process.env.USERPROFILE, ".cursor/projects/c-Users-PC-Documents-Aqliya/agent-transcripts/1d5d9be9-1be8-4dcf-881d-141c3cf3858e/1d5d9be9-1be8-4dcf-881d-141c3cf3858e.jsonl");
let best = null;
for (const line of fs.readFileSync(file, "utf8").split(/\n/)) {
  try {
    const o = JSON.parse(line);
    for (const part of o.message?.content || []) {
      if (part.name !== "Write") continue;
      const fp = part.input?.path || "";
      const c = part.input?.contents || "";
      if (!fp.includes("sales-actions.ts")) continue;
      if (!best || c.length > best.contents.length) best = { path: fp, contents: c };
    }
  } catch {}
}
if (!best) { console.error("not found"); process.exit(1); }
const rel = best.path.split("Documents\\Aqliya\\")[1].replace(/\\/g, "/");
const target = path.join("C:/Users/PC/Documents/Aqliya", rel);
fs.writeFileSync(target, best.contents, "utf8");
console.log("wrote", target, "bytes", best.contents.length, "hasUpdate", best.contents.includes("updateSalesDealAction"));