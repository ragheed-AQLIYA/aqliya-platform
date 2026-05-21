import {
  paginate,
  offsetFromPage,
  DEFAULT_PAGE_SIZE,
} from "@/lib/audit/pagination";

describe("pagination utilities", () => {
  describe("paginate", () => {
    const items = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];

    it("returns first page with default page size", () => {
      const result = paginate(items.slice(0, DEFAULT_PAGE_SIZE), items.length, {
        page: 1,
      });
      expect(result.items).toEqual(items.slice(0, DEFAULT_PAGE_SIZE));
      expect(result.total).toBe(10);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(DEFAULT_PAGE_SIZE);
      expect(result.hasMore).toBe(10 > DEFAULT_PAGE_SIZE);
    });

    it("returns second page correctly", () => {
      const pageSize = 3;
      const result = paginate(items.slice(3, 6), items.length, {
        page: 2,
        pageSize,
      });
      expect(result.items).toEqual(["d", "e", "f"]);
      expect(result.page).toBe(2);
      expect(result.hasMore).toBe(true);
    });

    it("returns last page with no hasMore", () => {
      const pageSize = 3;
      const result = paginate(items.slice(9), items.length, {
        page: 4,
        pageSize,
      });
      expect(result.items).toEqual(["j"]);
      expect(result.page).toBe(4);
      expect(result.hasMore).toBe(false);
    });

    it("clamps page to minimum 1", () => {
      const result = paginate(items.slice(0, 5), items.length, {
        page: 0,
        pageSize: 5,
      });
      expect(result.page).toBe(1);
    });

    it("clamps pageSize between 1 and 100", () => {
      const result = paginate(items.slice(0, 10), items.length, {
        page: 1,
        pageSize: 200,
      });
      expect(result.pageSize).toBe(100);
      const result2 = paginate([], 0, { page: 1, pageSize: 0 });
      expect(result2.pageSize).toBe(1);
    });

    it("handles empty results", () => {
      const result = paginate([], 0, { page: 1, pageSize: 20 });
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    it("handles total equal to page boundary", () => {
      const result = paginate(items.slice(0, 10), 10, {
        page: 1,
        pageSize: 10,
      });
      expect(result.hasMore).toBe(false);
    });
  });

  describe("offsetFromPage", () => {
    it("returns 0 for page 1", () => {
      expect(offsetFromPage(1, 20)).toBe(0);
    });

    it("returns 20 for page 2", () => {
      expect(offsetFromPage(2, 20)).toBe(20);
    });

    it("returns 0 for page 0 (clamped to 1)", () => {
      expect(offsetFromPage(0, 20)).toBe(0);
    });
  });
});
