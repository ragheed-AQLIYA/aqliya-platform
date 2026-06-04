import { formatMateriality, getMaterialityBasis } from "../materiality-service";

describe("materiality-service", () => {
  describe("formatMateriality", () => {
    it("formats billions", () => {
      expect(formatMateriality(1_500_000_000, "SAR")).toBe("SAR 1.50B");
    });

    it("formats millions", () => {
      expect(formatMateriality(2_500_000, "SAR")).toBe("SAR 2.50M");
    });

    it("formats thousands", () => {
      expect(formatMateriality(1_500, "SAR")).toBe("SAR 1.50K");
    });

    it("formats small values", () => {
      expect(formatMateriality(500, "SAR")).toBe("SAR 500.00");
    });
  });

  describe("getMaterialityBasis", () => {
    it("returns revenue as default basis", () => {
      expect(getMaterialityBasis("engagement-1")).toBe("revenue");
    });
  });
});
