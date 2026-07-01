/** Preload for tabletop bootstrap — mock server-only + auth actor switching. */
const Module = require("module");
const originalLoad = Module._load;

global.__TABLETOP_BOOTSTRAP_USER__ = null;

Module._load = function (request, parent, isMain) {
  if (request === "server-only") {
    return {};
  }

  const normalized =
    typeof request === "string" ? request.replace(/\\/g, "/") : "";

  if (
    normalized.includes("/lib/auth") ||
    normalized.endsWith("@/lib/auth") ||
    normalized.endsWith("@/lib/auth.ts") ||
    normalized.endsWith("@/lib/auth.js")
  ) {
    return {
      getCurrentUser: async () => {
        if (!global.__TABLETOP_BOOTSTRAP_USER__) {
          throw new Error(
            "TABLETOP bootstrap: set global.__TABLETOP_BOOTSTRAP_USER__ before calling KF services",
          );
        }
        return global.__TABLETOP_BOOTSTRAP_USER__;
      },
      hasRequiredRole: () => true,
      requireUserContext: async () => global.__TABLETOP_BOOTSTRAP_USER__,
      requireOrgAccess: async () => global.__TABLETOP_BOOTSTRAP_USER__,
    };
  }

  return originalLoad.apply(this, arguments);
};

function setBootstrapUser(user) {
  global.__TABLETOP_BOOTSTRAP_USER__ = user;
}

module.exports = { setBootstrapUser };
