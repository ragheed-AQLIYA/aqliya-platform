"use client";

import type { Engagement } from "@/types/audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface TeamCardProps {
  team: Engagement["team"];
}

export function TeamCard({ team }: TeamCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Users className="h-4 w-4 text-muted-foreground" />
          أعضاء الفريق
        </CardTitle>
      </CardHeader>
      <CardContent>
        {team.length > 0 ? (
          <div className="space-y-3">
            {team.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    {member.userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {member.userName}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {member.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            لم يتم تعيين أعضاء فريق
          </p>
        )}
      </CardContent>
    </Card>
  );
}
