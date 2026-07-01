-- Staging drift repair: indexes from 20260613100000_reporting_graph_foundation
-- Safe to re-run (IF NOT EXISTS). Run via: Get-Content ... | npx prisma db execute --stdin
-- Apply on staging RDS if graph sync fails with ON CONFLICT / 42P10 errors.

CREATE UNIQUE INDEX IF NOT EXISTS "ReportingGraph_engagementId_key"
  ON "ReportingGraph"("engagementId");
CREATE INDEX IF NOT EXISTS "ReportingGraph_engagementId_idx"
  ON "ReportingGraph"("engagementId");

CREATE UNIQUE INDEX IF NOT EXISTS "ReportingGraphNode_graphId_entityType_entityId_key"
  ON "ReportingGraphNode"("graphId", "entityType", "entityId");
CREATE INDEX IF NOT EXISTS "ReportingGraphNode_graphId_nodeType_idx"
  ON "ReportingGraphNode"("graphId", "nodeType");

CREATE UNIQUE INDEX IF NOT EXISTS "ReportingGraphEdge_graphId_edgeType_sourceNodeId_targetNodeId_key"
  ON "ReportingGraphEdge"("graphId", "edgeType", "sourceNodeId", "targetNodeId");
CREATE INDEX IF NOT EXISTS "ReportingGraphEdge_graphId_idx"
  ON "ReportingGraphEdge"("graphId");

CREATE INDEX IF NOT EXISTS "ReportingGraphSnapshot_graphId_createdAt_idx"
  ON "ReportingGraphSnapshot"("graphId", "createdAt");
