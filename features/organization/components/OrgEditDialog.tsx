"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { organizationService } from "../services/organization.service";
import toast from "react-hot-toast";

export interface OrgFormData {
  name: string;
  code: string;
  nit: string | null;
  entity_type: string | null;
  sector: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  legal_representative: string | null;
  slogan: string | null;
  description: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  initialData: OrgFormData;
  onSaved: () => void;
}

export function OrgEditDialog({ open, onOpenChange, orgId, initialData, onSaved }: Props) {
  const [form, setForm] = useState<OrgFormData>(initialData);
  const [saving, setSaving] = useState(false);

  const set = (key: keyof OrgFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value || null }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("El nombre es obligatorio"); return; }
    if (!form.code.trim()) { toast.error("El código es obligatorio"); return; }
    setSaving(true);
    const success = await organizationService.updateOrganization(orgId, form);
    setSaving(false);
    if (success) {
      onOpenChange(false);
      onSaved();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Información Institucional</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Razón Social *</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Código *</Label>
              <Input value={form.code || ""} onChange={(e) => set("code", e.target.value)} placeholder="Ej: ORG-001" />
            </div>
            <div className="space-y-2">
              <Label>NIT / Identificación</Label>
              <Input value={form.nit || ""} onChange={(e) => set("nit", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Entidad</Label>
              <Input value={form.entity_type || ""} onChange={(e) => set("entity_type", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Sector Económico</Label>
              <Input value={form.sector || ""} onChange={(e) => set("sector", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Slogan / Lema</Label>
            <Input value={form.slogan || ""} onChange={(e) => set("slogan", e.target.value)} placeholder="Ej: Innovación al servicio de la comunidad" />
          </div>
          <div className="space-y-2">
            <Label>Descripción / Misión Breve</Label>
            <Textarea value={form.description || ""} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Breve descripción de la misión institucional..." />
          </div>
          <div className="space-y-2">
            <Label>Representante Legal</Label>
            <Input value={form.legal_representative || ""} onChange={(e) => set("legal_representative", e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Correo Electrónico</Label>
              <Input value={form.email || ""} onChange={(e) => set("email", e.target.value)} type="email" />
            </div>
            <div className="space-y-2">
              <Label>Teléfono PBX</Label>
              <Input value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Sitio Web Oficial</Label>
            <Input value={form.website || ""} onChange={(e) => set("website", e.target.value)} placeholder="https://..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
