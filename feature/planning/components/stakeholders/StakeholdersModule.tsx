"use client";

import { useMemo, useState } from "react";
import { Grid3x3, Info, List, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StakeholderDto } from "@/feature/planning/api/stakeholders";
import type { StakeholderTypeDto } from "@/feature/planning/api/stakeholder-types";
import {
  useStakeholderCreateMutation,
  useStakeholderDeleteMutation,
  useStakeholderUpdateMutation,
  useStakeholdersQuery,
} from "@/feature/planning/hooks/use-stakeholders-query";
import {
  useStakeholderTypeCreateMutation,
  useStakeholderTypeDeleteMutation,
  useStakeholderTypeUpdateMutation,
  useStakeholderTypesQuery,
} from "@/feature/planning/hooks/use-stakeholder-types-query";
import { StakeholdersTable } from "./StakeholdersTable";
import { StakeholdersMatrix } from "./StakeholdersMatrix";
import { StakeholderUpsertDialog } from "./StakeholderUpsertDialog";
import { StakeholderTypeUpsertDialog } from "./StakeholderTypeUpsertDialog";
import { INFLUENCE_LEVELS, STAKEHOLDER_STATUSES } from "./stakeholders.constants";
import { classificationPillClass } from "./stakeholders.ui";

type ViewMode = "list" | "matrix";

