"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  useGoalStatusesQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
} from "@/feature/planning/hooks/use-dofa";
import { GOAL_DEFAULTS, GOAL_STATUS_CFG, findDefaultGoalStatusId } from "./plan-helpers";
import type { GoalDto, CatalogStatusDto } from "@/feature/planning/api/dofa";

interface GoalFormDialogProps {
  open: boolean;
  goal: GoalDto | null;
  objectiveId: string;
  onClose: () => void;
}

interface FormState {
  description: string;
  targetValue: string;
  currentValue: string;
  baselineValue: string;
  unit: string;
  weight: string;
  deadline: string;
  statusId: string;
}

function initState(goal: GoalDto | null, statuses: CatalogStatusDto[]): FormState {
  if (goal) {
    return {
      description: goal.description,
      targetValue: String(goal.targetValue),
      currentValue: String(goal.currentValue),
      baselineValue: String(goal.baselineValue),
      unit: goal.unit ?? "",
      weight: String(goal.weight),
      deadline: goal.deadline.slice(0, 10),
      statusId: goal.statusId,
    };
  }
  return {
    description: "",
    targetValue: "",
    currentValue: String(GOAL_DEFAULTS.currentValue),
    baselineValue: String(GOAL_DEFAULTS.baselineValue),
    unit: "",
    weight: String(GOAL_DEFAULTS.weight),
    deadline: "",
    statusId: findDefaultGoalStatusId(statuses) ?? "",
  };
}

// Inner form — mounted fresh via key on each open/goal change
interface GoalFormInnerProps {
  goal: GoalDto | null;
  objectiveId: string;
  statuses: CatalogStatusDto[];
  onClose: () => void;
}

function GoalFormInner({ goal, objectiveId, statuses, onClose }: GoalFormInnerProps) {
  const isEdit = !!goal;
  const createMutation = useCreateGoalMutation();
  const updateMutation = useUpdateGoalMutation();

  const [form, setForm] = useState<FormState>(() => initState(goal, statuses));

  // Live progress calculation
  const livePct = useMemo(() => {
    const t = parseFloat(form.targetValue) || 0;
    const c = parseFloat(form.currentValue) || 0;
    const b = parseFloat(form.baselineValue) || 0;
    if (t === b) return 0;
    return Math.min(100, Math.max(0, Math.round(((c - b) / (t - b)) * 100)));
  }, [form.targetValue, form.currentValue, form.baselineValue]);

  const handleSubmit = async () => {
    if (!form.description.trim()) { toast.error("La descripción es obligatoria"); return; }
    if (!form.targetValue) { toast.error("El valor objetivo es obligatorio"); return; }
    if (!form.deadline) { toast.error("La fecha límite es obligatoria"); return; }
    if (!form.statusId) { toast.error("Selecciona un estado"); return; }

    const sharedFields = {
      description: form.description.trim(),
      objectiveId,
      targetValue: parseFloat(form.targetValue),
      currentValue: parseFloat(form.currentValue) || 0,
      baselineValue: parseFloat(form.baselineValue) || 0,
      unit: form.unit || null,
      weight: parseInt(form.weight) || GOAL_DEFAULTS.weight,
      deadline: new Date(form.deadline + "T00:00:00Z").toISOString(),
      statusId: form.statusId,
      responsibleId: null,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          goalId: goal!.id,
          payload: { id: goal!.id, ...sharedFields },
        });
        toast.success("Meta actualizada");
      } else {
        await createMutation.mutateAsync(sharedFields);
        toast.success("Meta creada");
      }
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? e?.message ?? "Error al guardar");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4 py-2">
      <div>
        <Label>Descripción *</Label>
        <Textarea
          rows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Aumentar 29% el nivel de satisfacción de los usuarios"
          className="mt-1.5"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label>Línea base</Label>
          <Input
            type="number" step="any"
            value={form.baselineValue}
            onChange={(e) => setForm((f) => ({ ...f, baselineValue: e.target.value }))}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label>Actual</Label>
          <Input
            type="number" step="any"
            value={form.currentValue}
            onChange={(e) => setForm((f) => ({ ...f, currentValue: e.target.value }))}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label>Meta *</Label>
          <Input
            type="number" step="any"
            value={form.targetValue}
            onChange={(e) => setForm((f) => ({ ...f, targetValue: e.target.value }))}
            className="mt-1.5"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Unidad</Label>
          <Input
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            placeholder="%, mm, $"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label>Peso (0-100)</Label>
          <Input
            type="number" min={0} max={100}
            value={form.weight}
            onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
            className="mt-1.5"
          />
        </div>
      </div>

      {/* Live progress calculation */}
      <Card className="p-3 bg-muted/40">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">Progreso calculado</span>
          <span className="font-mono font-semibold text-sm">{livePct}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-200"
            style={{ width: `${livePct}%` }}
          />
        </div>
      </Card>

      <div>
        <Label>Estado *</Label>
        <Select
          value={form.statusId}
          onValueChange={(v) => setForm((f) => ({ ...f, statusId: v }))}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            {statuses
              .filter((s) => GOAL_STATUS_CFG[s.code])
              .map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {GOAL_STATUS_CFG[s.code].label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Fecha límite *</Label>
        <Input
          type="date"
          value={form.deadline}
          onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
          className="mt-1.5"
        />
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Guardando..." : isEdit ? "Guardar" : "Crear meta"}
        </Button>
      </DialogFooter>
    </div>
  );
}

export function GoalFormDialog({ open, goal, objectiveId, onClose }: GoalFormDialogProps) {
  const { data: statuses = [] } = useGoalStatusesQuery();
  const isEdit = !!goal;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar meta" : "Nueva meta"}</DialogTitle>
        </DialogHeader>
        {/* key forces remount (fresh state) when switching between create/edit or different goals */}
        <GoalFormInner
          key={goal?.id ?? "new"}
          goal={goal}
          objectiveId={objectiveId}
          statuses={statuses}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
