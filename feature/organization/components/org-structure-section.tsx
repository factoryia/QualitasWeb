"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Network,
  Plus,
  Loader2,
  ChevronsDownUp,
  ChevronsUpDown,
  AlertTriangle,
} from "lucide-react";
import { cargosApi } from "../api/cargos";
import type { CargoDto } from "../types";
import { CargoChartNode } from "./cargo-chart-node";
import { CargoDetailDrawer } from "./cargo-detail-drawer";
import { CargoFormSheet } from "./cargo-form-sheet";

export function OrgStructureSection() {
  const { data: cargos = [], isLoading, refetch } = useQuery({
    queryKey: ["positions", "cargos"],
    queryFn: () => cargosApi.list(true),
  });

  const [selectedCargo, setSelectedCargo] = useState<CargoDto | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingCargo, setEditingCargo] = useState<CargoDto | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [allExpanded, setAllExpanded] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CargoDto | null>(null);

  const displayCargos = showInactive
    ? cargos
    : cargos.filter((c) => c.isActive !== false);
  // Raíces: sin padre o cuyo padre no está en la lista (ej. padre inactivo cuando se ocultan inactivos)
  const rootCargos = displayCargos.filter(
    (c) =>
      !c.parentPositionId ||
      !displayCargos.some((p) => p.id === c.parentPositionId)
  );

  const openAddRoot = () => {
    setEditingCargo(null);
    setDefaultParentId(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const openAddChild = (parentId: string | null) => {
    setEditingCargo(null);
    setDefaultParentId(parentId);
    setFormMode("create");
    setFormOpen(true);
  };

  const openEdit = (cargo: CargoDto) => {
    setEditingCargo(cargo);
    setDefaultParentId(null);
    setFormMode("edit");
    setFormOpen(true);
  };

  const confirmDelete = (cargo: CargoDto) => {
    setDeleteTarget(cargo);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await cargosApi.delete(deleteTarget.id);
      refetch();
      setDeleteTarget(null);
    } catch {
      setDeleteTarget(null);
    }
  };

  const handleFormCompleted = () => {
    refetch();
    setFormOpen(false);
  };

  return (
    <div className="space-y-6 p-6 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">Estructura de cargos</h3>
          <p className="text-xs text-muted-foreground">
            Organigrama jerárquico de posiciones (tabla Positions del back).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAllExpanded(!allExpanded)}
          >
            {allExpanded ? (
              <ChevronsDownUp className="mr-1 size-4" />
            ) : (
              <ChevronsUpDown className="mr-1 size-4" />
            )}
            {allExpanded ? "Colapsar" : "Expandir"}
          </Button>
          <div className="flex items-center gap-2">
            <Switch
              id="show-inactive-structure"
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <Label
              htmlFor="show-inactive-structure"
              className="text-xs text-muted-foreground"
            >
              Inactivos
            </Label>
          </div>
          <Button size="sm" onClick={openAddRoot} className="gap-2">
            <Plus className="size-4" />
            Agregar cargo raíz
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Loader2 className="mb-2 size-8 animate-spin opacity-40" />
            <p>Cargando estructura...</p>
          </CardContent>
        </Card>
      ) : displayCargos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Network className="mb-2 size-8 opacity-40" />
            <p>No hay cargos. Crea uno desde Cargos o agrega un cargo raíz aquí.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={openAddRoot}
            >
              <Plus className="mr-1 size-4" />
              Agregar cargo raíz
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto pb-8">
          <div className="flex min-w-max justify-center gap-8 px-4">
            {rootCargos.map((cargo) => (
              <CargoChartNode
                key={cargo.id}
                cargo={cargo}
                allCargos={displayCargos}
                isRoot
                allExpanded={allExpanded}
                onSelect={setSelectedCargo}
                onAddChild={openAddChild}
                onEdit={openEdit}
                onDelete={confirmDelete}
              />
            ))}
          </div>
        </div>
      )}

      <CargoDetailDrawer
        cargo={selectedCargo}
        onClose={() => setSelectedCargo(null)}
      />

      <CargoFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        cargo={formMode === "edit" ? editingCargo : null}
        cargos={cargos}
        onCompleted={handleFormCompleted}
        defaultParentPositionId={defaultParentId}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Eliminar cargo
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar el cargo &quot;{deleteTarget?.name}&quot;? Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
