"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Draft = {
  title: string;
  period: string;
  description: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: Draft;
  onDraftChange: (patch: Partial<Draft>) => void;
  onSubmit: (event: FormEvent) => void;
  isBusy: boolean;
  canSubmit: boolean;
};

export function DofaCreateAnalysisDialog({
  open,
  onOpenChange,
  draft,
  onDraftChange,
  onSubmit,
  isBusy,
  canSubmit,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Nuevo análisis DOFA</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={draft.title}
              onChange={(e) => onDraftChange({ title: e.target.value })}
              placeholder="DOFA 2026 - Mi Empresa"
            />
          </div>

          <div className="space-y-2">
            <Label>Periodo</Label>
            <Input
              value={draft.period}
              onChange={(e) => onDraftChange({ period: e.target.value })}
              placeholder="2026"
            />
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={draft.description}
              onChange={(e) => onDraftChange({ description: e.target.value })}
              rows={4}
              placeholder="Análisis estratégico integral..."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isBusy}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              Crear
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
