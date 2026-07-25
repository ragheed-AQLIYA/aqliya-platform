"use client";

import { Badge } from "@/components/ui/badge";
import { LinkToInstMem } from "@/components/institutional-memory/link-button";
import { STATUS_LABELS, STATUS_COLORS } from "./types";
import type { RecordWithTemplate } from "./types";

interface Props {
  record: RecordWithTemplate;
  id: string;
}

export function RecordHeader({ record, id }: Props) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">{record.title}</h1>
        <div className="flex gap-2 mt-1">
          <Badge className={STATUS_COLORS[record.status] ?? ""}>
            {STATUS_LABELS[record.status] ?? record.status}
          </Badge>
          {record.template && (
            <Badge variant="outline">{record.template.name}</Badge>
          )}
        </div>
      </div>
      <LinkToInstMem
        sourceProduct="workflow"
        sourceEntityId={id}
        sourceEntityName={record.title}
      />
    </div>
  );
}
