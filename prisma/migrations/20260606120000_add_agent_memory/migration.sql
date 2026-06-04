-- CreateTable
CREATE TABLE "AgentMemory" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "agentType" TEXT NOT NULL DEFAULT 'assistant',
    "memoryKey" TEXT NOT NULL,
    "memoryValue" JSONB NOT NULL,
    "context" JSONB NOT NULL DEFAULT '{}',
    "ttl" TIMESTAMP(3),
    "tags" JSONB NOT NULL DEFAULT '[]',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentMemory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentMemory_organizationId_agentId_memoryKey_key" ON "AgentMemory"("organizationId", "agentId", "memoryKey");

-- CreateIndex
CREATE INDEX "AgentMemory_organizationId_agentId_idx" ON "AgentMemory"("organizationId", "agentId");

-- CreateIndex
CREATE INDEX "AgentMemory_organizationId_agentType_idx" ON "AgentMemory"("organizationId", "agentType");

-- CreateIndex
CREATE INDEX "AgentMemory_ttl_idx" ON "AgentMemory"("ttl");
