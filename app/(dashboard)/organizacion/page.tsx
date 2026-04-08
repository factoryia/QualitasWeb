"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FileText,
  MapPin,
  Network,
  Briefcase,
  Pencil,
  ImageIcon,
  Mail,
  Phone,
  Globe,
  MapPinned,
} from "lucide-react";
import { useAuthStore } from "@/feature/auth/store/auth.store";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OrgEditSheet } from "@/feature/organization/components/org-edit-sheet";
import { SedesSection } from "@/feature/organization/components/sedes-section";
import { CargosSection } from "@/feature/organization/components/cargos-section";
import { OrgStructureSection } from "@/feature/organization/components/org-structure-section";
import { sedesApi } from "@/feature/organization/api/sedes";

type OrgTab = "informacion" | "sedes" | "estructura" | "cargos";

type OrganizationDto = {
  id: string;
  code: string;
  name: string;
  nit?: string | null;
  sector?: string | null;
  description?: string | null;
};

type OrganizationDetails = {
  id: string;
  name: string;
  code?: string | null;
  nit?: string | null;
  sector?: string | null;
  entityType?: string | null;
  slogan?: string | null;
  description?: string | null;
  legalRepresentative?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  logoUrl?: string | null;
};

const TABS: { key: OrgTab; label: string; icon: React.ReactNode }[] = [
  { key: "informacion", label: "Información", icon: <FileText className="size-4" /> },
  { key: "sedes", label: "Sedes", icon: <MapPin className="size-4" /> },
  { key: "estructura", label: "Estructura", icon: <Network className="size-4" /> },
  { key: "cargos", label: "Cargos", icon: <Briefcase className="size-4" /> },
];

