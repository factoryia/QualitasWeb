"use client";

import { useMemo, useState } from "react";
import { Link2, Plus, Target, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useStrategyObjectivesQuery,
  useObjectiveStatusesQuery,
  useUnlinkObjectiveFromStrategyMutation,
} from "@/feature/planning/hooks/use-dofa";
import { StrategyLinkObjectiveDialog } from "./strategy-link-objective-dialog";
import { StrategyCreateObjectiveForm } from "./strategy-create-objective-form";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface StrategyTabObjectivesProps {
  strategyId: string;
  readOnly?: boolean;
}

export function StrategyTabObjectives({ strategyId, readOnly = false }: StrategyTabObjectivesProps) {
  const { data: linkedObjectives = [], isLoading } = useStrategyObjectivesQuery(strategyId);
  const { data: statuses = [] } = useObjectiveStatusesQuery();
  const unlinkMutation = useUnlinkObjectiveFromStrategyMutation();
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // R-5: defensive status lookup — orphan statusId shows "Sin estado"
  const statusName = (statusId: string) =>
    statuses.find((s) => s.id === statusId)?.name ?? "Sin estado";

  const linkedIds = useMemo(() => new Set(linkedObjectives.map((o) => o.id)), [linkedObjectives]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Linked objectives list */}
      {linkedObjectives.length === 0 ? (
        <div className="rounded-md border border-dashed bg-muted/20 p-6 text-center">
          <Target className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm font-medium text-foreground">Sin objetivos vinculados</p>
          <p className="text-xs text-muted-foreground mt-1">
            Sin objetivos no puede medirse ni ejecutarse esta estrategia.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {linkedObjectives.map((obj) => (
            <div
              key={obj.id}
              className="rounded-md border bg-card px-3 py-2.5 flex items-start gap-3"
            >
              <Target className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug">{obj.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {statusName(obj.statusId)}
                  </Badge>
                  {/* R-6: progress is read-only from backend */}
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${obj.progressPercentage ?? 0}%` }}
                      />
                    </div>
                    <span className="tabular-nums">{obj.progressPercentage ?? 0}%</span>
                  </div>
                </div>
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() =>
                    // linkId = objectiveId (backend path-based link, no separate link record exposed)
                    unlinkMutation.mutate({ strategyId, linkId: obj.id })
                  }
                  className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                  title="Desvincular"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Inline create form */}
      {showCreateForm && !readOnly && (
        <StrategyCreateObjectiveForm
          strategyId={strategyId}
          onDone={() => setShowCreateForm(false)}
        />
      )}

      {/* Action buttons */}
      {!readOnly && !showCreateForm && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Crear objetivo
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs"
            onClick={() => setLinkDialogOpen(true)}
          >
            <Link2 className="h-3.5 w-3.5 mr-1.5" />
            Vincular existente
          </Button>
        </div>
      )}

      {/* Link existing dialog */}
      <StrategyLinkObjectiveDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        strategyId={strategyId}
        excludeIds={linkedIds}
      />
    </div>
  );
}
