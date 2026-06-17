const fs = require("fs");
const path = require("path");
const root = path.join(process.env.USERPROFILE, ".cursor/projects");
const target = "sales-actions.ts";
const hits = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name.endsWith(".jsonl")) scan(p);
  }
}
function scan(file) {
  let i = 0;
  for (const line of fs.readFileSync(file, "utf8").split(/\n/)) {
    i++;
    if (!line.includes("sales-actions.ts")) continue;
    try {
      const o = JSON.parse(line);
      for (const part of o.message?.content || []) {
        if (part.name !== "Write") continue;
        const fp = part.input?.path || "";
        const c = part.input?.contents || "";
        if (!fp.includes(target)) continue;
        hits.push({ file, line: i, len: c.length, hasUpdate: c.includes("updateSalesDealAction") });
      }
    } catch {}
  }
}
walk(path.join(root, "c-Users-PC-Documents-Aqliya/agent-transcripts"));
walk(path.join(root, "empty-window/agent-transcripts"));
hits.sort((a,b) => b.len - a.len);
console.log("hits", hits.length);
hits.slice(0, 8).forEach(h => console.log(h.len, h.hasUpdate, path.basename(h.file), h.line));