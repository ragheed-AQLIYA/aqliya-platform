// ─── In-memory mock for prisma ───
const stores = new Map<string, unknown[]>();
let idCounter = 1;

function getStore<T>(model: string): T[] {
  if (!stores.has(model)) stores.set(model, []);
  return stores.get(model) as T[];
}

function clearStores(): void {
  stores.clear();
  idCounter = 1;
}

function nextId(): string {
  return `test_${idCounter++}`;
}

function clone<T>(value: T): T {
  if (value instanceof Date) return new Date(value.getTime()) as T;
  if (Array.isArray(value)) return value.map(clone) as T;
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = clone(v);
    }
    return result as T;
  }
  return value;
}

function matchesWhere(record: Record<string, unknown>, where: Record<string, unknown>): boolean {
  if (!where) return true;
  if (where.OR) {
    return (where.OR as Record<string, unknown>[]).some((e) => matchesWhere(record, e));
  }
  if (where.AND) {
    return (where.AND as Record<string, unknown>[]).every((e) => matchesWhere(record, e));
  }
  for (const [key, value] of Object.entries(where)) {
    if (key === "OR" || key === "AND") continue;
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      const obj = value as Record<string, unknown>;
      if (obj.gte && record[key] instanceof Date && obj.gte instanceof Date) {
        if ((record[key] as Date) < obj.gte) return false;
        continue;
      }
      if (obj.lte && record[key] instanceof Date && obj.lte instanceof Date) {
        if ((record[key] as Date) > obj.lte) return false;
        continue;
      }
      if (obj.not !== undefined && record[key] === obj.not) return false;
      if (obj.in && Array.isArray(obj.in)) {
        if (!(obj.in as unknown[]).includes(record[key])) return false;
        continue;
      }
      if (obj.startsWith && typeof record[key] === "string") {
        if (!(record[key] as string).startsWith(obj.startsWith as string)) return false;
        continue;
      }
      return Object.entries(obj).every(([nk, nv]) => {
        if (nk === "not") return record[key] !== nv;
        const nested = record[key] as Record<string, unknown> | undefined;
        return nested && nested[nk] === nv;
      });
    }
    if (record[key] !== value) return false;
  }
  return true;
}

const RELATION_MODEL_MAP: Record<string, string> = {
  reviews: "aiModelGovernanceReview",
  deployments: "aiModelDeployment",
  model: "aiModelRegistry",
};

const MODEL_DEFAULTS: Record<string, Record<string, unknown>> = {
  aiModelRegistry: { status: "DRAFT", riskLevel: "MEDIUM", requiresReview: true, requiresApproval: true },
  aiModelGovernanceReview: {},
  aiModelDeployment: { isActive: true },
};

function makeModel<T extends Record<string, unknown>>(model: string) {
  const defaults = (MODEL_DEFAULTS[model] ?? {}) as Partial<T>;
  return {
    create: async ({ data }: { data: T }) => {
      const record = clone({ id: nextId(), ...defaults, ...data } as T);
      getStore<T>(model).push(record);
      return clone(record);
    },
    findUnique: async ({ where, include }: { where: Record<string, unknown>; include?: Record<string, unknown> }) => {
      let record = getStore<T>(model).find((r) => matchesWhere(r as Record<string, unknown>, where)) ??
          null;
      if (record && include) {
        const rec = clone(record) as Record<string, unknown>;
        for (const [key, config] of Object.entries(include as Record<string, unknown>)) {
          const includeConfig = config as Record<string, unknown>;
          const storeName = RELATION_MODEL_MAP[key] ?? key;
          if (includeConfig.where) {
            rec[key] = getStore(storeName).filter((child) =>
              matchesWhere(child as Record<string, unknown>, includeConfig.where as Record<string, unknown>),
            );
          } else if (includeConfig.select) {
            rec[key] = getStore(storeName).find(
              (c) => (c as Record<string, unknown>).id === (rec as Record<string, unknown>)[`${key}Id`],
            ) ?? null;
          } else {
            rec[key] = getStore(storeName).filter(
              (child) => (child as Record<string, unknown>).modelId === (rec as Record<string, unknown>).id,
            );
          }
        }
        return clone(rec as T);
      }
      return clone(record as T | null);
    },
    findMany: async (args?: {
      where?: Record<string, unknown>;
      include?: Record<string, unknown>;
      orderBy?: Record<string, string>;
    }) => {
      let records = getStore<T>(model);
      if (args?.where) {
        records = records.filter((r) =>
          matchesWhere(r as Record<string, unknown>, args.where as Record<string, unknown>),
        );
      }
      if (args?.orderBy) {
        const [field, dir] = Object.entries(args.orderBy)[0];
        records = [...records].sort((a, b) => {
          const aVal = String((a as Record<string, unknown>)[field] ?? "");
          const bVal = String((b as Record<string, unknown>)[field] ?? "");
          if (aVal < bVal) return dir === "desc" ? 1 : -1;
          if (aVal > bVal) return dir === "desc" ? -1 : 1;
          return 0;
        });
      }
      if (args?.include) {
        return records.map((r) => {
          const rec = clone(r);
          for (const [key, config] of Object.entries(args.include as Record<string, unknown>)) {
            const includeConfig = config as Record<string, unknown>;
            const storeName = RELATION_MODEL_MAP[key] ?? key;
            if (includeConfig.where) {
              (rec as Record<string, unknown>)[key] = getStore(storeName).filter((child) =>
                matchesWhere(child as Record<string, unknown>, includeConfig.where as Record<string, unknown>),
              );
            } else if (includeConfig.select) {
              (rec as Record<string, unknown>)[key] = getStore(storeName).find(
                (c) => (c as Record<string, unknown>).id === (rec as Record<string, unknown>)[`${key}Id`],
              ) ?? null;
            } else {
              (rec as Record<string, unknown>)[key] = getStore(storeName).filter(
                (child) =>
                  (child as Record<string, unknown>).modelId === (r as Record<string, unknown>).id ||
                  (child as Record<string, unknown>).modelId === (rec as Record<string, unknown>).id,
              );
            }
          }
          return rec;
        });
      }
      return clone(records as T[]);
    },
    update: async ({
      where,
      data,
    }: {
      where: Record<string, unknown>;
      data: Partial<T>;
    }) => {
      const store = getStore<T>(model);
      const idx = store.findIndex((r) =>
        matchesWhere(r as Record<string, unknown>, where),
      );
      if (idx === -1) throw new Error(`${model} not found`);
      store[idx] = { ...store[idx], ...clone(data), updatedAt: new Date() } as T;
      return clone(store[idx]);
    },
    updateMany: async ({
      where,
      data,
    }: {
      where: Record<string, unknown>;
      data: Partial<T>;
    }) => {
      const store = getStore<T>(model);
      let count = 0;
      for (let i = 0; i < store.length; i++) {
        if (matchesWhere(store[i] as Record<string, unknown>, where)) {
          store[i] = { ...store[i], ...clone(data) } as T;
          count++;
        }
      }
      return { count };
    },
    count: async ({ where }: { where?: Record<string, unknown> } = {}) => {
      const records = getStore<T>(model);
      if (!where) return records.length;
      return records.filter((r) =>
        matchesWhere(r as Record<string, unknown>, where as Record<string, unknown>),
      ).length;
    },
  };
}

