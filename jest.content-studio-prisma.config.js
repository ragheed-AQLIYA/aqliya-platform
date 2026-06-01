/* eslint-disable @typescript-eslint/no-require-imports */
/** Jest config for Content Studio Prisma integration tests (real @prisma/client). */
const path = require("path");
const base = require("./jest.config.js");

const { "^@prisma/client$": _pc, "^@prisma/adapter-pg$": _pa, ...restMapper } =
  base.moduleNameMapper;

module.exports = {
  ...base,
  moduleNameMapper: restMapper,
  setupFiles: [
    "dotenv/config",
    path.join(__dirname, "src/__tests__/setup.ts"),
  ],
};
