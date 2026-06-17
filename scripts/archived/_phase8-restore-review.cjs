const fs = require("fs");
const path = require("path");
const roots = [
  path.join(process.env.USERPROFILE, ".cursor/projects/c-Users-PC-Documents-Aqliya/agent-transcripts"),
  path.join(process.env.USERPROFILE, ".cursor/projects/empty-window/agent-transcripts"),
];
let best = null;
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name.endsWith(".jsonl")) scan(p);
  }
}
function scan(file) {
  for (const line of fs.readFileSync(file, "utf8").split(/\n/)) {
    try {
      const o = JSON.parse(line);
      for (const part of o.message?.content || []) {
        if (part.name !== "Write") continue;
        const fp = part.input?.path || "";
        const c = part.input?.contents || "";
        if (!fp.includes("sales-review-actions.ts")) continue;
        if (!best || c.length > best.contents.length) best = { contents: c };
      }
    } catch {}
  }
}
for (const r of roots) walk(r);
if (!best) { console.error("not found"); process.exit(1); }
const target = "C:/Users/PC/Documents/Aqliya/src/actions/sales-review-actions.ts";
fs.writeFileSync(target, best.contents, "utf8");
console.log("wrote", target, best.contents.length);