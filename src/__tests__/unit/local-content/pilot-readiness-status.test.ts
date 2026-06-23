import {
  computeOverallPilotStatus,
  type ReadinessLevel,
} from "@/lib/local-content/pilot-readiness";

function metric(level: ReadinessLevel, score: number) {
  return { level, score };
}

describe("LocalContentOS pilot readiness rollup", () => {
  it("returns Pilot Ready when greens dominate and score >= 80", () => {
    const metrics = Array.from({ length: 11 }, () => metric("GREEN", 90));
    const result = computeOverallPilotStatus(metrics);
    expect(result.overallScore).toBe(90);
    expect(result.overallStatus).toBe("Pilot Ready");
  });

  it("returns Pilot Conditional with limited reds and score >= 50", () => {
    const metrics = [
      ...Array.from({ length: 9 }, () => metric("GREEN", 70)),
      metric("RED", 40),
      metric("AMBER", 55),
    ];
    const result = computeOverallPilotStatus(metrics);
    expect(result.overallStatus).toBe("Pilot Conditional");
    expect(result.overallScore).toBeGreaterThanOrEqual(50);
  });

  it("returns Not Ready when too many reds or low score", () => {
    const metrics = [
      metric("RED", 20),
      metric("RED", 30),
      metric("RED", 25),
      metric("AMBER", 50),
    ];
    const result = computeOverallPilotStatus(metrics);
    expect(result.overallStatus).toBe("Not Ready");
  });

  it("handles empty metrics safely", () => {
    expect(computeOverallPilotStatus([])).toEqual({
      overallScore: 0,
      overallStatus: "Not Ready",
    });
  });
});
