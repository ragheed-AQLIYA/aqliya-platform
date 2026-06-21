process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://localhost:5432/test_db";
process.env.AUTH_SECRET = "test-secret";
process.env.NODE_ENV = "test";
// Isolate Jest from developer .env (Ollama/real providers cause flaky timeouts).
process.env.FF_AI_REAL_PROVIDERS = "false";
delete process.env.AI_LOCAL_BASE_URL;
// Tier 2 ABAC shadow is on in production registry; disable in unit tests (no abacPolicy mock).
process.env.FF_ABAC_SHADOW = "false";
process.env.FF_ABAC_ENFORCE = "false";
process.env.FF_EVENT_OUTBOX = "false";
