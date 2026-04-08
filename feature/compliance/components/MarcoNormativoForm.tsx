"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MarcoNormativoDto } from "../api/marcos-normativos";


interface MarcoForm {
  code: string;
  name: string;
  type: string;
  effectiveDate: string;
  isObligatory: boolean;
  version: string;
  description: string;
}

interface MarcoNormativoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MarcoForm) => Promise<void>;
  initialData: MarcoNormativoDto | null;
  saving: boolean;
}

export function MarcoNormativoForm({ open, onOpenChange, onSubmit, initialData, saving }: MarcoNormativoFormProps) {
  const [form, setForm] = useState<MarcoForm>({
    code: "",
    name: "",
    type: "",
    effectiveDate: "",
    isObligatory: true,
    version: "",
    description: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        code: initialData.code,
        name: initialData.name,
        type: initialData.type,
        effectiveDate: initialData.effectiveDate,
        isObligatory: initialData.isObligatory,
        version: initialData.version ?? "",
        description: initialData.description ?? "",
      });
    } else {
      setForm({
        code: "", name: "", type: "", effectiveDate: "",
        isObligatory: true, version: "", description: "",
      });
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {initialData ? "Editar marco normativo" : "Nuevo marco normativo"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label>Código del Marco *</Label>
            <Input
              required
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="Ej: ISO-9001"
              disabled={!!initialData}
            />
          </div>
          <div className="grid gap-2">
            <Label>Nombre Completo *</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Sistema de Gestión de Calidad"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Tipo *</Label>
              <Input
                required
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                placeholder="Ej: Norma ISO"
              />
            </div>
            <div className="grid gap-2">
              <Label>Versión</Label>
              <Input
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                placeholder="2015"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Fecha de Vigencia *</Label>
            <Input
              required
              type="date"
              value={form.effectiveDate}
              onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50/50">
            <Switch
              id="isObligatory"
              checked={form.isObligatory}
              onCheckedChange={(checked) => setForm({ ...form, isObligatory: checked })}
            />
            <div className="grid gap-0.5">
              <Label htmlFor="isObligatory" className="text-sm font-bold">Es de carácter obligatorio</Label>
              <p className="text-[11px] text-muted-foreground">Marcar si el cumplimiento es requerido legalmente.</p>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Descripción</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Breve descripción..."
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? "Guardando..." : "Guardar Marco"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}