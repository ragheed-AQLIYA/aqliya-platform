/**
 * Mock for @/lib/auth
 * Provides mock implementations of auth functions for testing.
 */
const mockUser = {
  id: "test-user-id",
  name: "Test User",
  email: "test@aqliya.com",
  role: "ADMIN",
  organizationId: "test-org-id",
  platformOrganizationId: "test-org-id",
};

async function getCurrentUser() {
  return mockUser;
}

async function requireUserContext(_requiredRole) {
  return mockUser;
}

async function requireOrgAccess(orgId, _requiredRole) {
  if (orgId && orgId !== mockUser.organizationId) {
    throw new Error("Access denied: organization access required");
  }
  return mockUser;
}

function isExpectedAccessDeniedError(_error) {
  return false;
}

module.exports = {
  getCurrentUser,
  requireUserContext,
  requireOrgAccess,
  isExpectedAccessDeniedError,
  mockUser,
};