export function StakeholdersModule() {
  const [tab, setTab] = useState<string>("stakeholders");
  const [view, setView] = useState<ViewMode>("list");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [influenceFilter, setInfluenceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [stakeholderDialogOpen, setStakeholderDialogOpen] = useState(false);
  const [stakeholderDialogMode, setStakeholderDialogMode] =
    useState<"create" | "edit">("create");
  const [editingStakeholder, setEditingStakeholder] =
    useState<StakeholderDto | null>(null);
  const [deletingStakeholder, setDeletingStakeholder] =
    useState<StakeholderDto | null>(null);

  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [typeDialogMode, setTypeDialogMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingType, setEditingType] = useState<StakeholderTypeDto | null>(null);
  const [deletingType, setDeletingType] = useState<StakeholderTypeDto | null>(null);

  const { data: stakeholderTypes = [], isLoading: loadingTypes } =
    useStakeholderTypesQuery();
  const { data: stakeholders = [], isLoading: loadingStakeholders } =
    useStakeholdersQuery();

  const createStakeholder = useStakeholderCreateMutation();
  const updateStakeholder = useStakeholderUpdateMutation();
  const deleteStakeholder = useStakeholderDeleteMutation();

  const createType = useStakeholderTypeCreateMutation();
  const updateType = useStakeholderTypeUpdateMutation();
  const deleteType = useStakeholderTypeDeleteMutation();

  const sortedTypes = useMemo(() => {
    return [...stakeholderTypes].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [stakeholderTypes]);

  const filteredStakeholders = useMemo(() => {
    let result = stakeholders;
    if (typeFilter !== "all") {
      result = result.filter((s) => s.stakeholderTypeId === typeFilter);
    }
    if (influenceFilter !== "all") {
      result = result.filter((s) => s.influenceLevel === influenceFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter);
    }
    return result;
  }, [stakeholders, typeFilter, influenceFilter, statusFilter]);

  const openCreateStakeholder = () => {
    setStakeholderDialogMode("create");
    setEditingStakeholder(null);
    setStakeholderDialogOpen(true);
  };

  const openEditStakeholder = (s: StakeholderDto) => {
    setStakeholderDialogMode("edit");
    setEditingStakeholder(s);
    setStakeholderDialogOpen(true);
  };

  const openCreateType = () => {
    setTypeDialogMode("create");
    setEditingType(null);
    setTypeDialogOpen(true);
  };

  const openEditType = (t: StakeholderTypeDto) => {
    setTypeDialogMode("edit");
    setEditingType(t);
    setTypeDialogOpen(true);
  };

  const stakeholdersBusy =
    loadingStakeholders ||
    createStakeholder.isPending ||
    updateStakeholder.isPending ||
    deleteStakeholder.isPending;

  const typesBusy =
    loadingTypes ||
    createType.isPending ||
    updateType.isPending ||
    deleteType.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4">
        <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          ISO 9001:2015 — Cláusula 4.2: Identifique las partes interesadas
          pertinentes al SGC, sus necesidades y expectativas, y cómo se les da
          cumplimiento y seguimiento.
        </p>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">Partes Interesadas</h1>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList>
          <TabsTrigger value="stakeholders">Partes Interesadas</TabsTrigger>
          <TabsTrigger value="types">Tipos de Parte Interesada</TabsTrigger>
        </TabsList>

        <TabsContent value="stakeholders">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center justify-center gap-1 border rounded-md p-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  className={`h-8 px-3 text-xs gap-1.5 ${view === "list" ? "bg-accent text-accent-foreground" : ""}`}
                  onClick={() => setView("list")}
                >
                  <List className="h-3.5 w-3.5" /> Lista
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className={`h-8 px-3 text-xs gap-1.5 ${view === "matrix" ? "bg-accent text-accent-foreground" : ""}`}
                  onClick={() => setView("matrix")}
                >
                  <Grid3x3 className="h-3.5 w-3.5" /> Matriz
                </Button>
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {sortedTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={influenceFilter} onValueChange={setInfluenceFilter}>
                <SelectTrigger className="w-[150px] h-9">
                  <SelectValue placeholder="Toda influencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toda influencia</SelectItem>
                  {INFLUENCE_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {STAKEHOLDER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="ml-auto">
                <Button onClick={openCreateStakeholder} disabled={typesBusy}>
                  <Plus className="h-4 w-4 mr-2" /> Agregar Parte Interesada
                </Button>
              </div>
            </div>

            {view === "list" ? (
              <StakeholdersTable
                stakeholders={filteredStakeholders}
                onEdit={openEditStakeholder}
                onDelete={setDeletingStakeholder}
              />
            ) : (
              <StakeholdersMatrix stakeholders={filteredStakeholders} />
            )}

            {(loadingStakeholders || loadingTypes) && (
              <div className="text-sm text-muted-foreground">Cargando...</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="types">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={openCreateType}>
                <Plus className="h-4 w-4 mr-2" /> Agregar Tipo
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="w-[130px]">Clasificación</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-[80px] text-center">Orden</TableHead>
                    <TableHead className="w-[100px] text-right">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTypes.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.code}</TableCell>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={classificationPillClass(t.classification)}
                        >
                          {t.classification}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {t.description || "—"}
                      </TableCell>
                      <TableCell className="text-center">{t.order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEditType(t)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => setDeletingType(t)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sortedTypes.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-sm text-muted-foreground"
                      >
                        Sin tipos
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {loadingTypes && (
              <div className="text-sm text-muted-foreground">Cargando...</div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <StakeholderUpsertDialog
        open={stakeholderDialogOpen}
        onOpenChange={setStakeholderDialogOpen}
        mode={stakeholderDialogMode}
        stakeholder={editingStakeholder}
        types={sortedTypes}
        saving={stakeholdersBusy}
        onCreate={async (payload) => {
          const created = await createStakeholder.mutateAsync(payload);
          if (created) setStakeholderDialogOpen(false);
        }}
        onUpdate={async (id, payload) => {
          const updated = await updateStakeholder.mutateAsync({ id, payload });
          if (updated) setStakeholderDialogOpen(false);
        }}
      />

      <StakeholderTypeUpsertDialog
        open={typeDialogOpen}
        onOpenChange={setTypeDialogOpen}
        mode={typeDialogMode}
        type={editingType}
        saving={typesBusy}
        onCreate={async (payload) => {
          const created = await createType.mutateAsync(payload);
          if (created) setTypeDialogOpen(false);
        }}
        onUpdate={async (id, payload) => {
          const updated = await updateType.mutateAsync({ id, payload });
          if (updated) setTypeDialogOpen(false);
        }}
      />

      <AlertDialog
        open={!!deletingStakeholder}
        onOpenChange={(open) => {
          if (!open) setDeletingStakeholder(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Parte Interesada</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactiva la parte interesada. ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingStakeholder(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={stakeholdersBusy}
              onClick={async () => {
                if (!deletingStakeholder) return;
                const ok = await deleteStakeholder.mutateAsync(
                  deletingStakeholder.id,
                );
                if (ok) setDeletingStakeholder(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deletingType}
        onOpenChange={(open) => {
          if (!open) setDeletingType(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Tipo</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactiva el tipo. ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingType(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={typesBusy}
              onClick={async () => {
                if (!deletingType) return;
                const ok = await deleteType.mutateAsync(deletingType.id);
                if (ok) setDeletingType(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

