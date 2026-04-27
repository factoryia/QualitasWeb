"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
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
import toast from "react-hot-toast";
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
import { DofaSidebar } from "./dofa-sidebar";
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
   * Build perspective list from BSC backend data (key = UUID), falling back to
   * hardcoded tabs (key = perspective string) when catalog is unavailable.
   */
  const perspectives = useMemo<PerspectiveTab[]>(() => {
    if (bscPerspectives.length > 0) {
      return [...bscPerspectives]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((p) => ({
          key: p.id,
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
      const perspKey = item.bscPerspectiveId ?? item.perspective;
      if (!perspKey) continue;
      if (!map[perspKey]) {
        map[perspKey] = { Fortaleza: [], Debilidad: [], Oportunidad: [], Amenaza: [] };
      }
      const cat = item.category as DofaCategory;
      if (map[perspKey][cat]) map[perspKey][cat].push(item);
    }
    return map;
  }, [perspectives, allItems]);

  const countFor = (key: string) =>
    QUADRANTS.reduce((acc, q) => acc + (grouped[key]?.[q.category]?.length ?? 0), 0);

  const handleAdd = async (perspKey: string, category: DofaCategory, text: string) => {
    // When catalog is loaded, perspKey is already the UUID (perspective.key = p.id).
    // In the hardcoded fallback, bscPerspectives is empty so find returns undefined → guard fires.
    const bscPerspectiveId = bscPerspectives.length > 0
      ? perspKey
      : bscPerspectives.find((p) => p.name === perspKey)?.id;
    if (!bscPerspectiveId) {
      toast.error("No se pudo determinar la perspectiva BSC. Recarga e intenta de nuevo.");
      return;
    }
    const existing = grouped[perspKey]?.[category] ?? [];
    const maxOrder = existing.reduce((acc, it) => Math.max(acc, it.order ?? 0), 0);
    await createItemMutation.mutateAsync({
      analysisId,
      payload: {
        bscPerspectiveId,
        category,
        description: text,
        order: maxOrder + 1,
        responsibleId: null,
      },
    });
  };

  const handleUpdate = async (item: DofaItemDto, text: string) => {
    const bscPerspectiveId =
      item.bscPerspectiveId ??
      bscPerspectives.find((p) => p.name === item.perspective)?.id;
    if (!bscPerspectiveId) {
      toast.error("No se encontró la perspectiva BSC. Recarga e intenta de nuevo.");
      return;
    }
    await updateItemMutation.mutateAsync({
      analysisId,
      itemId: item.id,
      payload: {
        bscPerspectiveId,
        category: item.category,
        description: text,
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
        <DofaSidebar
          perspectives={perspectives}
          activePerspective={activePerspective}
          view={view}
          countFor={countFor}
          readOnly={readOnly}
          onSelectPerspective={(key) => { setActivePerspective(key); setView("perspective"); }}
          onViewMatrix={() => setView("matrix")}
          onOpenManager={() => setManagerOpen(true)}
        />
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
