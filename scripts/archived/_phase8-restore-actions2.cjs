const fs = require("fs");
const path = require("path");
const file = path.join(process.env.USERPROFILE, ".cursor/projects/c-Users-PC-Documents-Aqliya/agent-transcripts/166ea499-20ca-4af7-bba3-ce11aa19becb/166ea499-20ca-4af7-bba3-ce11aa19becb.jsonl");
let best = null;
for (const line of fs.readFileSync(file, "utf8").split(/\n/)) {
  try {
    const o = JSON.parse(line);
    for (const part of o.message?.content || []) {
      if (part.name !== "Write") continue;
      const fp = part.input?.path || "";
      const c = part.input?.contents || "";
      if (!fp.includes("sales-actions.ts")) continue;
      if (!best || c.length > best.contents.length) best = { contents: c };
    }
  } catch {}
}
if (!best) process.exit(1);
fs.writeFileSync("C:/Users/PC/Documents/Aqliya/src/actions/sales-actions.ts", best.contents, "utf8");
console.log("bytes", best.contents.length, "updateDeal", best.contents.includes("updateSalesDealAction"), "listActivities", best.contents.includes("listOrgSalesActivitiesAction"));