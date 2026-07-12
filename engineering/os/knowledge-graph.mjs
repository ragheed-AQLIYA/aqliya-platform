/**
 * Module 1 — Repository Knowledge Graph
 * Nodes/edges: Product → Actions → authorize/enforce → Tests → Docs → ADR → Owners
 */

import {
  ensureOsDirs,
  osPath,
  productOfPath,
  extractImports,
  loadCorpus,
  countSymbolUsage,
  writeOsReport,
} from "./lib.mjs";
import {
  collectSourceFiles,
  readText,
  rel,
  writeText,
  writeJson,
  isoNow,
  abs,
  exists,
  walkFiles,
  lineCount,
} from "../lib/fs-utils.mjs";
import { dataPath } from "../lib/data-lake.mjs";
import { loadDecisions } from "../intelligence/architecture-memory/sync.mjs";

const KEY_SYMBOLS = [
  { id: "enforce", re: /\benforce\s*\(/g, path: "src/lib/authorization/action-guard.ts" },
  { id: "authorize", re: /\bauthorize\s*\(/g, path: "src/lib/authorization/authorize.ts" },
  { id: "prisma", re: /\bprisma\./g, path: "src/lib/prisma.ts" },
];

export async function buildKnowledgeGraph() {
  ensureOsDirs();
  const files = collectSourceFiles(["src"]);
  const { corpus, fileContents } = loadCorpus(files);

  const nodes = [];
  const edges = [];
  const addNode = (id, type, meta = {}) => {
    if (!nodes.find((n) => n.id === id)) nodes.push({ id, type, ...meta });
  };
  const addEdge = (from, to, relType) => {
    edges.push({ from, to, rel: relType });
  };

  // Products
  const products = new Set();
  for (const f of files) {
    const r = rel(f);
    const p = productOfPath(r);
    products.add(p);
    addNode(`product:${p}`, "product", { name: p });
    addNode(`file:${r}`, "file", { path: r, product: p, loc: lineCount(fileContents.get(r) || "") });
    addEdge(`product:${p}`, `file:${r}`, "contains");
  }

  // Key symbols
  for (const sym of KEY_SYMBOLS) {
    const uses = countSymbolUsage(sym.id, corpus);
    const useFiles = [];
    const productHits = new Set();
    for (const [path, content] of fileContents) {
      if (sym.re.test(content)) {
        // reset lastIndex
        sym.re.lastIndex = 0;
        if (new RegExp(sym.re.source).test(content)) {
          useFiles.push(path);
          productHits.add(productOfPath(path));
        }
      }
      sym.re.lastIndex = 0;
    }
    addNode(`symbol:${sym.id}`, "symbol", {
      name: sym.id,
      definedIn: sym.path,
      usageCount: uses,
      fileCount: useFiles.length,
      products: [...productHits],
    });
    if (exists(abs(sym.path))) {
      addEdge(`symbol:${sym.id}`, `file:${sym.path}`, "defined_in");
    }
    for (const uf of useFiles.slice(0, 200)) {
      addEdge(`file:${uf}`, `symbol:${sym.id}`, "uses");
      addEdge(`product:${productOfPath(uf)}`, `symbol:${sym.id}`, "depends_on");
    }
  }

  // Actions → authorize
  const actions = files.filter((f) => rel(f).startsWith("src/actions/") && rel(f).endsWith(".ts"));
  for (const f of actions) {
    const r = rel(f);
    const content = fileContents.get(r) || "";
    addNode(`action:${r}`, "action", { path: r, product: productOfPath(r) });
    addEdge(`product:${productOfPath(r)}`, `action:${r}`, "owns");
    if (/\benforce\s*\(/.test(content)) addEdge(`action:${r}`, "symbol:enforce", "calls");
    if (/\bauthorize\s*\(/.test(content)) addEdge(`action:${r}`, "symbol:authorize", "calls");
    if (/\bprisma\./.test(content)) addEdge(`action:${r}`, "symbol:prisma", "calls");
  }

  // Tests covering symbols/files
  const tests = files.filter((f) => /__tests__|\.test\.|\.spec\./.test(rel(f)));
  let testsCoveringEnforce = 0;
  for (const f of tests) {
    const r = rel(f);
    const content = fileContents.get(r) || "";
    addNode(`test:${r}`, "test", { path: r });
    if (/\benforce\s*\(|\bauthorize\s*\(/.test(content)) {
      testsCoveringEnforce += 1;
      addEdge(`test:${r}`, "symbol:enforce", "covers");
      addEdge(`test:${r}`, "symbol:authorize", "covers");
    }
  }

  // ADRs
  const decisions = loadDecisions();
  for (const d of decisions) {
    addNode(`adr:${d.id}`, "adr", { title: d.title, product: d.product, pattern: d.pattern });
    if (d.product) addEdge(`product:${d.product}`, `adr:${d.id}`, "governed_by");
    if (d.pattern && /enforce/i.test(d.pattern)) addEdge(`adr:${d.id}`, "symbol:enforce", "requires");
  }

  // Docs under docs/products or docs/systems
  for (const root of ["docs/products", "docs/systems", "docs/adr"]) {
    if (!exists(abs(root))) continue;
    for (const f of walkFiles([root], { extensions: new Set([".md"]) })) {
      const r = rel(f);
      addNode(`doc:${r}`, "doc", { path: r });
    }
  }

  const enforceNode = nodes.find((n) => n.id === "symbol:enforce");
  const graph = {
    at: isoNow(),
    stats: {
      nodes: nodes.length,
      edges: edges.length,
      products: products.size,
      actions: actions.length,
      tests: tests.length,
      testsCoveringAuth: testsCoveringEnforce,
      enforceUsages: enforceNode?.usageCount ?? 0,
      enforceFiles: enforceNode?.fileCount ?? 0,
      enforceProducts: enforceNode?.products?.length ?? 0,
    },
    nodes,
    edges: edges.slice(0, 50000), // safety cap
  };

  writeJson(dataPath("os/graph", "latest.json"), graph);
  writeJson(osPath("knowledge-graph.json"), {
    at: graph.at,
    stats: graph.stats,
    symbols: nodes.filter((n) => n.type === "symbol"),
  });

  const md = [
    "# Repository Knowledge Graph",
    "",
    `**Generated:** ${graph.at}`,
    "",
    "## Stats",
    "",
    `| Metric | Value |`,
    `| ------ | ----- |`,
    `| Nodes | ${graph.stats.nodes} |`,
    `| Edges | ${graph.stats.edges} |`,
    `| Products | ${graph.stats.products} |`,
    `| Actions | ${graph.stats.actions} |`,
    `| Tests | ${graph.stats.tests} |`,
    "",
    "## Key Symbol: enforce()",
    "",
    "```",
    `enforce()`,
    `  ↓ used in ~${graph.stats.enforceUsages} references`,
    `  ↓ across ${graph.stats.enforceFiles} files`,
    `  ↓ products: ${(enforceNode?.products || []).join(", ") || "—"}`,
    `  ↓ covered by ${graph.stats.testsCoveringAuth} auth-related tests`,
    "```",
    "",
    "## Key Symbols",
    "",
    "| Symbol | Usages | Files | Products |",
    "| ------ | ------ | ----- | -------- |",
    ...nodes
      .filter((n) => n.type === "symbol")
      .map(
        (n) =>
          `| \`${n.name}()\` | ${n.usageCount} | ${n.fileCount} | ${(n.products || []).join(", ")} |`
      ),
    "",
    "## How Agents Use This",
    "",
    "Change Impact, Compliance, and Release Readiness query this graph before recommending work.",
    "",
    "Machine-readable: `engineering/data/os/graph/latest.json`",
    "",
  ].join("\n");

  writeText(osPath("KNOWLEDGE_GRAPH.md"), md);
  return graph;
}
