// @ts-nocheck
jest.mock("@/lib/prisma", () => ({
  prisma: {
    agentMemory: {
      upsert: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  requireUserContext: jest.fn(),
  isExpectedAccessDeniedError: jest.fn(() => false),
}));

import { describe, expect, it, beforeEach, jest } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import {
  setAgentMemory,
  getAgentMemory,
  queryAgentMemory,
  deleteAgentMemory,
  cleanExpiredMemory,
} from "@/lib/platform/agent-memory";

const ORG_ID = "org-1";
const AGENT_ID = "agent-1";
const MEMORY_KEY = "user_preferences";
const MEMORY_VALUE = { theme: "dark", locale: "ar" };

describe("AgentMemory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("setAgentMemory", () => {
    it("creates a new memory item", async () => {
      (prisma.agentMemory.upsert as jest.Mock).mockResolvedValue({ id: "mem-1" });

      await setAgentMemory(ORG_ID, {
        agentId: AGENT_ID,
        memoryKey: MEMORY_KEY,
        memoryValue: MEMORY_VALUE,
        createdById: "user-1",
      });

      expect(prisma.agentMemory.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            organizationId_agentId_memoryKey: {
              organizationId: ORG_ID,
              agentId: AGENT_ID,
              memoryKey: MEMORY_KEY,
            },
          },
          create: expect.objectContaining({
            organizationId: ORG_ID,
            agentId: AGENT_ID,
            memoryKey: MEMORY_KEY,
            memoryValue: MEMORY_VALUE,
            agentType: "assistant",
          }),
        }),
      );
    });

    it("updates an existing memory item", async () => {
      const updatedValue = { theme: "light", locale: "en" };
      (prisma.agentMemory.upsert as jest.Mock).mockResolvedValue({ id: "mem-1" });

      await setAgentMemory(ORG_ID, {
        agentId: AGENT_ID,
        memoryKey: MEMORY_KEY,
        memoryValue: updatedValue,
      });

      expect(prisma.agentMemory.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            organizationId_agentId_memoryKey: {
              organizationId: ORG_ID,
              agentId: AGENT_ID,
              memoryKey: MEMORY_KEY,
            },
          },
          update: expect.objectContaining({ memoryValue: updatedValue }),
          create: expect.objectContaining({ memoryValue: updatedValue }),
        }),
      );
    });
  });

  describe("getAgentMemory", () => {
    it("returns memory value when found", async () => {
      (prisma.agentMemory.findFirst as jest.Mock).mockResolvedValue({
        id: "mem-1",
        memoryValue: MEMORY_VALUE,
        ttl: null,
      });

      const result = await getAgentMemory(ORG_ID, AGENT_ID, MEMORY_KEY);

      expect(result).toEqual(MEMORY_VALUE);
    });

    it("returns null when memory not found", async () => {
      (prisma.agentMemory.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getAgentMemory(ORG_ID, AGENT_ID, MEMORY_KEY);

      expect(result).toBeNull();
    });

    it("returns null and deletes expired memory", async () => {
      const pastDate = new Date("2020-01-01");
      (prisma.agentMemory.findFirst as jest.Mock).mockResolvedValue({
        id: "mem-1",
        memoryValue: MEMORY_VALUE,
        ttl: pastDate,
      });

      const result = await getAgentMemory(ORG_ID, AGENT_ID, MEMORY_KEY);

      expect(result).toBeNull();
      expect(prisma.agentMemory.delete).toHaveBeenCalledWith({
        where: { id: "mem-1" },
      });
    });
  });

  describe("queryAgentMemory", () => {
    it("returns memories matching query", async () => {
      const records = [
        {
          memoryKey: "pref_theme",
          memoryValue: { theme: "dark" },
          agentId: AGENT_ID,
          agentType: "assistant",
          tags: ["user", "settings"],
          createdAt: new Date("2026-06-01"),
        },
        {
          memoryKey: "pref_locale",
          memoryValue: { locale: "ar" },
          agentId: AGENT_ID,
          agentType: "assistant",
          tags: ["user", "locale"],
          createdAt: new Date("2026-06-02"),
        },
      ];
      (prisma.agentMemory.findMany as jest.Mock).mockResolvedValue(records);

      const results = await queryAgentMemory(ORG_ID, { agentId: AGENT_ID });

      expect(results).toHaveLength(2);
      expect(results[0].key).toBe("pref_theme");
      expect(results[1].key).toBe("pref_locale");
    });

    it("filters by memory key prefix", async () => {
      (prisma.agentMemory.findMany as jest.Mock).mockResolvedValue([]);

      await queryAgentMemory(ORG_ID, { memoryKeyPrefix: "pref_" });

      expect(prisma.agentMemory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: ORG_ID,
            memoryKey: { startsWith: "pref_" },
          }),
        }),
      );
    });

    it("filters by agent type", async () => {
      (prisma.agentMemory.findMany as jest.Mock).mockResolvedValue([]);

      await queryAgentMemory(ORG_ID, { agentType: "analyst" });

      expect(prisma.agentMemory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ agentType: "analyst" }),
        }),
      );
    });

    it("applies a limit", async () => {
      (prisma.agentMemory.findMany as jest.Mock).mockResolvedValue([]);

      await queryAgentMemory(ORG_ID, { agentId: AGENT_ID, limit: 5 });

      expect(prisma.agentMemory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 }),
      );
    });
  });

  describe("deleteAgentMemory", () => {
    it("deletes a specific memory item", async () => {
      (prisma.agentMemory.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      await deleteAgentMemory(ORG_ID, AGENT_ID, MEMORY_KEY);

      expect(prisma.agentMemory.deleteMany).toHaveBeenCalledWith({
        where: { organizationId: ORG_ID, agentId: AGENT_ID, memoryKey: MEMORY_KEY },
      });
    });
  });

  describe("cleanExpiredMemory", () => {
    it("deletes expired memories", async () => {
      (prisma.agentMemory.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });

      const count = await cleanExpiredMemory();

      expect(count).toBe(3);
      expect(prisma.agentMemory.deleteMany).toHaveBeenCalledWith({
        where: { ttl: { lt: expect.any(Date), not: null } },
      });
    });
  });
});
