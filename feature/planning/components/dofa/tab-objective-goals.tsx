"use client";

import { useMemo, useState } from "react";
import { Plus, Target } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGoalsQuery,
  useGoalStatusesQuery,
  useDeleteGoalMutation,
} from "@/feature/planning/hooks/use-dofa";
import { GoalRow } from "./goal-row";
import { GoalFormDialog } from "./goal-form-dialog";
import type { GoalDto } from "@/feature/planning/api/dofa";

interface Props {
  objectiveId: string;
  readOnly?: boolean;
}

export function TabObjectiveGoals({ objectiveId, readOnly }: Props) {
  const { data: goals = [], isLoading } = useGoalsQuery({ objectiveId });
  const { data: statuses = [] } = useGoalStatusesQuery();
  const deleteMutation = useDeleteGoalMutation();
  const [dialog, setDialog] = useState<{ open: boolean; goal: GoalDto | null }>({
    open: false,
    goal: null,
  });

  // R-5 defensive: filter client-side by objectiveId (PM-16)
  const filtered = useMemo(
    () => goals.filter((g) => g.objectiveId === objectiveId),
    [goals, objectiveId],
  );

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta meta?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Meta eliminada");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  if (isLoading) return <Skeleton className="h-24 w-full" />;

  return (
    <div className="space-y-3">
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center text-center py-8">
          <Target className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">Sin metas definidas</p>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            Crea metas medibles con valor base, actual y objetivo. El progreso se calcula
            automáticamente.
          </p>
        </div>
      ) : (
        filtered.map((g) => (
          <GoalRow
            key={g.id}
            goal={g}
            statuses={statuses}
            onEdit={() => setDialog({ open: true, goal: g })}
            onDelete={() => handleDelete(g.id)}
            readOnly={readOnly}
          />
        ))
      )}

      {!readOnly && (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5"
          onClick={() => setDialog({ open: true, goal: null })}
        >
          <Plus className="h-3.5 w-3.5" />
          Nueva meta
        </Button>
      )}

      <GoalFormDialog
        open={dialog.open}
        goal={dialog.goal}
        objectiveId={objectiveId}
        onClose={() => setDialog({ open: false, goal: null })}
      />
    </div>
  );
}
