/** Repository tests — same CRUD/concurrency pattern */
import { InMemoryEngagementRepository } from "../../infrastructure/in-memory-repository";
import { Engagement } from "../engagement";
import { ConcurrencyError, NotFoundError } from "../errors";

const ORG = "org1";

function createAndSeed(repo: InMemoryEngagementRepository, id: string) {
  const e = Engagement.create({ clientId: "c1", period: "FY2026", organizationId: ORG, createdById: "u1" });
  repo["store"].set(id, { ...e.toJSON(), id, version: 1 });
}

describe("EngagementRepository", () => {
  let repo: InMemoryEngagementRepository;
  beforeEach(() => { repo = new InMemoryEngagementRepository(); });

  test("findById returns engagement", async () => {
    createAndSeed(repo, "e1");
    const found = await repo.findById("e1", ORG);
    expect(found).not.toBeNull();
    expect(found!.status).toBe("Proposal");
  });

  test("save updates existing and increments version", async () => {
    createAndSeed(repo, "e1");
    const saved = await repo.save(Engagement.reconstitute({ ...repo["store"].get("e1")!, id: "e1", version: 1 }));
    expect(saved.version).toBe(2);
  });

  test("concurrency: stale version fails", async () => {
    createAndSeed(repo, "e1");
    repo["store"].set("e1", { ...repo["store"].get("e1")!, version: 5 });
    await expect(
      repo.save(Engagement.reconstitute({ ...repo["store"].get("e1")!, version: 1 }))
    ).rejects.toThrow(ConcurrencyError);
  });

  test("tenant isolation", async () => {
    createAndSeed(repo, "e1");
    expect(await repo.findById("e1", "other-org")).toBeNull();
  });
});
