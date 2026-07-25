import { promises as fs } from "fs";
import * as path from "path";
import { buildVersionProvenanceManifest } from "../provenance-manifest";

export const ARTIFACTS_ROOT = path.join(process.cwd(), "knowledge", "releases");

export type ReleaseManifest = {
  versionId: string;
  versionNumber: string;
  candidateIds: string[];
  candidateCount: number;
  sha256: string;
  generatedAt: string;
  previousReleaseId: string | null;
  previousReleaseHash: string | null;
  provenance: Awaited<ReturnType<typeof buildVersionProvenanceManifest>>;
  artifactPath: string;
  hash?: string;
  createdAt?: string;
};

export type ReleaseArtifactFiles = {
  versionDir: string;
  candidateListContent: string;
  foundationContent: string;
  provenanceContent: string;
  releaseNotesContent: string;
  changeSummaryContent: string;
  manifestContent: string;
};

export async function writeReleaseArtifacts(files: ReleaseArtifactFiles): Promise<void> {
  const { versionDir } = files;
  await fs.mkdir(versionDir, { recursive: true });
  await Promise.all([
    fs.writeFile(path.join(versionDir, "candidate-list.json"), files.candidateListContent, "utf-8"),
    fs.writeFile(path.join(versionDir, "knowledge-foundation.json"), files.foundationContent, "utf-8"),
    fs.writeFile(path.join(versionDir, "provenance-manifest.json"), files.provenanceContent, "utf-8"),
    fs.writeFile(path.join(versionDir, "release-notes.md"), files.releaseNotesContent, "utf-8"),
    fs.writeFile(path.join(versionDir, "change-summary.json"), files.changeSummaryContent, "utf-8"),
    fs.writeFile(path.join(versionDir, "manifest.json"), files.manifestContent, "utf-8"),
  ]);
}
