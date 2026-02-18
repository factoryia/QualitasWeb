"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Globe, Mail, Phone, MapPin, User, Building2, FileText, MessageSquareQuote } from "lucide-react";
import { organizationService, type Organization } from "../services/organization.service";
import { OrgEditDialog, type OrgFormData } from "./OrgEditDialog";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

interface Props { orgId: string; }

export function OrgEntityInfo({ orgId }: Props) {
  const [org, setOrg] = useState<Organization | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const orgData = await organizationService.getOrganization(orgId);
    if (orgData) setOrg(orgData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [orgId]);

  if (loading) {
    return (
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-[280px_1fr]">
          <Card>
            <CardContent className="pt-5">
              <div className="space-y-3">
                <Skeleton className="h-4 w-28" />
                <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-muted p-6">
                  <Skeleton className="h-28 w-28 rounded-full" />
                  <Skeleton className="mt-3 h-3 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="space-y-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-4 w-full max-w-xs" />
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-4 w-40" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  if (!org) return <div className="py-10 text-center text-muted-foreground">Error al cargar organizaci?n</div>;

  const Field = ({ label, value, icon: Icon }: { label: string; value: string | null | undefined; icon?: React.ElementType }) => (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
        {(value ?? null) || <span className="text-muted-foreground italic">Sin registrar</span>}
      </dd>
    </div>
  );

  const orgFormData: OrgFormData = {
    name: org.name,
    code: org.code || "",
    nit: org.nit || null,
    entity_type: org.entity_type || null,
    sector: org.sector || null,
    website: org.website || null,
    email: org.email || null,
    phone: org.phone || null,
    legal_representative: org.legal_representative || null,
    slogan: org.slogan || null,
    description: org.description || null,
  };

  return (
    <div className="space-y-4 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Identidad Institucional</h2>
          <p className="text-sm text-muted-foreground">Informaci?n general de la entidad para reportes y encabezados.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
          <Pencil className="h-3.5 w-3.5 mr-1" /> Editar Informaci?n
        </Button>
      </div>

      {/* Main 2-column layout */}
      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        {/* Left column: Logo + PDF Preview */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-5">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Escudo / Logo</h3>
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 p-6">
                  {org.logo_url ? (
                    <img
                      src={org.logo_url}
                      alt="Logo de la entidad"
                      className="h-28 w-28 rounded-full object-cover border-2 border-muted"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-muted">
                      <Building2 className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-3">Logo institucional</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Data cards */}
        <div className="space-y-4">
          {/* Datos Principales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Datos Principales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <Field label="Nombre de la Entidad" value={org.name} />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="NIT / Identificaci?n" value={org.nit} />
                  <Field label="Sector" value={org.sector} />
                </div>
                <Field label="Slogan / Lema" value={org.slogan} icon={MessageSquareQuote} />
                <Field label="Descripci?n / Misi?n Breve" value={org.description} icon={FileText} />
                <Field label="Representante Legal" value={org.legal_representative} icon={User} />
              </dl>
            </CardContent>
          </Card>

          {/* Informaci?n de Contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Informaci?n de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Correo Electr?nico" value={org.email} icon={Mail} />
                  <Field label="Tel?fono PBX" value={org.phone} icon={Phone} />
                </div>
                <Field label="Sitio Web Oficial" value={org.website} icon={Globe} />
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <OrgEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        orgId={orgId}
        initialData={orgFormData}
        onSaved={fetchData}
      />
    </div>
  );
}
