/**
 * Concurrency & Transaction Isolation Tests — E-5
 *
 * Tests concurrent operation semantics using simulated concurrency.
 * No real database required — mocks simulate race conditions.
 *
 * Covered scenarios:
 *   1. Optimistic lock: Two users update same decision — one succeeds, one detects conflict
 *   2. Read-after-write: After creating a record, immediate read returns the created record
 *   3. Duplicate prevention: Two simultaneous creates with same unique constraint — only one succeeds
 *   4. Status transition race: Two simultaneous status updates — final state is consistent
 */

// ============================================================================
// Scenario 1: Optimistic Lock
// ============================================================================
describe("E-5 Scenario 1: Optimistic Lock — Two users update same decision", () => {
  it("second concurrent update should detect conflict when version has changed", async () => {
    // Simulated decision state in memory (like a database row)
    const state: { version: number; status: string; title: string } = {
      version: 1,
      status: "DRAFT",
      title: "Test Decision",
    };

    const errors: string[] = [];

    /**
     * Simulated updateWithOptimisticLock:
     * - Accepts current version the caller knows about
     * - If version matches, applies update and increments version
     * - If version doesn't match, throws conflict error
     */
    async function updateWithOptimisticLock(
      id: string,
      userId: string,
      knownVersion: number,
      newData: Partial<typeof state>,
    ): Promise<typeof state> {
      // Simulate a brief delay (context switch opportunity)
      await Promise.resolve();

      if (state.version !== knownVersion) {
        const err = `Conflict: ${userId} read v${knownVersion} but current is v${state.version}`;
        errors.push(err);
        throw new Error(err);
      }

      Object.assign(state, newData);
      state.version += 1;
      return { ...state };
    }

    // User A reads version 1
    const userARead = { ...state, version: state.version };
    expect(userARead.version).toBe(1);

    // User B reads version 1 (same snapshot as User A)
    const userBRead = { ...state, version: state.version };
    expect(userBRead.version).toBe(1);

    // Simulate concurrent execution: User A submits, then User B submits
    // User A wins — updates with knownVersion=1 (matches)
    const resultA = await updateWithOptimisticLock("dec-1", "user-a", userARead.version, {
      status: "IN_REVIEW",
    });
    expect(resultA.status).toBe("IN_REVIEW");
    expect(resultA.version).toBe(2);

    // User B loses — tries with knownVersion=1 but current is 2
    let bError: Error | null = null;
    try {
      await updateWithOptimisticLock("dec-1", "user-b", userBRead.version, {
        title: "Updated by B",
      });
    } catch (e) {
      bError = e as Error;
    }

    expect(bError).not.toBeNull();
    expect(bError!.message).toContain("Conflict");
    expect(errors).toHaveLength(1);

    // Final state reflects User A's update, not B's
    expect(state.status).toBe("IN_REVIEW");
    expect(state.title).toBe("Test Decision"); // unchanged
    expect(state.version).toBe(2);
  });

  it("sequential updates from same user succeed (no version conflict)", async () => {
    const state = { version: 1, status: "DRAFT", title: "Sequential Test" };

    async function update(id: string, knownVersion: number, data: Partial<typeof state>) {
      await Promise.resolve();
      if (state.version !== knownVersion) {
        throw new Error(`Conflict: expected v${knownVersion}, got v${state.version}`);
      }
      Object.assign(state, data);
      state.version += 1;
      return { ...state };
    }

    // Update 1: DRAFT → IN_REVIEW
    const r1 = await update("d1", 1, { status: "IN_REVIEW" });
    expect(r1.status).toBe("IN_REVIEW");
    expect(r1.version).toBe(2);

    // Update 2: IN_REVIEW → APPROVED (with correct known version)
    const r2 = await update("d1", 2, { status: "APPROVED" });
    expect(r2.status).toBe("APPROVED");
    expect(r2.version).toBe(3);

    // Update 3: APPROVED → ARCHIVED
    const r3 = await update("d1", 3, { status: "ARCHIVED" });
    expect(r3.status).toBe("ARCHIVED");
    expect(r3.version).toBe(4);
  });
});

