process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://localhost:5432/test_db";
process.env.AUTH_SECRET = "test-secret";
process.env.NODE_ENV = "test";
// Isolate Jest from developer .env (Ollama/real providers cause flaky timeouts).
process.env.FF_AI_REAL_PROVIDERS = "false";
delete process.env.AI_LOCAL_BASE_URL;
