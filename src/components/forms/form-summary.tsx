"use client";

import type { FormData } from "./constants";
import {
  industries,
  systemCategories,
  intents,
  challenges,
  outcomes,
  findLabel,
} from "./constants";

export function FormSummary({ data }: { data: FormData }) {
  if (!data.orgName || !data.systemCategory) return null;

  return (
    <section className="mt-6 rounded-[24px] border border-border/70 bg-gradient-to-br from-muted/30 to-background p-4 shadow-sm sm:p-6">
      <h3 className="mb-4 text-base font-bold">ملخص الطلب</h3>
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <span className="text-muted-foreground">المؤسسة:</span>{" "}
          <span className="font-medium">{data.orgName}</span>
        </div>
        <div>
          <span className="text-muted-foreground">القطاع:</span>{" "}
          <span className="font-medium">
            {findLabel(industries, data.industry)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">النظام:</span>{" "}
          <span className="font-medium">
            {findLabel(systemCategories, data.systemCategory)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">الهدف:</span>{" "}
          <span className="font-medium">
            {findLabel(intents, data.intent)}
          </span>
        </div>
        {data.challenges.length > 0 && (
          <div className="sm:col-span-2">
            <span className="text-muted-foreground">التحديات:</span>{" "}
            <span className="font-medium">
              {data.challenges.map((c) => findLabel(challenges, c)).join("، ")}
            </span>
          </div>
        )}
        {data.outcomes.length > 0 && (
          <div className="sm:col-span-2">
            <span className="text-muted-foreground">المخرجات:</span>{" "}
            <span className="font-medium">
              {data.outcomes.map((o) => findLabel(outcomes, o)).join("، ")}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
