"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressRing } from "./progress-ring";
import { OBJECTIVE_STATUS_CFG } from "./plan-helpers";
import type { ObjectiveDto } from "@/feature/planning/api/dofa";

interface ObjectiveCardProps {
  objective: ObjectiveDto;
  goalsCount: number;
  origins: { code: string; description: string }[];
  /** Accepts ObjectiveStatusDto[] or CatalogStatusDto[] — only id/code are used */
  statuses: { id: string; code: string }[];
  onClick: () => void;
}

export function ObjectiveCard({
  objective,
  goalsCount,
  origins,
  statuses,
  onClick,
}: ObjectiveCardProps) {
  const code =
    statuses.find((s) => s.id === objective.statusId)?.code ?? "Planned";
  const cfg = OBJECTIVE_STATUS_CFG[code] ?? OBJECTIVE_STATUS_CFG.Planned;

  return (
    <Card
      className="cursor-pointer hover:shadow-md hover:border-sky-200 transition-all active:scale-[0.99] p-4"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <ProgressRing value={objective.progressPercentage} size={48} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold leading-snug truncate">{objective.name}</h3>
          {objective.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {objective.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
            <span>
              {goalsCount} {goalsCount === 1 ? "meta" : "metas"}
            </span>
            <span>•</span>
            <Badge variant="outline" className="gap-1.5 h-5 px-1.5 text-[10px]">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
              {cfg.label}
            </Badge>
            {objective.endDate && (
              <Badge variant="outline" className="h-5 px-1.5 text-[10px] text-muted-foreground">
                Vence {format(new Date(objective.endDate), "dd/MM/yyyy")}
              </Badge>
            )}
          </div>
          {origins.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-2">
              <span className="text-[10px] text-muted-foreground">Origen:</span>
              {origins.map((s, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] bg-muted/60"
                  title={s.description}
                >
                  {s.code}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
