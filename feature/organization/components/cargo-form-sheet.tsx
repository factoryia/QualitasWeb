"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cargosApi } from "../api/cargos";
import type { CargoDto } from "../types";
import { cn } from "@/lib/utils";

type Mode = "create" | "edit";

interface CargoFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  cargo?: CargoDto | null;
  cargos: CargoDto[];
  onCompleted: () => void;
  /** Al crear, preselecciona este cargo como superior. */
  defaultParentPositionId?: string | null;
}

export function CargoFormSheet({
  open,
  onOpenChange,
  mode,
  cargo,
  cargos,
  onCompleted,
  defaultParentPositionId,
}: CargoFormSheetProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [hierarchyLevel, setHierarchyLevel] = useState<string>("");
  const [identificationColor, setIdentificationColor] = useState("");
  const [parentPositionId, setParentPositionId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode === "edit";
  const parentOptions = cargos.filter((c) => c.id !== cargo?.id);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (isEdit && cargo) {
      setName(cargo.name ?? "");
      setCode(cargo.code ?? "");
      setDescription(cargo.description ?? "");
      setHierarchyLevel(
        cargo.hierarchyLevel != null ? String(cargo.hierarchyLevel) : ""
      );
      setIdentificationColor(cargo.identificationColor ?? "");
      setParentPositionId(cargo.parentPositionId ?? "");
    } else {
      setName("");
      setCode("");
      setDescription("");
      setHierarchyLevel("");
      setIdentificationColor("");
      setParentPositionId(defaultParentPositionId ?? "");
    }
  }, [open, isEdit, cargo, defaultParentPositionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError("Nombre y código son obligatorios.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const level =
        hierarchyLevel.trim() === ""
          ? null
          : parseInt(hierarchyLevel, 10);
      const payload = {
        name: name.trim(),
        code: code.trim(),
        description: description.trim() || null,
        hierarchyLevel: Number.isFinite(level) ? level : null,
        identificationColor:
          identificationColor.trim() || null,
        parentPositionId: parentPositionId || null,
      };
      if (isEdit && cargo) {
        await cargosApi.update(cargo.id, payload);
      } else {
        await cargosApi.create(payload);
      }
      onCompleted();
      onOpenChange(false);
    } catch {
      setError("No se pudo guardar. Revisa los datos e intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const title = isEdit ? "Editar cargo" : "Nuevo cargo";
  const descriptionText = isEdit
    ? "Actualiza los datos del cargo."
    : "Registra un nuevo cargo.";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn("flex flex-col sm:max-w-md overflow-y-auto")}
      >
        <form
          onSubmit={handleSubmit}
          className="flex h-full flex-col gap-4 overflow-hidden"
        >
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{descriptionText}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-4">
            <div className="space-y-2">
              <Label htmlFor="cargo-name">Nombre *</Label>
              <Input
                id="cargo-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Gerente General"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo-code">Código *</Label>
              <Input
                id="cargo-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ej: GEN-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo-description">Descripción</Label>
              <textarea
                id="cargo-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                placeholder="Opcional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo-level">Nivel jerárquico</Label>
              <Input
                id="cargo-level"
                type="number"
                min={0}
                value={hierarchyLevel}
                onChange={(e) => setHierarchyLevel(e.target.value)}
                placeholder="Ej: 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo-color">Color (hex)</Label>
              <div className="flex gap-2">
                <input
                  id="cargo-color"
                  type="color"
                  value={
                    identificationColor && identificationColor.startsWith("#")
                      ? identificationColor
                      : "#6366f1"
                  }
                  onChange={(e) =>
                    setIdentificationColor(e.target.value)
                  }
                  className="h-9 w-14 cursor-pointer rounded border border-input"
                />
                <Input
                  value={identificationColor}
                  onChange={(e) =>
                    setIdentificationColor(e.target.value)
                  }
                  placeholder="#6366f1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo-parent">Cargo superior</Label>
              <select
                id="cargo-parent"
                value={parentPositionId}
                onChange={(e) => setParentPositionId(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring"
              >
                <option value="">Ninguno</option>
                {parentOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <SheetFooter className="flex-row gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
