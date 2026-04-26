"use client";

import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { DofaItemDto } from "@/feature/planning/api/dofa";
import {
  useDofaAnalysisQuery,
  useDofaCreateItemMutation,
  useDofaDeactivateItemMutation,
} from "@/feature/planning/hooks/use-dofa";
import { DOFA_CATEGORY_CARDS, DOFA_PERSPECTIVE_TABS } from "./dofa-constants";
import { improveText } from "./dofa-text";
import { DofaPerspectiveTabs } from "./dofa-perspective-tabs";

type Props = {
  analysisId: string;
};

export function DofaDiagnostico({ analysisId }: Props) {
  const analysisQuery = useDofaAnalysisQuery(analysisId);
  const createItemMutation = useDofaCreateItemMutation();
  const deactivateItemMutation = useDofaDeactivateItemMutation();

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

  if (analysisQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-[40%]" />
        <Skeleton className="h-[380px] w-full" />
      </div>
    );
  }

  if (!analysisQuery.data) {
    return (
      <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
        No se pudo cargar el análisis DOFA.
      </div>
    );
  }

  return (
    <DofaPerspectiveTabs
      analysisId={analysisId}
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
      onDeactivateItem={({ analysisId: aid, itemId }) =>
        deactivateItemMutation.mutateAsync({ analysisId: aid, itemId })
      }
      busyItems={busyItems}
    />
  );
}
