import fs from "fs";
import path from "path";

describe("security: no custom-login route", () => {
  const routeDir = path.join(process.cwd(), "src/app/api/auth/custom-login");
  const routeFile = path.join(routeDir, "route.ts");

  it("does not ship a CSRF-vulnerable custom-login API handler", () => {
    expect(fs.existsSync(routeFile)).toBe(false);
    expect(fs.existsSync(routeDir)).toBe(false);
  });
});