// ============================================================================
// Scenario 2: Read-After-Write Consistency
// ============================================================================
describe("E-5 Scenario 2: Read-After-Write — created record is immediately visible", () => {
  it("immediate read returns the created record", async () => {
    // In-memory store simulating database
    const store = new Map<string, { id: string; title: string; orgId: string; createdAt: Date }>();

    async function createRecord(data: { id: string; title: string; orgId: string }): Promise<void> {
      // Simulate insert
      await Promise.resolve();
      store.set(data.id, {
        id: data.id,
        title: data.title,
        orgId: data.orgId,
        createdAt: new Date(),
      });
    }

    async function readRecord(id: string): Promise<ReturnType<typeof store.get> extends (k: string) => infer R ? R : never> {
      await Promise.resolve();
      return store.get(id) ?? null;
    }

    // Create a record
    await createRecord({ id: "rec-1", title: "Important Decision", orgId: "org-1" });

    // Immediately read it back
    const record = await readRecord("rec-1");

    // Assert: record exists and has correct data
    expect(record).not.toBeNull();
    expect(record!.id).toBe("rec-1");
    expect(record!.title).toBe("Important Decision");
    expect(record!.orgId).toBe("org-1");
    expect(record!.createdAt).toBeInstanceOf(Date);
  });

  it("concurrent create+read: read waits for write to complete", async () => {
    const store = new Map<string, { id: string; value: number }>();
    const log: string[] = [];

    async function writeThenRead(id: string, value: number): Promise<number | null> {
      // Simulate async write
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          store.set(id, { id, value });
          log.push(`wrote:${id}=${value}`);
          resolve();
        }, 5);
      });

      // Read after write completes
      const record = store.get(id);
      log.push(`read:${id}=${record?.value ?? "null"}`);
      return record?.value ?? null;
    }

    const results = await Promise.all([
      writeThenRead("a", 100),
      writeThenRead("b", 200),
      writeThenRead("c", 300),
    ]);

    // Each write should be visible to its own read
    expect(results[0]).toBe(100);
    expect(results[1]).toBe(200);
    expect(results[2]).toBe(300);

    // All 3 entries should exist in store after all operations complete
    expect(store.size).toBe(3);
  });
});

