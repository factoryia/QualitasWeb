"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useDofaAnalysisQuery,
  useStrategyDofaItemsQuery,
  useLinkDofaItemToStrategyMutation,
  useUnlinkDofaItemFromStrategyMutation,
} from "@/feature/planning/hooks/use-dofa";
import {
  STRATEGY_TYPE_CONFIG,
  type StrategyCode,
} from "./strategy-types-helpers";

// ---------------------------------------------------------------------------
// Category chip styling (Tailwind core — no risk-* tokens)
// ---------------------------------------------------------------------------
const CATEGORY_CLASSES: Record<string, { bg: string; text: string; border: string; letter: string }> = {
  Fortaleza:    { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", letter: "F" },
  Oportunidad:  { bg: "bg-sky-100",     text: "text-sky-700",     border: "border-sky-200",     letter: "O" },
  Debilidad:    { bg: "bg-rose-100",    text: "text-rose-700",    border: "border-rose-200",    letter: "D" },
  Amenaza:      { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200",   letter: "A" },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface StrategyTabFactorsProps {
  strategyId: string;
  analysisId: string;
  readOnly?: boolean;
  strategyTypeCode: StrategyCode | null;
}

export function StrategyTabFactors({
  strategyId,
  analysisId,
  readOnly = false,
  strategyTypeCode,
}: StrategyTabFactorsProps) {
  const [search, setSearch] = useState("");

  const { data: analysis, isLoading: loadingAnalysis } = useDofaAnalysisQuery(analysisId);
  const { data: linkedItems = [], isLoading: loadingLinks } = useStrategyDofaItemsQuery(strategyId);
  const linkMutation = useLinkDofaItemToStrategyMutation();
  const unlinkMutation = useUnlinkDofaItemFromStrategyMutation();

  // R-1 R-5 defensiva: if code can't be resolved, show error state
  if (!strategyTypeCode) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No se puede determinar el tipo de cruce — contacte soporte.
      </p>
    );
  }

  const filterCategories = STRATEGY_TYPE_CONFIG[strategyTypeCode].filterCategories;

  // All DOFA items from the analysis, filtered by relevant categories
  const allItems = analysis?.items ?? [];
  const relevantItems = useMemo(
    () => allItems.filter((item) => filterCategories.includes(item.category) && item.isActive),
    [allItems, filterCategories],
  );

  // Set of dofaItemIds that are currently linked
  const linkedItemIdSet = useMemo(
    () => new Set(linkedItems.map((l) => l.dofaItemId)),
    [linkedItems],
  );

  // Map dofaItemId → link record id (needed for unlink)
  const itemIdToLinkId = useMemo(() => {
    const map: Record<string, string> = {};
    for (const l of linkedItems) {
      map[l.dofaItemId] = l.id;
    }
    return map;
  }, [linkedItems]);

  // Search filter
  const filteredItems = useMemo(() => {
    if (!search.trim()) return relevantItems;
    const q = search.toLowerCase();
    return relevantItems.filter(
      (item) =>
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q),
    );
  }, [relevantItems, search]);

  // Group by category
  const grouped = useMemo(() => {
    const map: Record<string, typeof filteredItems> = {};
    for (const item of filteredItems) {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    }
    return map;
  }, [filteredItems]);

  const handleToggle = async (dofaItemId: string) => {
    if (readOnly) return;
    if (linkedItemIdSet.has(dofaItemId)) {
      const linkId = itemIdToLinkId[dofaItemId];
      if (linkId) await unlinkMutation.mutateAsync({ strategyId, linkId });
    } else {
      // R-7: contributionPercentage default 100
      await linkMutation.mutateAsync({
        strategyId,
        dofaItemId,
        payload: { dofaItemId, contributionPercentage: 100 },
      });
    }
  };

  if (loadingAnalysis || loadingLinks) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (relevantItems.length === 0) {
    return (
      <div className="rounded-md border border-dashed bg-muted/20 p-6 text-center text-xs text-muted-foreground">
        Aún no hay factores en este análisis. Vuelve a la Fase 1 (Diagnóstico) para agregar factores de tipo{" "}
        <span className="font-medium">{filterCategories.join(" / ")}</span>.
      </div>
    );
  }

  const linkedCount = linkedItems.filter((l) =>
    relevantItems.some((item) => item.id === l.dofaItemId),
  ).length;

  return (
    <div className="space-y-4">
      {/* Counter + search */}
      <div className="flex items-center gap-3">
        <p className="text-xs text-muted-foreground flex-1">
          <span className="font-medium text-foreground">{linkedCount}</span> vinculados de{" "}
          <span className="font-medium text-foreground">{relevantItems.length}</span> disponibles
        </p>
        <div className="relative w-48">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs pl-7"
          />
        </div>
      </div>

      {/* Grouped items by category */}
      {filterCategories.map((category) => {
        const items = grouped[category] ?? [];
        if (items.length === 0) return null;
        const cls = CATEGORY_CLASSES[category] ?? {
          bg: "bg-muted",
          text: "text-muted-foreground",
          border: "border-border",
          letter: category[0],
        };

        return (
          <div key={category}>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {category}s
            </p>
            <div className="space-y-1.5">
              {items.map((item) => {
                const isLinked = linkedItemIdSet.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={readOnly || linkMutation.isPending || unlinkMutation.isPending}
                    onClick={() => handleToggle(item.id)}
                    className={cn(
                      "w-full flex items-start gap-2.5 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                      isLinked
                        ? cn(cls.bg, cls.text, cls.border, "font-medium")
                        : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground",
                      (readOnly) && "cursor-not-allowed opacity-70",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 shrink-0 inline-flex items-center justify-center h-5 w-5 rounded text-[10px] font-bold border",
                        isLinked ? "bg-white/60 border-current" : cn(cls.bg, cls.text, cls.border),
                      )}
                    >
                      {isLinked ? <Check className="h-3 w-3" /> : cls.letter}
                    </span>
                    <span className="flex-1 leading-snug">{item.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
