"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, LayoutGrid, Loader2, Settings2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { DofaItemDto } from "@/feature/planning/api/dofa";
import {
  useBscPerspectivesQuery,
  useDofaAnalysisQuery,
  useDofaCreateItemMutation,
  useDofaDeactivateItemMutation,
  useDofaUpdateItemMutation,
} from "@/feature/planning/hooks/use-dofa";
import { DOFA_PERSPECTIVE_TABS } from "./dofa-constants";
import { DofaPerspectivePanel } from "./dofa-perspective-panel";
import { MatrixMobileCards } from "./dofa-matrix-mobile";
import { MatrixTable } from "./dofa-matrix-table";
import { PerspectiveManager } from "./perspective-manager";
import type { DofaCategory, GroupedItems, PerspectiveTab } from "./dofa-types";
import { QUADRANTS } from "./dofa-types";

// ---------------------------------------------------------------------------
// DofaDiagnostico
// ---------------------------------------------------------------------------

type Props = {
  analysisId: string;
  readOnly?: boolean;
};

export function DofaDiagnostico({ analysisId, readOnly = false }: Props) {
  const analysisQuery = useDofaAnalysisQuery(analysisId);
  const { data: bscPerspectives = [] } = useBscPerspectivesQuery();
  const createItemMutation = useDofaCreateItemMutation();
  const updateItemMutation = useDofaUpdateItemMutation();
  const deactivateItemMutation = useDofaDeactivateItemMutation();

  const [activePerspective, setActivePerspective] = useState<string | null>(null);
  const [view, setView] = useState<"perspective" | "matrix">("perspective");
  const [confirmDelete, setConfirmDelete] = useState<DofaItemDto | null>(null);
  const [managerOpen, setManagerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /**
   * Build perspective list from BSC backend data, falling back to hardcoded tabs.
   * NOTE: items still store perspective as a free string (tech debt — see README).
   */
  const perspectives = useMemo<PerspectiveTab[]>(() => {
    if (bscPerspectives.length > 0) {
      return [...bscPerspectives]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((p) => ({
          key: p.name,
          label: p.name,
          description: p.description ?? `Perspectiva BSC: ${p.name}`,
        }));
    }
    return DOFA_PERSPECTIVE_TABS.map((t) => ({
      key: t.perspective,
      label: t.label,
      description: t.helper,
    }));
  }, [bscPerspectives]);

  useEffect(() => {
    if (!activePerspective && perspectives.length > 0) setActivePerspective(perspectives[0].key);
  }, [perspectives, activePerspective]);

  const allItems = useMemo(
    () => (analysisQuery.data?.items ?? []).filter((i) => i.isActive),
    [analysisQuery.data],
  );

  const grouped = useMemo<GroupedItems>(() => {
    const map: GroupedItems = {};
    for (const p of perspectives) {
      map[p.key] = { Fortaleza: [], Debilidad: [], Oportunidad: [], Amenaza: [] };
    }
    for (const item of allItems) {
      if (!map[item.perspective]) {
        map[item.perspective] = { Fortaleza: [], Debilidad: [], Oportunidad: [], Amenaza: [] };
      }
      const cat = item.category as DofaCategory;
      if (map[item.perspective][cat]) map[item.perspective][cat].push(item);
    }
    return map;
  }, [perspectives, allItems]);

  const countFor = (key: string) =>
    QUADRANTS.reduce((acc, q) => acc + (grouped[key]?.[q.category]?.length ?? 0), 0);

  const handleAdd = async (perspKey: string, category: DofaCategory, text: string) => {
    const existing = grouped[perspKey]?.[category] ?? [];
    const maxOrder = existing.reduce((acc, it) => Math.max(acc, it.order ?? 0), 0);
    await createItemMutation.mutateAsync({
      analysisId,
      payload: {
        perspective: perspKey,
        category,
        description: text,
        priority: "Media",
        impactLevel: "Medio",
        order: maxOrder + 1,
        responsibleId: null,
      },
    });
  };

  const handleUpdate = async (item: DofaItemDto, text: string) => {
    await updateItemMutation.mutateAsync({
      analysisId,
      itemId: item.id,
      payload: {
        perspective: item.perspective,
        category: item.category,
        description: text,
        priority: item.priority ?? "Media",
        impactLevel: item.impactLevel ?? "Medio",
        order: item.order ?? 0,
        responsibleId: item.responsibleId ?? null,
        isActive: true,
      },
    });
  };

  const handleDelete = async (item: DofaItemDto) => {
    await deactivateItemMutation.mutateAsync({ analysisId, itemId: item.id });
  };

  if (analysisQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Cargando diagnóstico...
      </div>
    );
  }

  if (perspectives.length === 0) {
    return (
      <div className="p-12 text-center">
        <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          Este análisis aún no tiene perspectivas configuradas.
        </p>
      </div>
    );
  }

  const activeP = perspectives.find((p) => p.key === activePerspective);

  return (
    <div className="flex flex-col md:flex-row gap-4 p-3 sm:p-4">
      {/* ── Left sidebar: perspectives list ── */}
      {view !== "matrix" && (
        <aside className="w-full md:w-[240px] md:shrink-0 md:self-start border rounded-lg bg-card flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between gap-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Perspectivas BSC
            </h3>
            {!readOnly && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => setManagerOpen(true)}
                title="Gestionar perspectivas"
              >
                <Settings2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-auto p-2 space-y-1 max-h-[40vh] md:max-h-none">
            {perspectives.map((p) => {
              const count = countFor(p.key);
              const isActive = view === "perspective" && p.key === activePerspective;
              const badgeClass =
                count === 0
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                  : count >= 4
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-muted text-muted-foreground";
              return (
                <button
                  key={p.key}
                  onClick={() => { setActivePerspective(p.key); setView("perspective"); }}
                  type="button"
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors border-l-[3px]",
                    isActive
                      ? "bg-primary/10 border-l-primary text-foreground font-medium"
                      : "border-l-transparent hover:bg-muted/60 text-foreground",
                  )}
                >
                  <span className="flex-1 truncate">{p.label}</span>
                  <span className={cn("inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums shrink-0", badgeClass)}>
                    {count === 0 && <AlertTriangle className="h-2.5 w-2.5" />}
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-2 border-t">
            <Button variant="outline" size="sm" className="w-full" onClick={() => setView("matrix")}>
              <LayoutGrid className="h-4 w-4 mr-1.5" />
              Ver Matriz
            </Button>
          </div>
        </aside>
      )}

      {/* ── Main panel ── */}
      <main className="flex-1 min-w-0 overflow-auto">
        {view === "perspective" && activeP ? (
          <DofaPerspectivePanel
            perspective={activeP}
            grouped={grouped}
            readOnly={readOnly}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={(item) => setConfirmDelete(item)}
          />
        ) : (
          <div className="p-4 sm:p-6">
            <header className="mb-4 flex items-start gap-3">
              <Button variant="ghost" size="sm" onClick={() => setView("perspective")} className="-ml-2 shrink-0">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Volver
              </Button>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-foreground">Matriz DOFA Consolidada</h2>
                <p className="text-sm text-muted-foreground">
                  Vista cruzada de todas las perspectivas y tipos de factores
                  <span className="ml-2 text-xs font-medium tabular-nums">· {allItems.length} factores</span>
                </p>
              </div>
            </header>
            {isMobile ? (
              <MatrixMobileCards
                perspectives={perspectives}
                grouped={grouped}
                onAdd={handleAdd}
                onUpdate={handleUpdate}
                onDelete={(item) => setConfirmDelete(item)}
                readOnly={readOnly}
              />
            ) : (
              <MatrixTable
                perspectives={perspectives}
                grouped={grouped}
                onAdd={handleAdd}
                onUpdate={handleUpdate}
                onDelete={(item) => setConfirmDelete(item)}
                readOnly={readOnly}
              />
            )}
          </div>
        )}
      </main>

      {/* Delete confirmation */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => { if (!o) setConfirmDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar factor</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro de eliminar este factor del diagnóstico? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => { if (confirmDelete) { await handleDelete(confirmDelete); setConfirmDelete(null); } }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Perspective manager */}
      <Dialog open={managerOpen} onOpenChange={setManagerOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Gestionar perspectivas BSC</DialogTitle>
          </DialogHeader>
          <PerspectiveManager />
        </DialogContent>
      </Dialog>
    </div>
  );
}
