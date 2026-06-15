-- AuditOS 2.0 Phase 2: Reporting Graph foundation + LeadScheduleLine prep

CREATE TABLE "ReportingGraph" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportingGraph_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReportingGraphNode" (
    "id" TEXT NOT NULL,
    "graphId" TEXT NOT NULL,
    "nodeType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportingGraphNode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReportingGraphEdge" (
    "id" TEXT NOT NULL,
    "graphId" TEXT NOT NULL,
    "edgeType" TEXT NOT NULL,
    "sourceNodeId" TEXT NOT NULL,
    "targetNodeId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportingGraphEdge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ReportingGraphSnapshot" (
    "id" TEXT NOT NULL,
    "graphId" TEXT NOT NULL,
    "milestone" TEXT NOT NULL,
    "nodeCount" INTEGER NOT NULL DEFAULT 0,
    "edgeCount" INTEGER NOT NULL DEFAULT 0,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportingGraphSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeadScheduleLine" (
    "id" TEXT NOT NULL,
    "leadScheduleId" TEXT NOT NULL,
    "lineNumber" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadScheduleLine_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReportingGraph_engagementId_key" ON "ReportingGraph"("engagementId");
CREATE INDEX "ReportingGraph_engagementId_idx" ON "ReportingGraph"("engagementId");

CREATE UNIQUE INDEX "ReportingGraphNode_graphId_entityType_entityId_key" ON "ReportingGraphNode"("graphId", "entityType", "entityId");
CREATE INDEX "ReportingGraphNode_graphId_nodeType_idx" ON "ReportingGraphNode"("graphId", "nodeType");

CREATE UNIQUE INDEX "ReportingGraphEdge_graphId_edgeType_sourceNodeId_targetNodeId_key" ON "ReportingGraphEdge"("graphId", "edgeType", "sourceNodeId", "targetNodeId");
CREATE INDEX "ReportingGraphEdge_graphId_idx" ON "ReportingGraphEdge"("graphId");

CREATE INDEX "ReportingGraphSnapshot_graphId_createdAt_idx" ON "ReportingGraphSnapshot"("graphId", "createdAt");

CREATE INDEX "LeadScheduleLine_leadScheduleId_idx" ON "LeadScheduleLine"("leadScheduleId");

ALTER TABLE "ReportingGraph" ADD CONSTRAINT "ReportingGraph_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReportingGraphNode" ADD CONSTRAINT "ReportingGraphNode_graphId_fkey" FOREIGN KEY ("graphId") REFERENCES "ReportingGraph"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReportingGraphEdge" ADD CONSTRAINT "ReportingGraphEdge_graphId_fkey" FOREIGN KEY ("graphId") REFERENCES "ReportingGraph"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReportingGraphEdge" ADD CONSTRAINT "ReportingGraphEdge_sourceNodeId_fkey" FOREIGN KEY ("sourceNodeId") REFERENCES "ReportingGraphNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReportingGraphEdge" ADD CONSTRAINT "ReportingGraphEdge_targetNodeId_fkey" FOREIGN KEY ("targetNodeId") REFERENCES "ReportingGraphNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ReportingGraphSnapshot" ADD CONSTRAINT "ReportingGraphSnapshot_graphId_fkey" FOREIGN KEY ("graphId") REFERENCES "ReportingGraph"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LeadScheduleLine" ADD CONSTRAINT "LeadScheduleLine_leadScheduleId_fkey" FOREIGN KEY ("leadScheduleId") REFERENCES "LeadSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
