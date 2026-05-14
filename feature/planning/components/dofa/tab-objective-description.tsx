"use client";

import { useState } from "react";
import { format } from "date-fns";
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
import {
  useObjectiveStatusesQuery,
  useUpdateObjectiveMutation,
} from "@/feature/planning/hooks/use-dofa";
import { useUserSearch } from "@/feature/user/hooks/useUserSearch";
import type { ObjectiveDto } from "@/feature/planning/api/dofa";

interface TabObjectiveDescriptionProps {
  objective: ObjectiveDto;
  readOnly?: boolean;
}

export function TabObjectiveDescription({ objective, readOnly = false }: TabObjectiveDescriptionProps) {
  const { data: statuses = [] } = useObjectiveStatusesQuery();
  const updateMutation = useUpdateObjectiveMutation();

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

      {/* Read-only fields — L-004: backend does NOT accept these in UpdateObjectiveCommand */}
      <div className="grid grid-cols-3 gap-3 pt-2 border-t">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Estado</Label>
          <p className="text-sm">{statusLabel}</p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Fecha inicio</Label>
          <p className="text-sm">{fmtDate(objective.startDate)}</p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Fecha fin</Label>
          <p className="text-sm">{fmtDate(objective.endDate)}</p>
        </div>
      </div>

      {/* Progress (read-only from backend) */}
      <div className="space-y-1.5">
        <Label>Progreso</Label>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Avance general</span>
            <span className="tabular-nums font-medium">{objective.progressPercentage ?? 0}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${objective.progressPercentage ?? 0}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Calculado a partir de metas vinculadas
          </p>
        </div>
      </div>
    </div>
  );
}
