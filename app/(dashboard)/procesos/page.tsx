"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, LayoutGrid, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  processesApi,
} from "@/feature/process/api/processes";
import { processActivitiesApi } from "@/feature/process/api/process-activities";
import {
  type ProcessDto,
  PROCESS_TYPE_LABELS,
} from "@/feature/process/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PROCESS_TYPE_ORDER: (keyof typeof PROCESS_TYPE_LABELS)[] = [
  "Estrategico",
  "Misional",
  "Apoyo",
  "Evaluacion",
];

const SECTION_STYLES: Record<
  keyof typeof PROCESS_TYPE_LABELS,
  { border: string; bg: string; title: string }
> = {
  Estrategico: {
    border: "border-violet-300",
    bg: "bg-white dark:bg-card",
    title: "PROCESOS ESTRATÉGICOS",
  },
  Misional: {
    border: "border-blue-300",
    bg: "bg-blue-50/80 dark:bg-blue-950/20",
    title: "PROCESOS MISIONALES",
  },
  Apoyo: {
    border: "border-amber-300",
    bg: "bg-amber-50/80 dark:bg-amber-950/20",
    title: "PROCESOS DE APOYO",
  },
  Evaluacion: {
    border: "border-emerald-300",
    bg: "bg-emerald-50/80 dark:bg-emerald-950/20",
    title: "PROCESOS DE EVALUACIÓN",
  },
};

type TabKey = "mapa" | "directorio";

function groupByProcessType(processes: ProcessDto[]): Map<string, ProcessDto[]> {
  const map = new Map<string, ProcessDto[]>();
  for (const p of processes) {
    const key = p.processType in PROCESS_TYPE_LABELS ? p.processType : "Otros";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  for (const key of PROCESS_TYPE_ORDER) {
    const list = map.get(key);
    if (list) list.sort((a, b) => a.code.localeCompare(b.code));
  }
  return map;
}

export default function ProcesosPage() {
  const [tab, setTab] = useState<TabKey>("mapa");
  const [processes, setProcesses] = useState<ProcessDto[]>([]);
  const [activityCountByProcessId, setActivityCountByProcessId] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await processesApi.list(false);
      setProcesses(list);

      const counts: Record<string, number> = {};
      await Promise.all(
        list.map(async (p) => {
          const activities = await processActivitiesApi.listByProcess(p.id, false);
          counts[p.id] = activities.length;
        })
      );
      setActivityCountByProcessId(counts);
    } catch {
      setError("No se pudieron cargar los procesos.");
      setProcesses([]);
      setActivityCountByProcessId({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const grouped = groupByProcessType(processes);

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">
          Mapa de Procesos
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestiona los procesos de tu organización clasificados por tipo.
        </p>
      </header>

      <div className="flex items-center justify-between gap-4">
        <nav className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => setTab("mapa")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === "mapa"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="size-4" />
            Mapa de Procesos
          </button>
          <button
            type="button"
            onClick={() => setTab("directorio")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === "directorio"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderOpen className="size-4" />
            Directorio y Fichas
          </button>
        </nav>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button size="sm" className="gap-2" disabled>
                  <Plus className="size-4" />
                  Nuevo Proceso
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Próximamente. El backend aún no expone creación de procesos.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {error && (
        <div className="rounded-md border border-dashed border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {tab === "mapa" && (
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            PROCESS_TYPE_ORDER.map((typeKey) => {
              const list = grouped.get(typeKey) ?? [];
              const style = SECTION_STYLES[typeKey];
              const label = PROCESS_TYPE_LABELS[typeKey];

              return (
                <Card
                  key={typeKey}
                  className={`overflow-hidden ${style.border} ${style.bg}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-sm font-bold uppercase tracking-wide text-foreground/90">
                        {style.title}
                      </h2>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {list.length} proceso{list.length !== 1 ? "s" : ""}
                        </span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs"
                                  disabled
                                >
                                  Agregar
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Próximamente.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-3">
                      {list.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No hay procesos de tipo {label}.
                        </p>
                      ) : (
                        list.map((p) => (
                          <Card
                            key={p.id}
                            className="min-w-[200px] shrink-0 border bg-background/80 shadow-sm"
                          >
                            <CardContent className="p-4">
                              <div className="font-mono text-xs text-muted-foreground">
                                {p.code}
                              </div>
                              <div className="mt-1 font-medium">{p.name}</div>
                              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                <span>Activo</span>
                                <span>
                                  {activityCountByProcessId[p.id] ?? 0} proc.
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {tab === "directorio" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Directorio y Fichas</CardTitle>
            <p className="text-sm text-muted-foreground">
              Listado de todos los procesos para consulta y fichas.
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : processes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay procesos cargados.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {processes.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <span className="font-mono text-sm text-muted-foreground">
                        {p.code}
                      </span>
                      <span className="ml-2 font-medium">{p.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {PROCESS_TYPE_LABELS[p.processType as keyof typeof PROCESS_TYPE_LABELS] ?? p.processType} · Activo{" "}
                      {activityCountByProcessId[p.id] ?? 0} proc.
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
