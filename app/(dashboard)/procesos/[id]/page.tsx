"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  FileEdit,
  Archive,
  ArchiveRestore,
  MoreHorizontal,
  Loader2,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ProcessFormDialog } from "@/components/processes/ProcessFormDialog";
import { ProcessTypeIcon } from "@/components/processes/ProcessTypeIcon";
import { ProcessStatusBadge } from "@/components/processes/ProcessStatusBadge";
import {
  ProcessOverviewTab,
  ProcessActivitiesTab,
  ProcessIndicatorsTab,
} from "@/components/processes/ProcessWorkspaceTabs";
import { ProcessDocumentsTab } from "@/components/processes/ProcessDocumentsTab";
import { ProcessRisksTab } from "@/components/processes/ProcessRisksTab";
import { ProcessChangesTab } from "@/components/processes/ProcessChangesTab";
import { ProcessImprovementTab } from "@/components/processes/ProcessImprovementTab";
import { ProcessFutureSectionCard } from "@/components/processes/ProcessFutureSectionCard";
import {
  useProcess,
  useProcessTypes,
  useSaveProcess,
  useArchiveProcess,
} from "@/feature/process/hooks/use-processes";
import { getTypeStyles } from "@/feature/process/process-type-presets";
import { useAuthStore } from "@/feature/auth/store/auth.store";

export default function ProcessWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === "Admin" || role === "admin" || role === "Administrator";

  const { data: process, isLoading } = useProcess(id);
  const { data: types = [] } = useProcessTypes(true);
  const saveProcess = useSaveProcess();
  const archiveProcess = useArchiveProcess();

  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!process) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-sm text-muted-foreground">Proceso no encontrado.</p>
        <Button variant="outline" onClick={() => router.push("/procesos")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Volver al mapa
        </Button>
      </div>
    );
  }

  const type = types.find((t) => t.id === process.processTypeId);
  const styles = getTypeStyles(type?.color);

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" onClick={() => router.push("/procesos")} className="mb-2">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Volver al mapa
        </Button>

        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`rounded-lg p-3 shrink-0 ${styles.iconBg}`}>
              <ProcessTypeIcon name={type?.icon} className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-mono text-xs text-muted-foreground">{process.code}</span>
                {type && (
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles.iconBg}`}
                  >
                    {type.name}
                  </span>
                )}
                {process.processStatusName && (
                  <ProcessStatusBadge fallbackLabel={process.processStatusName} />
                )}
                {!process.isActive && (
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    Archivado
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{process.name}</h1>
              {process.owner && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  Responsable: {process.owner}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onSelect={() => router.push(`/procesos/caracterizacion/${process.id}`)}><FileEdit className="h-4 w-4 mr-1" /> Editar caracterización</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                  <Pencil className="mr-2 h-3.5 w-3.5" /> Editar datos básicos
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => setArchiveOpen(true)}
                      className={process.isActive ? "text-destructive focus:text-destructive" : ""}
                    >
                      {process.isActive ? (
                        <>
                          <Archive className="mr-2 h-3.5 w-3.5" /> Archivar proceso
                        </>
                      ) : (
                        <>
                          <ArchiveRestore className="mr-2 h-3.5 w-3.5" /> Restaurar proceso
                        </>
                      )}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <div className="-mx-1 border-b overflow-x-auto">
          <TabsList className="h-auto w-max min-w-full justify-start gap-0 rounded-none bg-transparent p-0 sm:min-w-0">
            <TabsTrigger
              value="overview"
              className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:px-4"
            >
              Resumen
            </TabsTrigger>
            <TabsTrigger
              value="activities"
              className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:px-4"
            >
              Actividades
            </TabsTrigger>
            <TabsTrigger
              value="indicators"
              className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:px-4"
            >
              Indicadores
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:px-4"
            >
              Documentación
            </TabsTrigger>
            <TabsTrigger
              value="improvement"
              className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:px-4"
            >
              Mejora continua
            </TabsTrigger>
            <TabsTrigger
              value="risks"
              className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:px-4"
            >
              Riesgos y oportunidades
            </TabsTrigger>
            <TabsTrigger
              value="changes"
              className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:px-4"
            >
              Gestión del cambio
            </TabsTrigger>
            <TabsTrigger
              value="audit"
              className="rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:px-4"
            >
              Auditoría interna
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6">
          <ProcessOverviewTab process={process} />
        </TabsContent>

        <TabsContent value="activities" className="mt-6">
          <ProcessActivitiesTab processId={process.id} />
        </TabsContent>

        <TabsContent value="indicators" className="mt-6">
          <ProcessIndicatorsTab processId={process.id} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <ProcessDocumentsTab processId={process.id} />
        </TabsContent>

        <TabsContent value="improvement" className="mt-6">
          <ProcessImprovementTab process={process} />
        </TabsContent>

        <TabsContent value="risks" className="mt-6">
          <ProcessRisksTab
            processId={process.id}
            processName={process.name}
            processTypeName={type?.name ?? ""}
            processTypeCode={type?.code}
          />
        </TabsContent>

        <TabsContent value="changes" className="mt-6">
          <ProcessChangesTab processId={process.id} processName={process.name} />
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <ProcessFutureSectionCard
            icon={ClipboardCheck}
            accent="slate"
            title="Auditoría interna"
            description="Auditorías, hallazgos y planes de acción vinculados al proceso."
          />
        </TabsContent>
      </Tabs>

      <ProcessFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        process={process}
        processTypes={types.filter((t) => t.isActive)}
        onSave={async (payload) => {
          await saveProcess.mutateAsync(payload);
        }}
      />

      <AlertDialog
        open={archiveOpen}
        onOpenChange={(o) => !o && !archiveProcess.isPending && setArchiveOpen(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {process.isActive ? "¿Archivar este proceso?" : "¿Restaurar este proceso?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {process.isActive
                ? `Vas a archivar ${process.name}. Conservará sus actividades e indicadores.`
                : `Vas a restaurar ${process.name}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiveProcess.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                archiveProcess.mutate(
                  { id: process.id, archive: !!process.isActive },
                  {
                    onSuccess: () => {
                      setArchiveOpen(false);
                      if (process.isActive) router.push("/procesos");
                    },
                  },
                )
              }
              disabled={archiveProcess.isPending}
              className={
                process.isActive
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {archiveProcess.isPending
                ? "Procesando…"
                : process.isActive
                  ? "Archivar"
                  : "Restaurar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
