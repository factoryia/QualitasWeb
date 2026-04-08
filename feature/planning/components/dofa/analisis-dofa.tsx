"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CreateDofaAnalysisCommand, DofaItemDto } from "@/feature/planning/api/dofa";
import {
  useDofaAnalysesQuery,
  useDofaAnalysisQuery,
  useDofaCreateAnalysisMutation,
  useDofaCreateItemMutation,
  useDofaDeactivateItemMutation,
} from "@/feature/planning/hooks/use-dofa";
import { useAuthStore } from "@/feature/auth/store/auth.store";
import { organizationsApi } from "@/feature/organization/api/organizations";
import { DOFA_CATEGORY_CARDS, DOFA_PERSPECTIVE_TABS } from "./dofa-constants";
import { improveText } from "./dofa-text";
import { DofaCreateAnalysisDialog } from "./dofa-create-analysis-dialog";
import { DofaPageHeader } from "./dofa-page-header";
import { DofaPerspectiveTabs } from "./dofa-perspective-tabs";

type AnalysisDraft = {
  title: string;
  period: string;
  description: string;
};

export function AnalisisDofa() {
  const analysesQuery = useDofaAnalysesQuery();
  const createAnalysisMutation = useDofaCreateAnalysisMutation();
  const createItemMutation = useDofaCreateItemMutation();
  const deactivateItemMutation = useDofaDeactivateItemMutation();

  const tenantCode = useAuthStore((s) => s.user?.tenant ?? "root");
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [isOrgLoading, setIsOrgLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsOrgLoading(true);
      try {
        const list = await organizationsApi.list();
        const matched = list.find((o) => o.code === tenantCode) ?? list[0] ?? null;
        if (cancelled) return;
        setOrganizationId(matched?.id ?? null);
        setOrganizationName(matched?.name ?? null);
      } catch {
        if (cancelled) return;
        setOrganizationId(null);
        setOrganizationName(null);
      } finally {
        if (!cancelled) setIsOrgLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [tenantCode]);

  const organizationAnalysisId = useMemo(() => {
    if (!organizationId) return "";
    const list = analysesQuery.data ?? [];
    const matches = list.filter(
      (a) => a.entityType === "Organization" && a.entityId === organizationId,
    );
    const sorted = [...matches].sort((a, b) => {
      const ad = a.analysisDate ? new Date(a.analysisDate).getTime() : 0;
      const bd = b.analysisDate ? new Date(b.analysisDate).getTime() : 0;
      return bd - ad;
    });
    return sorted[0]?.id ?? "";
  }, [analysesQuery.data, organizationId]);

  const analysisQuery = useDofaAnalysisQuery(organizationAnalysisId || undefined);

  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [analysisDraft, setAnalysisDraft] = useState<AnalysisDraft>({
    title: "",
    period: new Date().getFullYear().toString(),
    description: "",
  });

  const openCreateAnalysis = () => {
    const year = new Date().getFullYear();
    const baseTitle = organizationName
      ? `DOFA ${year} - ${organizationName}`
      : `DOFA ${year}`;
    setAnalysisDraft({
      title: baseTitle,
      period: year.toString(),
      description: "",
    });
    setAnalysisDialogOpen(true);
  };

  const submitCreateAnalysis = async (e: FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;
    const payload: CreateDofaAnalysisCommand = {
      title: analysisDraft.title.trim(),
      entityType: "Organization",
      entityId: organizationId,
      period: analysisDraft.period.trim() || null,
      description: analysisDraft.description.trim() || null,
    };

    if (!payload.title) return;
    const created = await createAnalysisMutation.mutateAsync(payload);
    if (created?.id) {
      setAnalysisDialogOpen(false);
    }
  };

  const isBusy = createAnalysisMutation.isPending;

  const activeItems = useMemo(() => {
    const items = analysisQuery.data?.items ?? [];
    return items.filter((i) => i.isActive);
  }, [analysisQuery.data]);

  const itemsByCell = useMemo(() => {
    const map = new Map<string, DofaItemDto[]>();
    for (const item of activeItems) {
      const key = `${item.perspective}__${item.category}`;
      const list = map.get(key);
      if (list) list.push(item);
      else map.set(key, [item]);
    }
    for (const [key, list] of map.entries()) {
      map.set(
        key,
        [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      );
    }
    return map;
  }, [activeItems]);

  const [draftByCell, setDraftByCell] = useState<Record<string, string>>({});

  const submitAddItem = async (params: {
    analysisId: string;
    perspective: string;
    category: string;
  }) => {
    const cellKey = `${params.perspective}__${params.category}`;
    const description = (draftByCell[cellKey] ?? "").trim();
    if (!description) return;

    const existing = itemsByCell.get(cellKey) ?? [];
    const maxOrder = existing.reduce((acc, it) => Math.max(acc, it.order ?? 0), 0);

    await createItemMutation.mutateAsync({
      analysisId: params.analysisId,
      payload: {
        perspective: params.perspective,
        category: params.category,
        description,
        priority: "Media",
        impactLevel: "Medio",
        order: maxOrder + 1,
        responsibleId: null,
      },
    });

    setDraftByCell((prev) => ({ ...prev, [cellKey]: "" }));
  };

  const busyItems = createItemMutation.isPending || deactivateItemMutation.isPending;

  return (
    <div className="space-y-6">
      <DofaPageHeader />

      <Card className="py-4 sm:py-6">
        <CardContent className="px-3 sm:px-6">
          <div className="mt-4 sm:mt-5">
            {isOrgLoading || analysesQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-[40%]" />
                <Skeleton className="h-[380px] w-full" />
              </div>
            ) : !organizationId ? (
              <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
                No se encontró una organización para el tenant actual.
              </div>
            ) : !organizationAnalysisId ? (
              <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
                No hay un análisis DOFA creado para la organización.
                <div className="mt-4">
                  <Button onClick={openCreateAnalysis} disabled={isBusy}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear análisis DOFA
                  </Button>
                </div>
              </div>
            ) : analysisQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-[40%]" />
                <Skeleton className="h-[380px] w-full" />
              </div>
            ) : !analysisQuery.data ? (
              <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
                No se pudo cargar el análisis DOFA de la organización.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-base sm:text-lg font-semibold text-foreground break-words">
                      {analysisQuery.data.title}
                    </div>
                    <div className="text-sm text-muted-foreground break-words">
                      {analysisQuery.data.description || "Sin descripción"}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {analysisQuery.data.period
                      ? `Periodo: ${analysisQuery.data.period}`
                      : ""}
                  </div>
                </div>

                <DofaPerspectiveTabs
                  analysisId={analysisQuery.data.id}
                  perspectiveTabs={DOFA_PERSPECTIVE_TABS}
                  categoryCards={DOFA_CATEGORY_CARDS}
                  itemsByCell={itemsByCell}
                  draftByCell={draftByCell}
                  onDraftChange={(cellKey, value) =>
                    setDraftByCell((prev) => ({ ...prev, [cellKey]: value }))
                  }
                  onAddItem={submitAddItem}
                  onImproveDraft={(cellKey) =>
                    setDraftByCell((prev) => ({
                      ...prev,
                      [cellKey]: improveText(prev[cellKey] ?? ""),
                    }))
                  }
                  onDeactivateItem={({ analysisId, itemId }) =>
                    deactivateItemMutation.mutateAsync({ analysisId, itemId })
                  }
                  busyItems={busyItems}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <DofaCreateAnalysisDialog
        open={analysisDialogOpen}
        onOpenChange={setAnalysisDialogOpen}
        draft={analysisDraft}
        onDraftChange={(patch) => setAnalysisDraft((d) => ({ ...d, ...patch }))}
        onSubmit={submitCreateAnalysis}
        isBusy={isBusy}
        canSubmit={!!organizationId && !!analysisDraft.title.trim() && !isBusy}
      />
    </div>
  );
}
