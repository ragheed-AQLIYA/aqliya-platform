/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('jest').Config} */
module.exports = {
  displayName: "engineering-scanners",
  testEnvironment: "node",
  maxWorkers: 1,
  forceExit: true,
  roots: ["<rootDir>/engineering/__tests__"],
  testMatch: ["**/*.test.ts", "**/*.test.mjs"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/.claude/",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "mjs", "json"],
  moduleNameMapper: {
    "^.*/engineering/lib/fs-utils\\.mjs$": "<rootDir>/engineering/__mocks__/fs-utils.mjs",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: {
        jsx: "react-jsx",
        module: "commonjs",
        esModuleInterop: true,
      },
    }],
    "^.+\\.mjs$": ["@swc/jest", {
      jsc: {
        parser: { syntax: "ecmascript", jsx: false },
      },
      module: { type: "commonjs" },
    }],
  },
  setupFiles: [],
};