const mockPrisma = {
  aiModelRegistry: makeModel("aiModelRegistry"),
  aiModelDeployment: makeModel("aiModelDeployment"),
  aiModelGovernanceReview: makeModel("aiModelGovernanceReview"),
};

jest.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    auth: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    handlers: { GET: jest.fn(), POST: jest.fn() },
  })),
}));
jest.mock("next-auth/providers/credentials", () =>
  jest.fn(() => ({ id: "credentials", name: "Credentials", type: "credentials" })),
);

import {
  registerModel,
  getModel,
  listModels,
  updateModel,
  submitForReview,
  reviewModel,
  approveModel,
  rejectModel,
  deprecateModel,
  deployModel,
  getActiveDeployments,
  getModelGovernanceStats,
} from "../model-governance-service";

describe("Model Governance Service", () => {
  let modelId: string;
  const userId = "user_001";
  const reviewerId = "reviewer_001";
  const approverId = "approver_001";

  beforeEach(async () => {
    clearStores();
    const result = await registerModel({
      name: "Claude Opus 4",
      provider: "Anthropic",
      version: "2026-05-01",
      modelType: "LLM",
      description: "Anthropic's flagship model",
      useCase: "Audit analysis and review",
      riskLevel: "HIGH",
      createdBy: userId,
    });
    modelId = result.id;
  });

  // ─── CRUD ───

  it("registers a model and returns its id", async () => {
    expect(modelId).toBeTruthy();
    const model = await getModel(modelId);
    expect(model.name).toBe("Claude Opus 4");
    expect(model.provider).toBe("Anthropic");
    expect(model.status).toBe("DRAFT");
  });

  it("lists all models", async () => {
    await registerModel({ name: "GPT-4o", provider: "OpenAI", version: "v4.0", modelType: "LLM", createdBy: userId });
    const models = await listModels();
    expect(models).toHaveLength(2);
  });

  it("lists models filtered by organization", async () => {
    const models = await listModels("org_001");
    expect(models).toHaveLength(0);

    await registerModel({ name: "GPT-4o", provider: "OpenAI", version: "v4.0", modelType: "LLM", organizationId: "org_001", createdBy: userId });
    const orgModels = await listModels("org_001");
    expect(orgModels).toHaveLength(1);
  });

  it("updates a model", async () => {
    await updateModel(modelId, { description: "Updated description", createdBy: userId });
    const model = await getModel(modelId);
    expect(model.description).toBe("Updated description");
  });

  it("throws when getting a non-existent model", async () => {
    await expect(getModel("nonexistent")).rejects.toThrow("not found");
  });

  // ─── Workflow ───

  it("submits a model for review", async () => {
    await submitForReview(modelId, userId);
    const model = await getModel(modelId);
    expect(model.status).toBe("PENDING_REVIEW");
  });

  it("throws when submitting a non-DRAFT model for review", async () => {
    await submitForReview(modelId, userId);
    await expect(submitForReview(modelId, userId)).rejects.toThrow("must be DRAFT");
  });

  it("reviews a model (adds governance review)", async () => {
    await submitForReview(modelId, userId);
    await reviewModel(modelId, {
      reviewType: "SECURITY",
      reviewerId,
      reviewerName: "Security Reviewer",
      status: "PASSED",
      notes: "All security checks passed",
    });

    const model = await getModel(modelId);
    expect(model.reviews).toHaveLength(1);
    expect(model.reviews[0].reviewType).toBe("SECURITY");
    expect(model.reviews[0].status).toBe("PASSED");
  });

  it("approves a model", async () => {
    await submitForReview(modelId, userId);
    await reviewModel(modelId, {
      reviewType: "SECURITY",
      reviewerId,
      reviewerName: "Security Reviewer",
      status: "PASSED",
    });
    await approveModel(modelId, { approvedById: approverId, approvalNotes: "Approved for production" });

    const model = await getModel(modelId);
    expect(model.status).toBe("APPROVED");
    expect(model.approvedById).toBe(approverId);
    expect(model.approvedAt).toBeTruthy();
  });

  it("rejects a model", async () => {
    await submitForReview(modelId, userId);
    await rejectModel(modelId, { rejectedById: reviewerId, rejectionReason: "Fails compliance requirements" });

    const model = await getModel(modelId);
    expect(model.status).toBe("REJECTED");
    expect(model.reviewNotes).toBe("Fails compliance requirements");
  });

  it("deprecates a model and deactivates its deployments", async () => {
    await submitForReview(modelId, userId);
    await reviewModel(modelId, { reviewType: "SECURITY", reviewerId, status: "PASSED" });
    await approveModel(modelId, { approvedById: approverId });
    await deployModel(modelId, { environment: "production", deployedById: userId });

    await deprecateModel(modelId, userId);
    const model = await getModel(modelId);
    expect(model.status).toBe("DEPRECATED");

    const deployments = await getActiveDeployments(modelId);
    expect(deployments).toHaveLength(0);
  });

  // ─── Deployment ───

  it("deploys a model after approval", async () => {
    await submitForReview(modelId, userId);
    await reviewModel(modelId, { reviewType: "SECURITY", reviewerId, status: "PASSED" });
    await approveModel(modelId, { approvedById: approverId });
    await deployModel(modelId, { environment: "staging", endpointUrl: "https://api.example.com/model", deployedById: userId });

    const deployments = await getActiveDeployments(modelId);
    expect(deployments).toHaveLength(1);
    expect(deployments[0].environment).toBe("staging");
  });

  it("throws when deploying an unapproved model", async () => {
    await expect(deployModel(modelId, { environment: "production", deployedById: userId })).rejects.toThrow("must be APPROVED");
  });

  // ─── Governance Stats ───

  it("returns governance stats", async () => {
    await submitForReview(modelId, userId);
    await reviewModel(modelId, { reviewType: "SECURITY", reviewerId, status: "PASSED" });
    await approveModel(modelId, { approvedById: approverId });

    const stats = await getModelGovernanceStats();
    expect(stats.total).toBe(1);
    expect(stats.byStatus["APPROVED"]).toBe(1);
    expect(stats.byRiskLevel["HIGH"]).toBe(1);
    expect(stats.byProvider["Anthropic"]).toBe(1);
  });

  // ─── Error cases ───

  it("throws when approving without a SECURITY review", async () => {
    await submitForReview(modelId, userId);
    await reviewModel(modelId, { reviewType: "ETHICS", reviewerId, status: "PASSED" });

    await expect(approveModel(modelId, { approvedById: approverId })).rejects.toThrow("no SECURITY review has passed");
  });

  it("throws when approving a model not in review", async () => {
    await expect(approveModel(modelId, { approvedById: approverId })).rejects.toThrow("must be PENDING_REVIEW");
  });

  it("throws when deprecating an already deprecated model", async () => {
    await submitForReview(modelId, userId);
    await reviewModel(modelId, { reviewType: "SECURITY", reviewerId, status: "PASSED" });
    await approveModel(modelId, { approvedById: approverId });
    await deprecateModel(modelId, userId);
    await expect(deprecateModel(modelId, userId)).rejects.toThrow("already deprecated");
  });

  it("rejects model on failed SECURITY review", async () => {
    await submitForReview(modelId, userId);
    await reviewModel(modelId, { reviewType: "SECURITY", reviewerId, status: "FAILED", findings: "Critical vulnerability found" });

    const model = await getModel(modelId);
    expect(model.status).toBe("REJECTED");
  });

  it("throws when reviewing a model not in PENDING_REVIEW", async () => {
    await expect(reviewModel(modelId, { reviewType: "SECURITY", reviewerId, status: "PASSED" })).rejects.toThrow("must be PENDING_REVIEW");
  });
});
