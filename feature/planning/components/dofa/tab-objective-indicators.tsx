"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGoalsQuery, useIndicatorsQuery } from "@/feature/planning/hooks/use-dofa";
import { IndicatorAccordion } from "./indicator-accordion";
import { IndicatorFormDialog } from "./indicator-form-dialog";
import type { IndicatorDto } from "@/feature/planning/api/dofa";

interface Props {
  objectiveId: string;
  readOnly?: boolean;
}

export function TabObjectiveIndicators({ objectiveId, readOnly }: Props) {
  const { data: goals = [], isLoading } = useGoalsQuery({ objectiveId });

  // PM-16: client-side filter (already done in hook, but defensive)
  const filteredGoals = useMemo(
    () => goals.filter((g) => g.objectiveId === objectiveId),
    [goals, objectiveId],
  );

  if (isLoading) return <Skeleton className="h-32 w-full" />;

  if (filteredGoals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Crea primero metas en la tab Metas para poder agregar indicadores.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {filteredGoals.map((goal) => (
        <GoalIndicatorsBlock
          key={goal.id}
          goalId={goal.id}
          goalDescription={goal.description}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}

interface BlockProps {
  goalId: string;
  goalDescription: string;
  readOnly?: boolean;
}

function GoalIndicatorsBlock({ goalId, goalDescription, readOnly }: BlockProps) {
  const { data: indicators = [] } = useIndicatorsQuery(goalId);
  const [dialog, setDialog] = useState<{ open: boolean; ind: IndicatorDto | null }>({
    open: false,
    ind: null,
  });

  return (
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        {goalDescription}
      </h4>
      <div className="space-y-2">
        {indicators.length === 0 ? (
          <p className="text-xs text-muted-foreground italic px-3">Sin indicadores</p>
        ) : (
          indicators.map((ind) => (
            <IndicatorAccordion
              key={ind.id}
              indicator={ind}
              goalId={goalId}
              onEdit={() => setDialog({ open: true, ind })}
              readOnly={readOnly}
            />
          ))
        )}
        {!readOnly && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full gap-1.5"
            onClick={() => setDialog({ open: true, ind: null })}
          >
            <Plus className="h-3 w-3" /> Nuevo indicador
          </Button>
        )}
      </div>

      <IndicatorFormDialog
        open={dialog.open}
        indicator={dialog.ind}
        goalId={goalId}
        onClose={() => setDialog({ open: false, ind: null })}
      />
    </div>
  );
}
