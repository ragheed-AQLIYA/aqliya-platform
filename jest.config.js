/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('ts-jest').JestConfigWithTsJest} */
const path = require('path');

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  maxWorkers: 1,
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": path.join(__dirname, "src", "$1"),
    "^next-auth$": path.join(__dirname, "src/__mocks__/next-auth.js"),
    "^next-auth/providers/credentials$": path.join(__dirname, "src/__mocks__/next-auth.js"),
    "^@auth/prisma-adapter$": path.join(__dirname, "src/__mocks__/auth-prisma-adapter.js"),
    "^bcryptjs$": path.join(__dirname, "src/__mocks__/bcryptjs.js"),
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
