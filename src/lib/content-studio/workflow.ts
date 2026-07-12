// LocalContentOS Content Studio — workflow state transitions

import type {
  CampaignStatus,
  ContentItemStatus,
  OutputPackageStatus,
  SourceStatus,
} from "./types";

const CAMPAIGN_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  draft: ["active", "archived"],
  active: ["in_review", "archived"],
  in_review: ["approved", "draft", "archived"],
  approved: ["completed", "archived"],
  completed: ["archived"],
  archived: [],
};

const CONTENT_ITEM_TRANSITIONS: Record<ContentItemStatus, ContentItemStatus[]> = {
  idea: ["draft", "archived"],
  draft: ["in_review", "archived"],
  in_review: ["changes_requested", "approved", "archived"],
  changes_requested: ["draft", "archived"],
  approved: ["ready_to_publish", "archived"],
  ready_to_publish: ["published", "archived"],
  published: ["archived"],
  archived: [],
};

const SOURCE_TRANSITIONS: Record<SourceStatus, SourceStatus[]> = {
  proposed: ["verified", "rejected", "expired"],
  verified: ["expired"],
  rejected: [],
  expired: [],
};

const OUTPUT_TRANSITIONS: Record<OutputPackageStatus, OutputPackageStatus[]> = {
  draft: ["ready", "approved"],
  ready: ["approved", "exported"],
  approved: ["exported"],
  exported: [],
};

function allowsTransition<T extends string>(
  map: Record<T, T[]>,
  from: T,
  to: T,
): boolean {
  if (from === to) return true;
  return map[from]?.includes(to) ?? false;
}

export function canTransitionCampaign(
  from: CampaignStatus,
  to: CampaignStatus,
): boolean {
  return allowsTransition(CAMPAIGN_TRANSITIONS, from, to);
}

export function canTransitionContentItem(
  from: ContentItemStatus,
  to: ContentItemStatus,
): boolean {
  return allowsTransition(CONTENT_ITEM_TRANSITIONS, from, to);
}

export function canTransitionSource(
  from: SourceStatus,
  to: SourceStatus,
): boolean {
  return allowsTransition(SOURCE_TRANSITIONS, from, to);
}

export function canTransitionOutput(
  from: OutputPackageStatus,
  to: OutputPackageStatus,
): boolean {
  return allowsTransition(OUTPUT_TRANSITIONS, from, to);
}

export function assertCampaignTransition(
  from: CampaignStatus,
  to: CampaignStatus,
): void {
  if (!canTransitionCampaign(from, to)) {
    throw new Error(`Invalid campaign transition: ${from} → ${to}`);
  }
}

export function assertContentItemTransition(
  from: ContentItemStatus,
  to: ContentItemStatus,
): void {
  if (!canTransitionContentItem(from, to)) {
    throw new Error(`Invalid content item transition: ${from} → ${to}`);
  }
}

export function assertSourceTransition(
  from: SourceStatus,
  to: SourceStatus,
): void {
  if (!canTransitionSource(from, to)) {
    throw new Error(`Invalid source transition: ${from} → ${to}`);
  }
}

export function assertOutputTransition(
  from: OutputPackageStatus,
  to: OutputPackageStatus,
): void {
  if (!canTransitionOutput(from, to)) {
    throw new Error(`Invalid output transition: ${from} → ${to}`);
  }
}
