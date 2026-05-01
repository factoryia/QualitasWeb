"use client";

import { useState } from "react";
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
  useStrategyUpdateMutation,
} from "@/feature/planning/hooks/use-dofa";
import { useUserSearch } from "@/feature/user/hooks/useUserSearch";
import type { StrategyDto } from "@/feature/planning/api/dofa";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface StrategyTabDescriptionProps {
  strategy: StrategyDto;
  readOnly?: boolean;
}

export function StrategyTabDescription({ strategy, readOnly = false }: StrategyTabDescriptionProps) {
  const updateMutation = useStrategyUpdateMutation();

  // Local draft state — saved on blur
  const [title, setTitle] = useState(strategy.title);
  const [description, setDescription] = useState(strategy.description ?? "");
  const [responsibleId, setResponsibleId] = useState<string>(
    strategy.responsibleId ?? "__none__",
  );

  // Load users for responsible select (pageSize 100 covers most orgs)
  const { data: usersPage } = useUserSearch({ pageSize: 100, search: "" });
  const users = usersPage?.items ?? [];

  const save = (overrides?: Partial<{ title: string; description: string; responsibleId: string | null }>) => {
    const payload = {
      id: strategy.id,
      title: overrides?.title ?? title,
      description: overrides?.description !== undefined ? overrides.description || null : description || null,
      responsibleId:
        overrides?.responsibleId !== undefined
          ? overrides.responsibleId
          : responsibleId === "__none__"
          ? null
          : responsibleId,
      // NOTE: do NOT send status (PM-05)
    };
    updateMutation.mutate({ strategyId: strategy.id, payload });
  };

  const handleResponsibleChange = (value: string) => {
    setResponsibleId(value);
    save({ responsibleId: value === "__none__" ? null : value });
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="space-y-1.5">
        <Label htmlFor="strat-title">Título</Label>
        <Input
          id="strat-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title.trim() && save({ title: title.trim() })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          placeholder="Título de la estrategia"
          disabled={readOnly}
          className="text-sm"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="strat-desc">Descripción</Label>
        <Textarea
          id="strat-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => save({ description })}
          placeholder="Describe la estrategia en detalle..."
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

      {/* Progress (R-6: read-only from backend — do not recalculate) */}
      <div className="space-y-1.5">
        <Label>Progreso</Label>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Avance general</span>
            <span className="tabular-nums font-medium">{strategy.progressPercentage ?? 0}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${strategy.progressPercentage ?? 0}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Calculado a partir de objetivos vinculados
          </p>
        </div>
      </div>
    </div>
  );
}
