#!/usr/bin/env node
/**
 * Index documentation files for RAG search.
 * Reads all markdown files from docs/, chunks them, and stores in DocumentChunk table.
 * Usage: node scripts/platform/docs-rag-index.mjs [--dry-run]
 */
import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/aqliya?schema=public";
const adapter = new PrismaPg(DATABASE_URL);
const prisma = new PrismaClient({ adapter });
const DOCS_ROOT = join(process.cwd(), "docs");
const dryRun = process.argv.includes("--dry-run");

function chunkText(text, maxBytes = 4000) {
  const chunks = [];
  const paragraphs = text.split(/\n\n+/);
  let current = "";
  for (const p of paragraphs) {
    if ((current + "\n\n" + p).length > maxBytes && current.length > 0) {
      chunks.push(current);
      current = p;
    } else {
      current = current ? current + "\n\n" + p : p;
    }
  }
  if (current) chunks.push(current);
  if (chunks.length === 0 && text.length > 0) chunks.push(text);
  return chunks;
}

async function main() {
  const files = [];

  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) await walk(fullPath);
      else if (entry.name.endsWith(".md")) files.push(fullPath);
    }
  }

  await walk(DOCS_ROOT);
  console.log(`Found ${files.length} markdown files`);

  let indexed = 0;
  let chunkTotal = 0;

  for (const file of files) {
    const content = await readFile(file, "utf8");
    const relPath = relative(DOCS_ROOT, file);
    const docId = `rag-doc-${relPath.replace(/[/\\]/g, "-").replace(/\.md$/, "")}`;
    const chunks = chunkText(content);

    if (dryRun) {
      console.log(`[DRY] Would index: ${relPath} (${content.length} chars, ${chunks.length} chunks)`);
      continue;
    }

    for (let i = 0; i < chunks.length; i++) {
      const chunkId = `${docId}-chunk-${i}`;
      await prisma.documentChunk.upsert({
        where: { id: chunkId },
        update: {
          content: chunks[i],
          tokenCount: chunks[i].length,
          metadata: { path: relPath, type: "documentation", chunk: i, totalChunks: chunks.length },
        },
        create: {
          id: chunkId,
          organizationId: "system",
          documentId: docId,
          chunkIndex: i,
          content: chunks[i],
          tokenCount: chunks[i].length,
          metadata: { path: relPath, type: "documentation", chunk: i, totalChunks: chunks.length },
        },
      });
      chunkTotal++;
    }
    indexed++;
  }

  console.log(`Indexed ${indexed} documents, ${chunkTotal} total chunks`);
  // ── Embedding generation (phase 2) ──
  if (!dryRun) {
    const unembedded = await prisma.documentChunk.findMany({
      where: { organizationId: "system", embeddingJson: null },
      take: 100,
    });
    
    for (const chunk of unembedded) {
      // Placeholder: real embedding via AI provider in follow-up
      const mockEmbedding = Array.from({ length: 384 }, () => Math.random() * 2 - 1);
      await prisma.documentChunk.update({
        where: { id: chunk.id },
        data: { embeddingJson: JSON.stringify(mockEmbedding) },
      });
    }
    console.log(`Generated embeddings for ${unembedded.length} chunks`);
  }

    await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

