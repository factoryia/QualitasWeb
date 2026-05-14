"use client";

import { format } from "date-fns";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GoalProgressBar } from "./goal-progress-bar";
import { GOAL_STATUS_CFG, lookupStatusCode } from "./plan-helpers";
import type { GoalDto, CatalogStatusDto } from "@/feature/planning/api/dofa";

interface GoalRowProps {
  goal: GoalDto;
  statuses: CatalogStatusDto[];
  onEdit: () => void;
  onDelete: () => void;
  readOnly?: boolean;
}

export function GoalRow({ goal, statuses, onEdit, onDelete, readOnly }: GoalRowProps) {
  const code = lookupStatusCode(goal.statusId, statuses, "Defined");
  const cfg = GOAL_STATUS_CFG[code] ?? GOAL_STATUS_CFG.Defined;

  const fmtDate = (iso: string) => {
    try {
      return format(new Date(iso), "dd/MM/yyyy");
    } catch {
      return iso;
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <h4 className="text-sm font-semibold leading-snug">{goal.description}</h4>
          <GoalProgressBar goal={goal} />
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline" className="gap-1.5 h-5 px-1.5 text-[10px]">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
              {cfg.label}
            </Badge>
            <span className="text-muted-foreground flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {fmtDate(goal.deadline)}
            </span>
            <span className="text-muted-foreground">Peso {goal.weight}%</span>
          </div>
        </div>
        {!readOnly && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onEdit}
              aria-label="Editar meta"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={onDelete}
              aria-label="Eliminar meta"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