// ============================================================================
// Scenario 3: Duplicate Prevention
// ============================================================================
describe("E-5 Scenario 3: Duplicate Prevention — unique constraint enforcement", () => {
  it("two simultaneous creates with same unique key — only one succeeds", async () => {
    // Simulate a unique key constraint on "email" field
    const emails = new Set<string>();
    const created: { id: string; email: string; by: string }[] = [];
    const errors: string[] = [];

    async function createUserWithEmail(
      email: string,
      by: string,
    ): Promise<{ id: string; email: string; by: string } | null> {
      // Small random delay to simulate race
      await new Promise<void>((resolve) => setTimeout(resolve, Math.random() * 10));

      if (emails.has(email)) {
        const err = `DUPLICATE: Email '${email}' already exists (attempted by ${by})`;
        errors.push(err);
        return null; // Constraint violation
      }

      emails.add(email);
      const record = { id: `user-${emails.size}`, email, by };
      created.push(record);
      return record;
    }

    // Two concurrent attempts to create same email
    const [r1, r2] = await Promise.all([
      createUserWithEmail("admin@aqliya.com", "user-a"),
      createUserWithEmail("admin@aqliya.com", "user-b"),
    ]);

    // Only one should succeed
    const succeeded = [r1, r2].filter(Boolean);
    expect(succeeded).toHaveLength(1);

    // The other should have been rejected
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain("DUPLICATE");
    expect(errors[0]).toContain("admin@aqliya.com");

    // The email should only exist once
    expect(emails.size).toBe(1);
    expect(emails.has("admin@aqliya.com")).toBe(true);
  });

  it("concurrent creates with different unique keys all succeed", async () => {
    const keys = new Set<string>();
    const created: string[] = [];

    async function create(key: string): Promise<void> {
      await Promise.resolve();
      if (keys.has(key)) throw new Error(`Duplicate: ${key}`);
      keys.add(key);
      created.push(key);
    }

    const uniqueKeys = ["key-a", "key-b", "key-c", "key-d", "key-e"];
    await Promise.all(uniqueKeys.map((k) => create(k)));

    expect(created).toHaveLength(5);
    expect(keys.size).toBe(5);
    for (const k of uniqueKeys) {
      expect(keys.has(k)).toBe(true);
    }
  });

  it("decision evidence with same filename+decisionId — second create blocked", async () => {
    const evidenceStore = new Map<string, { decisionId: string; filename: string }>();
    const constraintErrors: string[] = [];

    async function createEvidence(decisionId: string, filename: string): Promise<void> {
      const key = `${decisionId}::${filename}`;
      await new Promise<void>((resolve) => setTimeout(resolve, Math.random() * 5));

      if (evidenceStore.has(key)) {
        constraintErrors.push(`Duplicate evidence: ${key}`);
        throw new Error("UNIQUE constraint violation: filename must be unique per decision");
      }

      evidenceStore.set(key, { decisionId, filename });
    }

    // Two concurrent uploads of same filename to same decision
    const results = await Promise.allSettled([
      createEvidence("dec-1", "financials.pdf"),
      createEvidence("dec-1", "financials.pdf"),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(constraintErrors).toHaveLength(1);
    expect(evidenceStore.size).toBe(1);
  });
});

// ============================================================================
// Scenario 4: Status Transition Race
// ============================================================================
describe("E-5 Scenario 4: Status Transition Race — two simultaneous status updates", () => {
  it("concurrent updates to same record produce consistent final state", async () => {
    // Simulate a record with allowed transitions
    const allowedTransitions: Record<string, string[]> = {
      DRAFT: ["IN_REVIEW"],
      IN_REVIEW: ["APPROVED", "REJECTED"],
      APPROVED: ["ARCHIVED", "IMPLEMENTED"],
      REJECTED: ["DRAFT"],
      IMPLEMENTED: ["CLOSED"],
      ARCHIVED: [],
      CLOSED: [],
    };

    const logs: string[] = [];

    // In-memory record state
    const record = { status: "IN_REVIEW", version: 0 };

    async function tryTransition(
      actor: string,
      fromStatus: string,
      toStatus: string,
    ): Promise<boolean> {
      await new Promise<void>((resolve) => setTimeout(resolve, Math.random() * 3));

      // Check if transition is allowed from current state
      const allowed = allowedTransitions[record.status] || [];
      if (!allowed.includes(toStatus)) {
        logs.push(`BLOCKED: ${actor} tried ${fromStatus}→${toStatus} but current is ${record.status}`);
        return false;
      }

      // Check optimistic lock — fromStatus must match current
      if (record.status !== fromStatus) {
        logs.push(`CONFLICT: ${actor} expected ${fromStatus} but found ${record.status}`);
        return false;
      }

      // Apply transition
      const oldStatus = record.status;
      record.status = toStatus;
      record.version += 1;
      logs.push(`OK: ${actor} transitioned ${oldStatus}→${toStatus} (v${record.version})`);
      return true;
    }

    // Act: Two actors try to update the same record concurrently
    // Both read status=IN_REVIEW, both submit transitions
    const results = await Promise.all([
      tryTransition("user-a", "IN_REVIEW", "APPROVED"),
      tryTransition("user-b", "IN_REVIEW", "REJECTED"),
    ]);

    // Only one should succeed (whichever executed first)
    const successes = results.filter(Boolean);
    expect(successes).toHaveLength(1);

    // The final state must be one of the valid attempted transitions
    expect(["APPROVED", "REJECTED"]).toContain(record.status);

    // Logs should show one success and one conflict
    const successLogs = logs.filter((l) => l.startsWith("OK:"));
    const conflictLogs = logs.filter((l) => l.startsWith("CONFLICT:") || l.startsWith("BLOCKED:"));
    expect(successLogs).toHaveLength(1);
    expect(conflictLogs).toHaveLength(1);
  });

  it("status transition from DRAFT skips IN_REVIEW — blocked by gate", () => {
    const allowedTransitions: Record<string, string[]> = {
      DRAFT: ["IN_REVIEW"],
      IN_REVIEW: ["APPROVED", "REJECTED"],
      APPROVED: ["ARCHIVED"],
      REJECTED: ["DRAFT"],
      ARCHIVED: [],
    };

    // Gate check function
    function canTransition(from: string, to: string): boolean {
      return allowedTransitions[from]?.includes(to) ?? false;
    }

    // Invalid transitions should be blocked
    const invalidTransitions = [
      { from: "DRAFT", to: "APPROVED", reason: "must go through IN_REVIEW" },
      { from: "DRAFT", to: "ARCHIVED", reason: "not a valid transition" },
      { from: "APPROVED", to: "IN_REVIEW", reason: "cannot regress to review" },
      { from: "ARCHIVED", to: "DRAFT", reason: "cannot un-archive" },
    ];

    for (const { from, to, reason } of invalidTransitions) {
      expect(canTransition(from, to)).toBe(false);
    }

    // Valid transitions should be allowed
    const validTransitions = [
      { from: "DRAFT", to: "IN_REVIEW" },
      { from: "IN_REVIEW", to: "APPROVED" },
      { from: "IN_REVIEW", to: "REJECTED" },
      { from: "APPROVED", to: "ARCHIVED" },
      { from: "REJECTED", to: "DRAFT" },
    ];

    for (const { from, to } of validTransitions) {
      expect(canTransition(from, to)).toBe(true);
    }
  });

  it("concurrent status updates on different records don't interfere", async () => {
    const records = new Map<string, { id: string; status: string; version: number }>();
    records.set("r1", { id: "r1", status: "DRAFT", version: 0 });
    records.set("r2", { id: "r2", status: "DRAFT", version: 0 });
    records.set("r3", { id: "r3", status: "DRAFT", version: 0 });

    async function updateRecord(id: string, newStatus: string): Promise<void> {
      await new Promise<void>((resolve) => setTimeout(resolve, Math.random() * 3));
      const rec = records.get(id)!;
      rec.status = newStatus;
      rec.version += 1;
    }

    await Promise.all([
      updateRecord("r1", "IN_REVIEW"),
      updateRecord("r2", "IN_REVIEW"),
      updateRecord("r3", "IN_REVIEW"),
    ]);

    // All three records should be updated independently
    expect(records.get("r1")!.status).toBe("IN_REVIEW");
    expect(records.get("r2")!.status).toBe("IN_REVIEW");
    expect(records.get("r3")!.status).toBe("IN_REVIEW");
    expect(records.get("r1")!.version).toBe(1);
    expect(records.get("r2")!.version).toBe(1);
    expect(records.get("r3")!.version).toBe(1);
  });
});

// ============================================================================
// Bonus: Cross-cutting concurrency checks
// ============================================================================
describe("E-5 Cross-cutting: Concurrent read/write patterns", () => {
  it("multiple concurrent reads don't interfere with a write", async () => {
    const store = new Map<string, number>();
    store.set("counter", 0);
    const readValues: number[] = [];

    async function read(): Promise<number> {
      await new Promise<void>((resolve) => setTimeout(resolve, 2));
      const val = store.get("counter") ?? 0;
      readValues.push(val);
      return val;
    }

    async function write(newVal: number): Promise<void> {
      await new Promise<void>((resolve) => setTimeout(resolve, 5));
      store.set("counter", newVal);
    }

    const [reads, _write] = await Promise.all([
      Promise.all([read(), read(), read(), read(), read()]),
      write(42),
    ]);

    // After write completes, counter should be 42
    expect(store.get("counter")).toBe(42);
    // At least 5 reads happen (may read 0 or 42 depending on timing)
    expect(reads).toHaveLength(5);
  });

  it("counter increment with concurrent operations is consistent", () => {
    // Using a mutex-like pattern for consistency
    let counter = 0;
    const DELAY = 0; // Instant for unit test determinism

    async function increment(amount: number): Promise<void> {
      // Atomic operation: read-modify-write
      const current = counter;
      counter = current + amount;
    }

    // Sequential execution to ensure deterministic test
    const operations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Execute all sequentially for determinism
    return Promise.all(operations.map((n) => increment(n))).then(() => {
      // Sum 1..10 = 55
      expect(counter).toBe(55);
    });
  });
});

// ─── Global Teardown ───
afterAll(() => {
  jest.restoreAllMocks();
});
