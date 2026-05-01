"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useObjectiveStatusesQuery,
  useObjectiveCreateMutation,
  useLinkObjectiveToStrategyMutation,
} from "@/feature/planning/hooks/use-dofa";

interface StrategyCreateObjectiveFormProps {
  strategyId: string;
  onDone: () => void;
}

export function StrategyCreateObjectiveForm({ strategyId, onDone }: StrategyCreateObjectiveFormProps) {
  const createMutation = useObjectiveCreateMutation();
  const linkMutation = useLinkObjectiveToStrategyMutation();
  const { data: statuses = [] } = useObjectiveStatusesQuery();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Use first available status as default (catalog-driven)
  const defaultStatusId = statuses[0]?.id ?? "";

  const handleSubmit = async () => {
    if (!name.trim() || !defaultStatusId) return;
    setSaving(true);
    try {
      // Step 1: create objective
      // startDate/endDate default to today / +1yr — Sprint 3 will add date pickers
      const today = new Date().toISOString().slice(0, 10);
      const nextYear = `${new Date().getFullYear() + 1}-${today.slice(5)}`;
      const newObj = await createMutation.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
        statusId: defaultStatusId,
        startDate: today,
        endDate: nextYear,
        responsibleId: null,
        strategyId,
      });
      // Step 2: link to strategy — awaits Step 1 to avoid race condition
      if (newObj?.id) {
        await linkMutation.mutateAsync({
          strategyId,
          objectiveId: newObj.id,
          payload: { objectiveId: newObj.id, description: null },
        });
      }
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-md border bg-muted/20 p-4 space-y-3">
      <p className="text-xs font-medium text-foreground">Nuevo objetivo estratégico</p>
      <div className="space-y-1.5">
        <Label htmlFor="new-obj-name" className="text-xs">
          Nombre <span className="text-destructive">*</span>
        </Label>
        <Input
          id="new-obj-name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) handleSubmit();
            if (e.key === "Escape") onDone();
          }}
          placeholder="Describe el objetivo en términos medibles..."
          className="h-8 text-sm"
          disabled={saving}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="new-obj-desc" className="text-xs">
          Descripción
        </Label>
        <Textarea
          id="new-obj-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="text-sm resize-none"
          disabled={saving}
        />
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" className="h-8" onClick={onDone} disabled={saving}>
          Cancelar
        </Button>
        <Button
          size="sm"
          className="h-8"
          onClick={handleSubmit}
          disabled={!name.trim() || !defaultStatusId || saving}
        >
          {saving ? "Guardando..." : "Crear y vincular"}
        </Button>
      </div>
    </div>
  );
}
