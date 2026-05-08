"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ProcessTypeIcon } from "./ProcessTypeIcon";
import {
  PROCESS_TYPE_COLORS,
  PROCESS_TYPE_ICON_OPTIONS,
  getTypeStyles,
} from "@/feature/process/process-type-presets";
import { cn } from "@/lib/utils";
import type { ProcessTypeDto } from "@/feature/process/types";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: ProcessTypeDto | null;
  defaultOrder?: number;
  onSave: (values: {
    id?: string;
    code: string;
    name: string;
    order: number;
    description: string | null;
    color: string | null;
    icon: string | null;
    layoutHint: string | null;
    isActive?: boolean;
  }) => Promise<void>;
}

const LAYOUT_OPTIONS: { value: string; label: string }[] = [
  { value: "full_width", label: "Ancho completo" },
  { value: "half_width", label: "Mitad" },
  { value: "third_width", label: "Tercio" },
];

type FormValues = {
  code: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  layoutHint: string;
  order: number;
  isActive: boolean;
};

const EMPTY: FormValues = {
  code: "",
  name: "",
  description: "",
  color: "purple",
  icon: "Target",
  layoutHint: "full_width",
  order: 0,
  isActive: true,
};

export function ProcessTypeFormDialog({
  open,
  onOpenChange,
  initial,
  defaultOrder = 0,
  onSave,
}: Props) {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  useEffect(() => {
    if (open) {
      if (initial) {
        setValues({
          code: initial.code,
          name: initial.name,
          description: initial.description ?? "",
          color: initial.color ?? "purple",
          icon: initial.icon ?? "Target",
          layoutHint: initial.layoutHint ?? "full_width",
          order: initial.order ?? 0,
          isActive: initial.isActive,
        });
      } else {
        setValues({ ...EMPTY, order: defaultOrder });
      }
      setErrors({});
    }
  }, [open, initial, defaultOrder]);

  function set<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof FormValues, string>> = {};
    if (!values.code.trim()) errs.code = "Código requerido";
    else if (values.code.length > 50) errs.code = "Máximo 50 caracteres";
    if (!values.name.trim()) errs.name = "Nombre requerido";
    else if (values.name.length > 256) errs.name = "Máximo 256 caracteres";
    if (values.order < 0) errs.order = "El orden debe ser ≥ 0";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        id: initial?.id,
        code: values.code.trim().toUpperCase(),
        name: values.name.trim(),
        order: values.order,
        description: values.description.trim() || null,
        color: values.color,
        icon: values.icon,
        layoutHint: values.layoutHint,
        isActive: initial ? values.isActive : undefined,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  const styles = getTypeStyles(values.color);
  const isEdit = !!initial;

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar tipo de proceso" : "Nuevo tipo de proceso"}</DialogTitle>
          <DialogDescription>
            Configura el código, nombre, color, ícono y layout del tipo. El orden controla la
            posición en el mapa.
          </DialogDescription>
        </DialogHeader>

        <form id="ptf-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Preview */}
          <div className={`rounded-lg border ${styles.border} ${styles.bg} p-3 flex items-center gap-3`}>
            <div className={`rounded-md p-2 ${styles.iconBg}`}>
              <ProcessTypeIcon name={values.icon} className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-bold uppercase tracking-wider ${styles.text}`}>
                {values.code || "—"}
              </p>
              <p className="text-sm font-semibold">{values.name || "Vista previa"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ptf-code">
                Código <span className="text-destructive">*</span>
              </Label>
              <Input
                id="ptf-code"
                placeholder="EST"
                value={values.code}
                onChange={(e) => set("code", e.target.value.toUpperCase())}
                maxLength={10}
              />
              {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ptf-order">Orden</Label>
              <Input
                id="ptf-order"
                type="number"
                min={0}
                value={values.order}
                onChange={(e) => set("order", Number(e.target.value) || 0)}
              />
              {errors.order && <p className="text-xs text-destructive">{errors.order}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ptf-name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ptf-name"
              placeholder="Estratégico"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              maxLength={256}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ptf-desc">Descripción</Label>
            <Textarea
              id="ptf-desc"
              rows={2}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PROCESS_TYPE_COLORS.map((c) => {
                const s = getTypeStyles(c);
                const active = values.color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set("color", c)}
                    className={cn(
                      "h-8 w-8 rounded-md border-2 transition-all",
                      s.bar,
                      active ? "ring-2 ring-offset-2 ring-primary scale-110" : "border-transparent"
                    )}
                    aria-label={c}
                    title={c}
                  />
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ícono</Label>
            <div className="grid grid-cols-9 gap-1.5 max-h-32 overflow-y-auto">
              {PROCESS_TYPE_ICON_OPTIONS.map((iconName) => {
                const active = values.icon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => set("icon", iconName)}
                    title={iconName}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-md border transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-transparent hover:border-border hover:bg-accent"
                    )}
                  >
                    <ProcessTypeIcon name={iconName} className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ptf-layout">Layout en el mapa</Label>
            <Select value={values.layoutHint} onValueChange={(v) => set("layoutHint", v)}>
              <SelectTrigger id="ptf-layout">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LAYOUT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isEdit && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Activo</Label>
                <p className="text-xs text-muted-foreground">
                  Los tipos inactivos no aparecen en el mapa de procesos.
                </p>
              </div>
              <input
                type="checkbox"
                checked={values.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
                className="h-4 w-4"
              />
            </div>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button type="submit" form="ptf-form" disabled={saving}>
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear tipo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
