"use client";

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

export type EditAnalysisDraft = {
  title: string;
  description: string;
  period: string;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  draft: EditAnalysisDraft;
  onChange: (patch: Partial<EditAnalysisDraft>) => void;
  onSave: () => void;
  isBusy: boolean;
};

export function DofaEditAnalysisDialog({
  open,
  onOpenChange,
  draft,
  onChange,
  onSave,
  isBusy,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Editar análisis</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={draft.title}
              onChange={(e) => onChange({ title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Periodo</Label>
            <Input
              value={draft.period}
              onChange={(e) => onChange({ period: e.target.value })}
              placeholder="2026"
            />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={draft.description}
              onChange={(e) => onChange({ description: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isBusy}
          >
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={isBusy || !draft.title.trim()}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
