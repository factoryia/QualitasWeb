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

export type PerspectiveUpsertDraft = {
  code: string;
  name: string;
  description: string;
  color: string;
  order: string;
};

export const EMPTY_PERSPECTIVE_DRAFT: PerspectiveUpsertDraft = {
  code: "",
  name: "",
  description: "",
  color: "",
  order: "0",
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  draft: PerspectiveUpsertDraft;
  onChange: (patch: Partial<PerspectiveUpsertDraft>) => void;
  onSave: () => void;
  isBusy: boolean;
};

export function PerspectiveUpsertDialog({
  open,
  onOpenChange,
  mode,
  draft,
  onChange,
  onSave,
  isBusy,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nueva perspectiva BSC" : "Editar perspectiva BSC"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Código</Label>
              <Input
                value={draft.code}
                onChange={(e) => onChange({ code: e.target.value })}
                placeholder="FIN"
                disabled={mode === "edit"}
              />
            </div>
            <div className="space-y-2">
              <Label>Orden</Label>
              <Input
                type="number"
                value={draft.order}
                onChange={(e) => onChange({ order: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              value={draft.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Financiero"
            />
          </div>
          <div className="space-y-2">
            <Label>Color (hex opcional)</Label>
            <Input
              value={draft.color}
              onChange={(e) => onChange({ color: e.target.value })}
              placeholder="#3b82f6"
            />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={draft.description}
              onChange={(e) => onChange({ description: e.target.value })}
              rows={2}
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
          <Button
            onClick={onSave}
            disabled={
              isBusy ||
              !draft.name.trim() ||
              (mode === "create" && !draft.code.trim())
            }
          >
            {mode === "create" ? "Crear" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
