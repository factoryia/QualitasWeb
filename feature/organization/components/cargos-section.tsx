"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cargosApi } from "../api/cargos";
import type { CargoDto } from "../types";
import { CargoFormSheet } from "./cargo-form-sheet";

export function CargosSection() {
  const { data: cargos = [], isLoading, refetch } = useQuery({
    queryKey: ["positions", "cargos"],
    queryFn: () => cargosApi.list(true),
  });

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedCargo, setSelectedCargo] = useState<CargoDto | null>(null);

  const handleNew = () => {
    setSelectedCargo(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const handleEdit = (cargo: CargoDto) => {
    setSelectedCargo(cargo);
    setFormMode("edit");
    setFormOpen(true);
  };

  const handleDelete = async (cargo: CargoDto) => {
    if (!window.confirm(`¿Eliminar el cargo "${cargo.name}"?`)) return;
    try {
      await cargosApi.delete(cargo.id);
      refetch();
    } catch {
      // toast or inline error
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-64 animate-pulse rounded-lg border border-border bg-muted/30" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Cargos de la organización.
        </p>
        <Button size="sm" onClick={handleNew} className="gap-2">
          <Plus className="size-4" />
          Nuevo cargo
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/60 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3 w-20">Color</th>
              <th className="px-4 py-3">Descripción</th>
              <th className="px-4 py-3">Nivel</th>
              <th className="px-4 py-3">Cargo superior</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargos.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  No hay cargos registrados.
                </td>
              </tr>
            ) : (
              cargos.map((cargo) => (
                <tr
                  key={cargo.id}
                  className="border-b border-border/60 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium">{cargo.name}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {cargo.code}
                  </td>
                  <td className="px-4 py-3">
                    {cargo.identificationColor?.trim() ? (
                      <div className="flex items-center gap-2">
                        <span
                          className="size-4 shrink-0 rounded-full border border-border"
                          style={{
                            backgroundColor: cargo.identificationColor.startsWith("#")
                              ? cargo.identificationColor
                              : `#${cargo.identificationColor}`,
                          }}
                          title={cargo.identificationColor}
                        />
                        <span className="max-w-16 truncate font-mono text-xs text-muted-foreground">
                          {cargo.identificationColor.startsWith("#")
                            ? cargo.identificationColor
                            : `#${cargo.identificationColor}`}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground">
                    {cargo.description ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {cargo.hierarchyLevel != null
                      ? cargo.hierarchyLevel
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {cargo.parentPositionName ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {cargo.isActive ? (
                      <span className="rounded bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-400">
                        Activo
                      </span>
                    ) : (
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => handleEdit(cargo)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(cargo)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CargoFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        cargo={selectedCargo}
        cargos={cargos}
        onCompleted={refetch}
      />
    </div>
  );
}