export default function OrganizacionPage() {
  const [activeTab, setActiveTab] = useState<OrgTab>("informacion");
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organization, setOrganization] = useState<OrganizationDetails | null>(
    null,
  );
  const [hasPrincipalSede, setHasPrincipalSede] = useState<boolean | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);

  const user = useAuthStore((s) => s.user);

  const loadOrganization = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: list } = await api.get<OrganizationDto[]>(
        "/api/v1/qualitas/foundation/organizations",
      );

      if (!Array.isArray(list) || list.length === 0) {
        setOrganization(null);
        setOrganizationId(null);
        setHasPrincipalSede(null);
        setError("No hay organizaciones configuradas para el tenant actual.");
        return;
      }

      const tenantCode = user?.tenant ?? "root";
      const matched =
        list.find((o) => o.code === tenantCode) ?? list[0] ?? null;

      if (!matched) {
        setOrganization(null);
        setOrganizationId(null);
        setHasPrincipalSede(null);
        setError("No se encontró una organización para el tenant actual.");
        return;
      }

      const { data: orgResponse } = await api.get<any>(
        `/api/v1/qualitas/foundation/organizations/${matched.id}`,
      );

      const mapped: OrganizationDetails = {
        id: orgResponse.id,
        name: orgResponse.name ?? matched.name,
        code: orgResponse.code ?? matched.code,
        nit: orgResponse.nit ?? null,
        sector: orgResponse.sector ?? null,
        entityType: orgResponse.entityType ?? null,
        slogan: orgResponse.slogan ?? null,
        description: orgResponse.description ?? null,
        legalRepresentative:
          orgResponse.legal_representative ?? orgResponse.legalRepresentative,
        email: orgResponse.email ?? null,
        phone: orgResponse.phone ?? null,
        website: orgResponse.website ?? null,
        logoUrl: orgResponse.logoUrl ?? null,
      };

      let principal: boolean | null = null;
      try {
        const units = await sedesApi.list(true);
        principal = units.some(
          (u) => u.organizationId === matched.id && u.isPrincipal === true
        );
      } catch {
        principal = null;
      }

      setOrganizationId(matched.id);
      setOrganization(mapped);
      setHasPrincipalSede(principal);
    } catch {
      setOrganization(null);
      setOrganizationId(null);
      setHasPrincipalSede(null);
      setError("No se pudo cargar la información de la organización.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.tenant]);

  useEffect(() => {
    loadOrganization();
  }, [loadOrganization]);

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">
          Organización
        </h1>
        <p className="text-sm text-muted-foreground">
          Identidad institucional, sedes, estructura y cargos.
        </p>
      </header>

      {/* Tabs */}
      <nav className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>

      {/* Contenido por tab */}
      <div className="rounded-lg border border-border bg-card/80 shadow-sm">
        {activeTab === "informacion" && (
          <div className="p-6">
            <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Identidad Institucional
                </h2>
                <p className="text-sm text-muted-foreground">
                  Información general de la entidad para reportes y encabezados.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-2"
                onClick={() => setEditSheetOpen(true)}
                disabled={!organization}
              >
                <Pencil className="size-4" />
                Editar Información
              </Button>
            </div>

            {isLoading && (
              <div className="space-y-4">
                <div className="grid gap-6 lg:grid-cols-5">
                  <div className="flex flex-col gap-6 lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Skeleton className="size-4 rounded-full" />
                          <Skeleton className="h-4 w-32" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-40 w-full rounded-lg" />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          <Skeleton className="h-4 w-32" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-20 w-full rounded-lg" />
                        <Skeleton className="mt-3 h-3 w-48" />
                      </CardContent>
                    </Card>
                  </div>
                  <div className="flex flex-col gap-6 lg:col-span-3">
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          <Skeleton className="h-4 w-40" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[1, 2, 3, 4, 5].map((key) => (
                          <div key={key} className="space-y-1">
                            <Skeleton className="h-3 w-28" />
                            <Skeleton className="h-4 w-64" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          <Skeleton className="h-4 w-52" />
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[1, 2, 3].map((key) => (
                          <div key={key} className="space-y-1">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-4 w-64" />
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && !error && !organization && (
              <div className="mt-4 rounded-md border border-dashed border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                No se encontró información de organización para mostrar.
              </div>
            )}

            {!isLoading && error && (
              <div className="mt-4 rounded-md border border-dashed border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {!isLoading && !error && organization && (
              <div className="grid gap-6 lg:grid-cols-5">
                {/* Columna izquierda: Logo + Vista Previa PDF */}
                <div className="flex flex-col gap-6 lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="size-4" />
                        Escudo / Logo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {organization.logoUrl?.trim() ? (
                        <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-border bg-muted/20 p-4">
                          <img
                            src={organization.logoUrl}
                            alt="Logo de la entidad"
                            className="max-h-40 max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex min-h-[180px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-4 text-center">
                          <ImageIcon className="mb-2 size-10 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            No hay logo cargado
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Si no puedes subir imagen, ingresa la URL del logo en Editar información. Recomendado: PNG 500×500px
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Vista Previa PDF</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-lg border border-border bg-muted/20 p-4">
                        <div className="flex items-center gap-2">
                          <FileText className="size-5 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {organization.name}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {organization.slogan ?? "Slogan no registrado"}
                        </p>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Así aparecerá en los encabezados de documentos PDF
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Columna derecha: Datos Principales, Contacto, Ubicación */}
                <div className="flex flex-col gap-6 lg:col-span-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="size-4" />
                        Datos Principales
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <DataRow label="Nombre de la Entidad" value={organization.name} />
                      <DataRow label="Código" value={organization.code ?? undefined} />
                      <DataRow label="NIT / Identificación" value={organization.nit ?? undefined} />
                      <DataRow label="Sector" value={organization.sector ?? undefined} />
                      <DataRow label="Slogan / Lema" value={organization.slogan ?? undefined} />
                      <DataRow
                        label="Descripción / Misión Breve"
                        value={organization.description ?? undefined}
                      />
                      <DataRow
                        label="Representante Legal"
                        value={organization.legalRepresentative ?? undefined}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="size-4" />
                        Información de Contacto
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <DataRow label="Correo Electrónico" value={organization.email ?? undefined} />
                      <DataRow label="Teléfono PBX" value={organization.phone ?? undefined} />
                      <DataRow
                        label="Sitio Web Oficial"
                        value={organization.website ?? undefined}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPinned className="size-4" />
                        Ubicación Principal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {hasPrincipalSede ? (
                        <p className="text-sm text-muted-foreground">
                          Hay una sede principal registrada en la organización.
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No hay sede principal registrada.{" "}
                          <button type="button" className="text-primary underline hover:no-underline">
                            Información
                          </button>
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "sedes" && (
          <SedesSection organizationId={organizationId} />
        )}

        {activeTab === "estructura" && <OrgStructureSection />}

        {activeTab === "cargos" && <CargosSection />}
      </div>

      {organizationId && (
        <OrgEditSheet
          open={editSheetOpen}
          onOpenChange={setEditSheetOpen}
          organizationId={organizationId}
          organization={organization}
          onSaved={loadOrganization}
        />
      )}
    </section>
  );
}

function DataRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  const display =
    typeof value === "string" && value.trim().length > 0
      ? value
      : "Sin registrar";
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm">{display}</p>
    </div>
  );
}
