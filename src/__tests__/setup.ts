process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://localhost:5432/test_db";
process.env.AUTH_SECRET = "test-secret";
process.env.NODE_ENV = "test";
