"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SedeFormSheet } from "./sede-form-sheet";
import { sedesApi } from "../api/sedes";
import { organizationsApi } from "../api/organizations";
import type { SedeDto } from "../types";
import { cn } from "@/lib/utils";

const FILTER_ALL = "all";
const FILTER_CURRENT = "current";

interface SedesSectionProps {
  organizationId: string | null;
}

export function SedesSection({ organizationId }: SedesSectionProps) {
  const [filterChoice, setFilterChoice] = useState<string>(FILTER_CURRENT);

  const { data: organizations = [] } = useQuery({
    queryKey: ["organizations", "list"],
    queryFn: () => organizationsApi.list(),
  });

  const { data: allUnits = [], isLoading, refetch } = useQuery({
    queryKey: ["organization-units", "sedes"],
    queryFn: () => sedesApi.list(true),
  });

  const filterOrgId =
    filterChoice === FILTER_ALL
      ? FILTER_ALL
      : filterChoice === FILTER_CURRENT
        ? organizationId ?? FILTER_ALL
        : filterChoice;

  const sedes =
    filterOrgId === FILTER_ALL
      ? allUnits
      : allUnits.filter((u) => u.organizationId === filterOrgId);

  const orgForNewSede =
    filterOrgId !== FILTER_ALL ? filterOrgId : organizationId ?? organizations[0]?.id ?? null;

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedSede, setSelectedSede] = useState<SedeDto | null>(null);

  const handleNew = () => {
    setSelectedSede(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const handleEdit = (sede: SedeDto) => {
    setSelectedSede(sede);
    setFormMode("edit");
    setFormOpen(true);
  };

  const handleDelete = async (sede: SedeDto) => {
    if (!window.confirm(`¿Eliminar la sede "${sede.name}"?`)) return;
    try {
      await sedesApi.delete(sede.id);
      refetch();
    } catch {
      // toast or inline error
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-20 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="sedes-org-filter" className="text-sm text-muted-foreground">
            Sedes de:
          </label>
          <select
            id="sedes-org-filter"
            value={filterChoice}
            onChange={(e) => setFilterChoice(e.target.value)}
            className="h-9 min-w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
          >
            <option value={FILTER_CURRENT}>Organización actual</option>
            <option value={FILTER_ALL}>Todas las organizaciones</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name} ({org.code})
              </option>
            ))}
          </select>
        </div>
        <Button
          size="sm"
          onClick={handleNew}
          className="gap-2 shrink-0"
          disabled={!orgForNewSede}
        >
          <Plus className="size-4" />
          Nueva sede
        </Button>
      </div>

      {sedes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="mb-2 size-10 text-muted-foreground/60" />
            <p className="text-sm text-muted-foreground">
              {filterOrgId === FILTER_ALL
                ? "No hay sedes en ninguna organización."
                : "No hay sedes para esta organización."}
            </p>
            {orgForNewSede && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 gap-2"
                onClick={handleNew}
              >
                <Plus className="size-4" />
                Nueva sede
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sedes.map((sede) => (
            <Card
              key={sede.id}
              className={cn(
                "relative overflow-hidden",
                !sede.isActive && "opacity-70"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Building2 className="size-4 shrink-0 text-primary" />
                    <h3 className="truncate font-semibold text-sm">
                      {sede.name}
                    </h3>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => handleEdit(sede)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(sede)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                {sede.code && (
                  <p className="mt-1 text-xs font-mono text-muted-foreground">
                    {sede.code}
                  </p>
                )}
                {sede.description && (
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                    {sede.description}
                  </p>
                )}
                {sede.isPrincipal && (
                  <span className="mt-2 inline-block rounded bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                    Principal
                  </span>
                )}
                {!sede.isActive && (
                  <span className="mt-2 inline-block rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                    Inactiva
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {orgForNewSede && (
        <SedeFormSheet
          open={formOpen}
          onOpenChange={setFormOpen}
          mode={formMode}
          organizationId={orgForNewSede}
          sede={selectedSede}
          onCompleted={refetch}
        />
      )}
    </div>
  );
}
