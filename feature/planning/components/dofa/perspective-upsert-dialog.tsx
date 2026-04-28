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
import { cn } from "@/lib/utils";
import { COLOR_PRESETS, ICON_OPTIONS } from "./perspective-icons";

// ---------------------------------------------------------------------------
// Draft type (mirrors CreateBscPerspectiveCommand + UpdateBscPerspectiveCommand)
// ---------------------------------------------------------------------------

export type PerspectiveUpsertDraft = {
  code: string;
  name: string;
  description: string;
  color: string;
  icon: string;
};

export const EMPTY_PERSPECTIVE_DRAFT: PerspectiveUpsertDraft = {
  code: "",
  name: "",
  description: "",
  color: COLOR_PRESETS[1],
  icon: "compass",
};

// ---------------------------------------------------------------------------
// Sub-pickers
// ---------------------------------------------------------------------------

function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {ICON_OPTIONS.map(({ key, Icon, label }) => (
        <button
          key={key}
          type="button"
          title={label}
          onClick={() => onChange(key)}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md border transition-colors",
            value === key
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {COLOR_PRESETS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-label={c}
          className={cn(
            "h-7 w-7 rounded-full border-2 transition-all",
            value.toLowerCase() === c.toLowerCase()
              ? "border-foreground scale-110"
              : "border-transparent hover:scale-105",
          )}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dialog
// ---------------------------------------------------------------------------

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  isStandard?: boolean;
  draft: PerspectiveUpsertDraft;
  onChange: (patch: Partial<PerspectiveUpsertDraft>) => void;
  onSave: () => void;
  isBusy: boolean;
};

export function PerspectiveUpsertDialog({
  open,
  onOpenChange,
  mode,
  isStandard = false,
  draft,
  onChange,
  onSave,
  isBusy,
}: Props) {
  const codeReadOnly = mode === "edit";
  const nameReadOnly = mode === "edit" && isStandard;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Nueva perspectiva BSC" : "Editar perspectiva BSC"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Code + Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Código{mode === "create" && <span className="text-destructive ml-0.5">*</span>}
              </Label>
              <Input
                value={draft.code}
                onChange={(e) => onChange({ code: e.target.value.toUpperCase() })}
                placeholder="FIN"
                maxLength={5}
                disabled={codeReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label>
                Nombre<span className="text-destructive ml-0.5">*</span>
              </Label>
              <Input
                value={draft.name}
                onChange={(e) => onChange({ name: e.target.value })}
                placeholder="Financiero"
                disabled={nameReadOnly}
              />
            </div>
          </div>

          {/* Icon selector */}
          <div className="space-y-2">
            <Label>Ícono</Label>
            <IconPicker value={draft.icon} onChange={(k) => onChange({ icon: k })} />
          </div>

          {/* Color selector */}
          <div className="space-y-2">
            <Label>Color</Label>
            <ColorPicker value={draft.color} onChange={(c) => onChange({ color: c })} />
          </div>

          {/* Description / help text */}
          <div className="space-y-2">
            <Label>Texto de ayuda</Label>
            <Textarea
              value={draft.description}
              onChange={(e) => onChange({ description: e.target.value })}
              rows={2}
              placeholder="Guía corta para el usuario sobre qué evaluar en esta perspectiva"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isBusy}>
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
