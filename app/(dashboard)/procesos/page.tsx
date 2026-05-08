"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Settings, Loader2, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { ProcessValueChain } from "@/components/processes/ProcessValueChain";
import { ProcessCard } from "@/components/processes/ProcessCard";
import { ProcessFormDialog } from "@/components/processes/ProcessFormDialog";
import {
  useProcesses,
  useProcessTypes,
  useArchiveProcess,
  useSaveProcess,
  useApplyProcessTypePreset,
} from "@/feature/process/hooks/use-processes";
import { useAuthStore } from "@/feature/auth/store/auth.store";
import type { ProcessDto } from "@/feature/process/types";

export default function ProcesosPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === "Admin" || role === "admin" || role === "Administrator";

  const [showArchived, setShowArchived] = useState(false);
  const { data: types = [], isLoading: loadingTypes } = useProcessTypes(false);
  const { data: processes = [], isLoading: loadingProcesses } = useProcesses(showArchived);
  const archiveMut = useArchiveProcess();
  const saveProcess = useSaveProcess();
  const applyPreset = useApplyProcessTypePreset();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<ProcessDto | null>(null);
  const [defaultTypeId, setDefaultTypeId] = useState<string | undefined>();
  const [archiveTarget, setArchiveTarget] = useState<ProcessDto | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, ProcessDto[]>();
    types.forEach((t) => map.set(t.id, []));
    processes.forEach((p) => {
      const arr = map.get(p.processTypeId);
      if (arr) arr.push(p);
    });
    return map;
  }, [types, processes]);

  const typesWithProcesses = useMemo(
    () =>
      types
        .filter((t) => t.isActive !== false)
        .filter((t) => (grouped.get(t.id) ?? []).length > 0)
        .sort((a, b) => a.order - b.order),
    [types, grouped],
  );

  const loading = loadingTypes || loadingProcesses;

  const openProcess = (p: ProcessDto) => router.push(`/procesos/${p.id}`);
  const openCharacterization = (p: ProcessDto) =>
    router.push(`/procesos/caracterizacion/${p.id}`);

  const openCreateDialog = (typeId?: string) => {
    setEditingProcess(null);
    setDefaultTypeId(typeId);
    setDialogOpen(true);
  };

  const openEditDialog = (p: ProcessDto) => {
    setEditingProcess(p);
    setDefaultTypeId(undefined);
    setDialogOpen(true);
  };

  const handleArchiveConfirm = () => {
    if (!archiveTarget) return;
    archiveMut.mutate(
      { id: archiveTarget.id, archive: !!archiveTarget.isActive },
      {
        onSuccess: () => setArchiveTarget(null),
      },
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Empty state: no hay tipos configurados — sugerir aplicar preset
  if (types.length === 0) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center space-y-4 mt-20">
        <Settings className="h-12 w-12 mx-auto text-muted-foreground" />
        <h2 className="text-xl font-semibold">Inicializar Mapa de Procesos</h2>
        <p className="text-sm text-muted-foreground">
          Aplica un preset para empezar. Luego puedes ajustarlo en{" "}
          <strong>Configuración &gt; Tipos de Proceso</strong>.
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          <Button
            onClick={() => applyPreset.mutate({ preset: "mipg" })}
            disabled={applyPreset.isPending}
          >
            {applyPreset.isPending ? "Aplicando…" : "Aplicar MIPG (4)"}
          </Button>
          <Button
            variant="outline"
            onClick={() => applyPreset.mutate({ preset: "iso_9001" })}
            disabled={applyPreset.isPending}
          >
            ISO 9001 (3)
          </Button>
          {isAdmin && (
            <Button
              variant="ghost"
              onClick={() => router.push("/configuracion/tipos-proceso")}
            >
              Personalizar
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mapa de Procesos</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona los procesos de tu organización clasificados por tipo.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Switch
                id="show-archived"
                checked={showArchived}
                onCheckedChange={setShowArchived}
              />
              <Label
                htmlFor="show-archived"
                className="text-xs text-muted-foreground cursor-pointer"
              >
                Mostrar archivados
              </Label>
            </div>
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => router.push("/configuracion/tipos-proceso")}
              >
                <Network className="h-4 w-4 mr-1" /> Configurar tipos
              </Button>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => openCreateDialog()}>
                  <Plus className="h-4 w-4 mr-1" /> Nuevo Proceso
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Tip: usa los botones &quot;Agregar&quot; por sección para preseleccionar el tipo.
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <Tabs defaultValue="value-chain">
          <TabsList>
            <TabsTrigger value="value-chain">Mapa de Procesos</TabsTrigger>
            <TabsTrigger value="directory">Directorio y Fichas</TabsTrigger>
          </TabsList>

          <TabsContent value="value-chain" className="mt-4">
            <ProcessValueChain
              types={types}
              processes={processes}
              onSelect={openProcess}
              onEdit={openEditDialog}
              onEditCharacterization={openCharacterization}
              onArchive={(p) => setArchiveTarget(p)}
              onCreateInType={(typeId) => openCreateDialog(typeId)}
              canDelete={isAdmin}
              showEmptyCategories={false}
            />
          </TabsContent>

          <TabsContent value="directory" className="mt-4">
            <div className="space-y-8">
              {typesWithProcesses.length === 0 ? (
                <p className="text-sm text-muted-foreground rounded-xl border border-dashed p-8 text-center">
                  No hay procesos para listar. Crea uno con <strong>Nuevo Proceso</strong> o activa
                  &quot;Mostrar archivados&quot; si solo tienes procesos archivados.
                </p>
              ) : (
                typesWithProcesses.map((type) => {
                  const procs = grouped.get(type.id) ?? [];
                  return (
                    <section key={type.id}>
                      <div className="mb-4 flex items-center justify-between border-l-4 border-l-primary pl-4">
                        <div>
                          <h3 className="text-lg font-semibold">{type.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {procs.length} proceso{procs.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openCreateDialog(type.id)}
                        >
                          <Plus className="mr-1 h-3.5 w-3.5" /> Agregar
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {procs.map((p) => (
                          <ProcessCard
                            key={p.id}
                            process={p}
                            processType={type}
                            onClick={openProcess}
                            onEdit={openEditDialog}
                            onEditCharacterization={openCharacterization}
                            onArchive={(proc) => setArchiveTarget(proc)}
                            canDelete={isAdmin}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>

        <ProcessFormDialog
          open={dialogOpen}
          processTypes={types}
          defaultTypeId={defaultTypeId}
          process={editingProcess}
          onClose={() => setDialogOpen(false)}
          onSave={async (payload) => {
            await saveProcess.mutateAsync(payload);
          }}
        />

        <AlertDialog
          open={!!archiveTarget}
          onOpenChange={(o) => !o && setArchiveTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {archiveTarget?.isActive ? "¿Archivar este proceso?" : "¿Restaurar este proceso?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {archiveTarget?.isActive ? (
                  <>
                    Vas a archivar <strong>{archiveTarget?.name}</strong>. El proceso se ocultará
                    del mapa pero conservará sus actividades, indicadores y documentos. Podrás
                    restaurarlo activando &quot;Mostrar archivados&quot;.
                  </>
                ) : (
                  <>
                    Vas a restaurar <strong>{archiveTarget?.name}</strong>. Volverá a aparecer en
                    el mapa principal.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleArchiveConfirm}
                className={
                  archiveTarget?.isActive
                    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    : ""
                }
                disabled={archiveMut.isPending}
              >
                {archiveMut.isPending
                  ? "Procesando…"
                  : archiveTarget?.isActive
                    ? "Archivar"
                    : "Restaurar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
