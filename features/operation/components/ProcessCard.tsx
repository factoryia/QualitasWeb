'use client'
import { Process } from "@/features/operation/static/MOCKS";
import { ProcessStatusBadge } from "@/features/operation/components/ProcessStatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText } from "lucide-react";

interface Props {
  process: Process;
  procedureCount: number;
  leaderName?: string;
  onClick: () => void;
}

export function ProcessCard({ process, procedureCount, leaderName, onClick }: Props) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md border-border/60"
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-mono text-muted-foreground">{process.code}</p>
            <p className="font-medium text-sm truncate">{process.name}</p>
          </div>
          <ProcessStatusBadge status={process.status} />
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {leaderName && (
            <span className="flex items-center gap-1 truncate">
              <Users className="h-3 w-3 shrink-0" />
              {leaderName}
            </span>
          )}
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3 shrink-0" />
            {procedureCount} proc.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
