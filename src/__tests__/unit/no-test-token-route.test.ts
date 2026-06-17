import fs from "fs";
import path from "path";

describe("security: no test-token route", () => {
  const routeDir = path.join(process.cwd(), "src/app/api/test-token");
  const routeFile = path.join(routeDir, "route.ts");

  it("does not ship a test-token API handler", () => {
    expect(fs.existsSync(routeFile)).toBe(false);
    expect(fs.existsSync(routeDir)).toBe(false);
  });
});
