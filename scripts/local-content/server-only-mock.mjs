// server-only polyfill: makes server-only a no-op for scripts
// This file is loaded via node --import to intercept the server-only module
// before any Next.js code is loaded, preventing the throw-on-import error.

const Module = require("module");
const originalResolve = Module._resolveFilename;

Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === "server-only") {
    // Return a path to our mock
    return require.resolve("./server-only-mock-entry.mjs");
  }
  return originalResolve.call(this, request, parent, isMain, options);
};
