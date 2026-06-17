const fs = require("fs");
const path = require("path");
const repoRoot = "C:/Users/PC/Documents/Aqliya";
const transcriptRoot = path.join(process.env.USERPROFILE, ".cursor/projects/c-Users-PC-Documents-Aqliya/agent-transcripts");
const writes = new Map();
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name.endsWith(".jsonl")) ingest(p);
  }
}
function ingest(file) {
  for (const line of fs.readFileSync(file, "utf8").split(/\n/)) {
    if (!line.includes('"Write"')) continue;
    try {
      const o = JSON.parse(line);
      for (const part of o.message?.content || []) {
        if (part.type !== "tool_use" || part.name !== "Write") continue;
        const filePath = part.input?.path;
        const contents = part.input?.contents;
        if (!filePath || typeof contents !== "string") continue;
        if (!filePath.includes("Documents\\Aqliya\\src\\")) continue;
        writes.set(filePath, contents);
      }
    } catch {}
  }
}
walk(transcriptRoot);
walk(path.join(process.env.USERPROFILE, ".cursor/projects/empty-window/agent-transcripts"));
const manifest = [];
for (const [filePath, contents] of writes) {
  const rel = filePath.split("Documents\\Aqliya\\")[1].replace(/\\/g, "/");
  manifest.push(rel);
  const target = path.join(repoRoot, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents, "utf8");
}
manifest.sort();
console.log("restored", manifest.length);
for (const rel of manifest) console.log(rel);