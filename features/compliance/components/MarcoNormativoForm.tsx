"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MarcoNormativoDto } from "../services/compliance.service";


interface MarcoForm {
  codigo: string;
  nombre: string;
  tipo: string;
  fechaVigencia: string;
  esObligatorio: boolean;
  version: string;
  descripcion: string;
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
    codigo: "",
    nombre: "",
    tipo: "",
    fechaVigencia: "",
    esObligatorio: true,
    version: "",
    descripcion: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        codigo: initialData.codigo,
        nombre: initialData.nombre,
        tipo: initialData.tipo,
        fechaVigencia: initialData.fechaVigencia.split("T")[0],
        esObligatorio: initialData.esObligatorio,
        version: initialData.version ?? "",
        descripcion: initialData.descripcion ?? "",
      });
    } else {
      setForm({
        codigo: "", nombre: "", tipo: "", fechaVigencia: "",
        esObligatorio: true, version: "", descripcion: "",
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
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
              placeholder="Ej: ISO-9001"
              disabled={!!initialData}
            />
          </div>
          <div className="grid gap-2">
            <Label>Nombre Completo *</Label>
            <Input
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Sistema de Gestión de Calidad"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Tipo *</Label>
              <Input
                required
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
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
              value={form.fechaVigencia}
              onChange={(e) => setForm({ ...form, fechaVigencia: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50/50">
            <Switch
              id="esObligatorio"
              checked={form.esObligatorio}
              onCheckedChange={(checked) => setForm({ ...form, esObligatorio: checked })}
            />
            <div className="grid gap-0.5">
              <Label htmlFor="esObligatorio" className="text-sm font-bold">Es de carácter obligatorio</Label>
              <p className="text-[11px] text-muted-foreground">Marcar si el cumplimiento es requerido legalmente.</p>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Descripción</Label>
            <Input
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
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