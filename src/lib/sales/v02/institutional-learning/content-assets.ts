// @ts-nocheck
import { learningEvidence } from "./evidence";
import type {
  ContentAssetRef,
  InstitutionalLearningEvidence,
} from "./types";

export function normalizeContentAssetRefs(
  refs?: ContentAssetRef[],
): ContentAssetRef[] {
  if (!refs?.length) return [];
  return refs.map((ref) => ({
    id: ref.id,
    title: ref.title,
    category: ref.category,
    externalUri: ref.externalUri,
    stub: ref.stub ?? true,
  }));
}

export function evidenceFromContentAssets(
  refs: ContentAssetRef[],
): InstitutionalLearningEvidence[] {
  return refs.map((ref) =>
    learningEvidence(
      "content_asset",
      ref.externalUri ?? ref.id,
      ref.title
        ? `Content asset (stub): ${ref.title}`
        : `Content asset ref (stub): ${ref.id}`,
      ref.title
        ? `أصل محتوى (stub): ${ref.title}`
        : `مرجع أصل محتوى (stub): ${ref.id}`,
    ),
  );
}
