"use client";

import { useMemo, useState } from "react";
import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useObjectivesQuery,
  useObjectiveStatusesQuery,
  useStrategiesQuery,
  useStrategyTypesQuery,
} from "@/feature/planning/hooks/use-dofa";
import { ObjectiveCard } from "./objective-card";
import { CreateObjectiveDialog } from "./create-objective-dialog";

interface PlanGridProps {
  analysisId: string;
  readOnly?: boolean;
  onSelectObjective: (id: string) => void;
}

export function PlanGrid({ analysisId, readOnly, onSelectObjective }: PlanGridProps) {
  const { data: objectives = [], isLoading } = useObjectivesQuery({ analysisId });
  const { data: statuses = [] } = useObjectiveStatusesQuery();
  const { data: strategies = [] } = useStrategiesQuery(analysisId);
  const { data: strategyTypes = [] } = useStrategyTypesQuery();

  const [createOpen, setCreateOpen] = useState(false);

  // Average progress across all objectives for the phase-level progress indicator
  const phase3Progress = useMemo(() => {
    if (!objectives.length) return 0;
    const sum = objectives.reduce((acc, o) => acc + (o.progressPercentage ?? 0), 0);
    return Math.round(sum / objectives.length);
  }, [objectives]);

  // Origin map: objectiveId → strategies that link to it
  // Sprint 3.2: computed from strategy-objectives links already fetched per strategy.
  // TODO (Sprint 3.3): replace with a single aggregated endpoint or batch useQueries.
  const originMap = useMemo(() => {
    const map = new Map<string, { code: string; description: string }[]>();
    // Wiring deferred to Sprint 3.3 — strategies and strategyTypes are pre-fetched
    // so the dependency is tracked; the map will be populated once the link queries
    // are added in the next sub-sprint.
    void strategies;
    void strategyTypes;
    return map;
  }, [strategies, strategyTypes]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <h2 className="text-base font-semibold">Fase 3 — Plan</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-48 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${phase3Progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">
              {phase3Progress}% avance
            </span>
          </div>
        </div>
        {!readOnly && (
          <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Nuevo objetivo
          </Button>
        )}
      </div>

      {/* Empty state */}
      {objectives.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
            <Target className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium">No hay objetivos definidos</p>
          <p className="text-xs text-muted-foreground max-w-md mt-1">
            Crea el primer objetivo estratégico para este análisis. Puedes vincularlos a
            estrategias FO/DO/FA/DA en Fase 2.
          </p>
          {!readOnly && (
            <Button
              size="sm"
              variant="outline"
              className="mt-4 gap-1.5"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Crear primer objetivo
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {objectives.map((obj) => (
            <ObjectiveCard
              key={obj.id}
              objective={obj}
              goalsCount={0 /* TODO Sprint 3.3: wire useGoalsQuery({ objectiveId }) */}
              origins={originMap.get(obj.id) ?? []}
              statuses={statuses}
              onClick={() => onSelectObjective(obj.id)}
            />
          ))}
        </div>
      )}

      <CreateObjectiveDialog
        open={createOpen}
        analysisId={analysisId}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => {
          setCreateOpen(false);
          onSelectObjective(id);
        }}
      />
    </div>
  );
}
