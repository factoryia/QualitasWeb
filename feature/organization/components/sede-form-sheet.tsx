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
import { sedesApi } from "../api/sedes";
import type { SedeDto } from "../types";
import { cn } from "@/lib/utils";

type Mode = "create" | "edit";

interface SedeFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  organizationId: string;
  sede?: SedeDto | null;
  onCompleted: () => void;
}

export function SedeFormSheet({
  open,
  onOpenChange,
  mode,
  organizationId,
  sede,
  onCompleted,
}: SedeFormSheetProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [isPrincipal, setIsPrincipal] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (isEdit && sede) {
      setName(sede.name ?? "");
      setCode(sede.code ?? "");
      setDescription(sede.description ?? "");
      setAddress(sede.address ?? "");
      setCity(sede.city ?? "");
      setIsPrincipal(sede.isPrincipal ?? false);
      setIsActive(sede.isActive ?? true);
    } else {
      setName("");
      setCode("");
      setDescription("");
      setAddress("");
      setCity("");
      setIsPrincipal(false);
      setIsActive(true);
    }
  }, [open, isEdit, sede]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError("Nombre y código son obligatorios.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      if (isEdit && sede) {
        await sedesApi.update(sede.id, {
          name: name.trim(),
          code: code.trim(),
          description: description.trim() || null,
          address: address.trim() || null,
          city: city.trim() || null,
          isPrincipal,
          isActive,
        });
      } else {
        await sedesApi.create({
          organizationId,
          name: name.trim(),
          code: code.trim(),
          description: description.trim() || null,
          address: address.trim() || null,
          city: city.trim() || null,
          isPrincipal,
        });
      }
      onCompleted();
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo guardar. Revisa los datos e intenta de nuevo.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const title = isEdit ? "Editar sede" : "Nueva sede";
  const descriptionText = isEdit
    ? "Actualiza los datos de la sede."
    : "Registra una nueva sede de la organización.";

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
              <Label htmlFor="sede-name">Nombre *</Label>
              <Input
                id="sede-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Sede Principal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sede-code">Código *</Label>
              <Input
                id="sede-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ej: SED-001"
              />
              <p className="text-xs text-muted-foreground">
                Debe ser único en esta organización.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sede-description">Descripción</Label>
              <textarea
                id="sede-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                placeholder="Opcional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sede-address">Dirección</Label>
              <Input
                id="sede-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Opcional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sede-city">Ciudad</Label>
              <Input
                id="sede-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Opcional"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sede-principal">Sede principal</Label>
              <input
                id="sede-principal"
                type="checkbox"
                checked={isPrincipal}
                onChange={(e) => setIsPrincipal(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
            </div>
            {isEdit && (
              <div className="flex items-center justify-between">
                <Label htmlFor="sede-active">Activa</Label>
                <input
                  id="sede-active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
              </div>
            )}
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
