/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('ts-jest').JestConfigWithTsJest} */
const path = require('path');

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  maxWorkers: 1,
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/.claude/",
    "<rootDir>/docs/",
  ],
  modulePathIgnorePatterns: ["<rootDir>/.claude/", "<rootDir>/.next/"],
  setupFiles: [path.join(__dirname, "src/__tests__/setup.ts")],
  moduleNameMapper: {
    "^@/(.*)$": path.join(__dirname, "src", "$1"),
    "^next-auth$": path.join(__dirname, "src/__mocks__/next-auth.js"),
    "^next-auth/providers/credentials$": path.join(__dirname, "src/__mocks__/next-auth.js"),
    "^@auth/prisma-adapter$": path.join(__dirname, "src/__mocks__/auth-prisma-adapter.js"),
    "^next-auth/providers/google$": path.join(__dirname, "src/__mocks__/next-auth-provider.js"),
    "^next-auth/providers/github$": path.join(__dirname, "src/__mocks__/next-auth-provider.js"),
    "^next-auth/providers/azure-ad$": path.join(__dirname, "src/__mocks__/next-auth-provider.js"),
    "^next-auth/providers/okta$": path.join(__dirname, "src/__mocks__/next-auth-provider.js"),
    "^bcryptjs$": path.join(__dirname, "src/__mocks__/bcryptjs.js"),
    "^server-only$": path.join(__dirname, "src/__mocks__/server-only.js"),
    "^@prisma/client$": path.join(__dirname, "src/__mocks__/prisma-client-mock.js"),
    "^@prisma/adapter-pg$": path.join(__dirname, "src/__mocks__/prisma-adapter-mock.js"),
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: {
        jsx: "react-jsx",
        module: "commonjs",
        esModuleInterop: true,
      }
    }],
  },
}
