export type PresentationProfileRebuildStatus =
  | "rebuilt"
  | "skipped_no_mappings"
  | "failed";

export type PresentationProfileRebuildResult = {
  status: PresentationProfileRebuildStatus;
  method?: "v2" | "v1";
  statementCount?: number;
  errorMessage?: string;
};
