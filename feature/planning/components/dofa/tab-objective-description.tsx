"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useObjectiveStatusesQuery,
  useUpdateObjectiveMutation,
  useDeleteObjectiveMutation,
} from "@/feature/planning/hooks/use-dofa";
import { useUserSearch } from "@/feature/user/hooks/useUserSearch";
import type { ObjectiveDto } from "@/feature/planning/api/dofa";

interface TabObjectiveDescriptionProps {
  objective: ObjectiveDto;
  readOnly?: boolean;
  onClose: () => void;
}

export function TabObjectiveDescription({ objective, readOnly = false, onClose }: TabObjectiveDescriptionProps) {
  const { data: statuses = [] } = useObjectiveStatusesQuery();
  const updateMutation = useUpdateObjectiveMutation();
  const deleteMutation = useDeleteObjectiveMutation();

  const { data: usersPage } = useUserSearch({ pageSize: 100, search: "" });
  const users = usersPage?.items ?? [];

  const [name, setName] = useState(objective.name);
  const [description, setDescription] = useState(objective.description ?? "");
  const [responsibleId, setResponsibleId] = useState(objective.responsibleId ?? "__none__");

  const save = (overrides?: Partial<{ name: string; description: string; responsibleId: string | null }>) => {
    const effectiveName = overrides?.name ?? name;
    if (!effectiveName.trim()) return;
    updateMutation.mutate({
      objectiveId: objective.id,
      payload: {
        id: objective.id,
        name: effectiveName.trim(),
        description:
          overrides?.description !== undefined
            ? overrides.description || null
            : description || null,
        responsibleId:
          overrides?.responsibleId !== undefined
            ? overrides.responsibleId
            : responsibleId === "__none__"
            ? null
            : responsibleId,
      },
    });
  };

  const handleResponsibleChange = (value: string) => {
    setResponsibleId(value);
    save({ responsibleId: value === "__none__" ? null : value });
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(objective.id);
      toast.success("Objetivo eliminado");
      onClose();
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const statusLabel = statuses.find((s) => s.id === objective.statusId)?.name ?? "—";

  const fmtDate = (iso: string) => {
    try {
      return format(new Date(iso), "dd/MM/yyyy");
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {/* Left column: editable fields */}
        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="obj-name">Nombre</Label>
            <Input
              id="obj-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => name.trim() && save({ name: name.trim() })}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              placeholder="Nombre del objetivo"
              disabled={readOnly}
              className="text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="obj-desc">Descripción</Label>
            <Textarea
              id="obj-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => save({ description })}
              placeholder="Describe el objetivo en detalle..."
              disabled={readOnly}
              rows={4}
              className="text-sm resize-none"
            />
          </div>

          {/* Responsible */}
          <div className="space-y-1.5">
            <Label>Responsable</Label>
            <Select
              value={responsibleId}
              onValueChange={handleResponsibleChange}
              disabled={readOnly}
            >
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Sin asignar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sin asignar</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right column: read-only date & status cards */}
        <div className="space-y-2">
          <div className="rounded-lg border p-3 flex items-start gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground">Fecha inicio</p>
              <p className="text-sm font-medium">{fmtDate(objective.startDate)}</p>
            </div>
          </div>
          <div className="rounded-lg border p-3 flex items-start gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="text-[11px] text-muted-foreground">Fecha fin</p>
              <p className="text-sm font-medium">{fmtDate(objective.endDate)}</p>
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-[11px] text-muted-foreground">Estado</p>
            <p className="text-sm font-medium">{statusLabel}</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <Label>Progreso</Label>
        <div className="text-3xl font-bold tabular-nums leading-none">
          {objective.progressPercentage ?? 0}%
        </div>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${objective.progressPercentage ?? 0}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Calculado a partir de metas vinculadas
        </p>
      </div>

      {/* Danger zone */}
      <Separator />
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Acciones peligrosas
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="lg"
              className="w-full gap-2"
              disabled={readOnly || deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar objetivo
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar este objetivo?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará permanentemente el objetivo y todas sus metas, indicadores y mediciones. No se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDelete}
              >
                Sí, eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
