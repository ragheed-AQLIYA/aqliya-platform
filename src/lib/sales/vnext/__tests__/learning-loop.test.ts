// @ts-nocheck
import { describe, expect, it } from "@jest/globals";
import {
  buildLearningLoopV04CandidateView,
  LEARNING_LOOP_V04_DISCLAIMER_EN,
  LEARNING_LOOP_V04_STATUS_TOKEN,
} from "../learning-loop";

const ORG = "org-salesos-v01";

describe("v0.4 learning-loop facade stub (Wave 5)", () => {
  it("emits candidate status token and disclaimer", () => {
    const view = buildLearningLoopV04CandidateView(ORG);
    expect(view.statusToken).toBe(LEARNING_LOOP_V04_STATUS_TOKEN);
    expect(view.disclaimerEn).toBe(LEARNING_LOOP_V04_DISCLAIMER_EN);
    expect(view.disclaimerEn).toContain("not sole source of truth");
  });

  it("wires five loop stages as candidate", () => {
    const view = buildLearningLoopV04CandidateView(ORG);
    expect(view.stages).toHaveLength(5);
    expect(view.stages.map((s) => s.id)).toEqual([
      "capture",
      "synthesize",
      "relate",
      "recommend",
      "cross_product",
    ]);
    expect(view.wiredStageCount).toBe(5);
  });

  it("marks all stages wired for pilot review shell", () => {
    const view = buildLearningLoopV04CandidateView(ORG);
    expect(view.stages.every((s) => s.wired)).toBe(true);
  });
});
