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
import { organizationsApi, type UpdateOrganizationPayload } from "../api/organizations";
import { cn } from "@/lib/utils";

export type OrganizationDetails = {
  id: string;
  name: string;
  code?: string | null;
  nit?: string | null;
  sector?: string | null;
  entityType?: string | null;
  slogan?: string | null;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  legalRepId?: string | null;
};

interface OrgEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  organization: OrganizationDetails | null;
  onSaved: () => void;
}

export function OrgEditSheet({
  open,
  onOpenChange,
  organizationId,
  organization,
  onSaved,
}: OrgEditSheetProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [nit, setNit] = useState("");
  const [sector, setSector] = useState("");
  const [entityType, setEntityType] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [slogan, setSlogan] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !organization) return;
    setName(organization.name ?? "");
    setCode(organization.code ?? "");
    setNit(organization.nit ?? "");
    setSector(organization.sector ?? "");
    setEntityType(organization.entityType ?? "");
    setDescription(organization.description ?? "");
    setWebsite(organization.website ?? "");
    setEmail(organization.email ?? "");
    setPhone(organization.phone ?? "");
    setLogoUrl(organization.logoUrl ?? "");
    setSlogan(organization.slogan ?? "");
    setSaveError(null);
  }, [open, organization]);

  const handleSave = async () => {
    if (!name.trim()) {
      setSaveError("El nombre es obligatorio.");
      return;
    }
    if (!code.trim()) {
      setSaveError("El código es obligatorio.");
      return;
    }
    setSaveError(null);
    setSaving(true);
    try {
      const payload: UpdateOrganizationPayload = {
        name: name.trim(),
        code: code.trim(),
        nit: nit.trim() || "",
        sector: sector.trim() || "",
        entityType: entityType.trim() || "",
        description: description.trim() || null,
        website: website.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        logoUrl: logoUrl.trim() || null,
        slogan: slogan.trim() || null,
        legalRepId: null,
      };
      await organizationsApi.update(organizationId, payload);
      onSaved();
      onOpenChange(false);
    } catch {
      setSaveError("No se pudo guardar. Revisa los datos e intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn("flex flex-col sm:max-w-md overflow-y-auto")}
      >
        <SheetHeader>
          <SheetTitle>Editar Información Institucional</SheetTitle>
          <SheetDescription>
            Modifica los datos de la entidad. El logo se configura con la URL de la imagen (recomendado PNG 500×500px).
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 px-4 overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="org-name">Nombre de la Entidad *</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Razón social"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="org-code">Código *</Label>
              <Input
                id="org-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ej: EPC"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-nit">NIT / Identificación</Label>
              <Input
                id="org-nit"
                value={nit}
                onChange={(e) => setNit(e.target.value)}
                placeholder="900.222.346-0"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-entity-type">Tipo de Entidad</Label>
            <Input
              id="org-entity-type"
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              placeholder="Ej: E.S.P."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-sector">Sector</Label>
            <Input
              id="org-sector"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              placeholder="Ej: Servicios Públicos"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-slogan">Slogan / Lema</Label>
            <Input
              id="org-slogan"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="Ej: ¡REGIÓN Que Progresa!"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-description">Descripción / Misión Breve</Label>
            <textarea
              id="org-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 placeholder:text-muted-foreground"
              placeholder="Breve descripción de la misión..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-logo">URL del Logo</Label>
            <Input
              id="org-logo"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://... (recomendado PNG 500×500px)"
            />
            <p className="text-xs text-muted-foreground">
              Si no puedes subir imagen, ingresa aquí la URL del logo.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-email">Correo Electrónico</Label>
            <Input
              id="org-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contacto@entidad.gov.co"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-phone">Teléfono PBX</Label>
            <Input
              id="org-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="7954480"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-website">Sitio Web Oficial</Label>
            <Input
              id="org-website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://www.entidad.gov.co"
            />
          </div>
          {saveError && (
            <p className="text-sm text-destructive">{saveError}</p>
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
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
