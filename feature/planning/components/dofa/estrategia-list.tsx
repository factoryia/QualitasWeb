"use client";

import { useMemo, useRef, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { ChevronRight, Plus, X, User, Target, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  strategyKeys,
  useStrategiesQuery,
  useStrategyTypesQuery,
  useStrategyCreateMutation,
} from "@/feature/planning/hooks/use-dofa";
import {
  listStrategyDofaItems,
  listStrategyObjectives,
  type StrategyDto,
} from "@/feature/planning/api/dofa";
import {
  STRATEGY_CODES,
  STRATEGY_TYPE_CONFIG,
  mapStrategicTypeIdToCode,
  mapCodeToStrategicTypeId,
  type StrategyCode,
} from "./strategy-types-helpers";

// ---------------------------------------------------------------------------
// Tone → Tailwind classes
// No risk-low / risk-medium custom tokens in this project — use Tailwind core.
// ---------------------------------------------------------------------------
const TONE_CLASSES: Record<
  "low" | "medium" | "high" | "primary",
  { borderLeft: string; bg: string; text: string; badge: string }
> = {
  low: {
    borderLeft: "border-l-4 border-l-emerald-500",
    bg: "bg-emerald-50/50",
    text: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  medium: {
    borderLeft: "border-l-4 border-l-amber-500",
    bg: "bg-amber-50/50",
    text: "text-amber-600",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
  },
  high: {
    borderLeft: "border-l-4 border-l-rose-500",
    bg: "bg-rose-50/50",
    text: "text-rose-600",
    badge: "bg-rose-100 text-rose-700 border-rose-200",
  },
  primary: {
    borderLeft: "border-l-4 border-l-sky-500",
    bg: "bg-sky-50/50",
    text: "text-sky-600",
    badge: "bg-sky-100 text-sky-700 border-sky-200",
  },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface EstrategiaListProps {
  analysisId: string;
  onSelectStrategy: (strategyId: string) => void;
  readOnly?: boolean;
}

// ---------------------------------------------------------------------------
// StrategyCard — compact clickable row for a single strategy
// PM-05: no status badge — backend does not support status updates
// ---------------------------------------------------------------------------
interface StrategyCardProps {
  strategy: StrategyDto;
  objCount: number;
  factCount: number;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

function StrategyCard({ strategy, objCount, factCount, onSelect, disabled }: StrategyCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(strategy.id)}
      disabled={disabled}
      className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-accent/60 transition-colors cursor-pointer disabled:cursor-default disabled:opacity-70"
    >
      <span className="flex-1 min-w-0 text-sm text-foreground truncate leading-snug pt-0.5">
        {strategy.title}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Responsable */}
        <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
          <User className="h-3 w-3" />
          {strategy.responsibleId ? strategy.responsibleId.slice(0, 8) : "Sin asignar"}
        </span>
        {/* Count factores */}
        <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] bg-muted text-muted-foreground">
          <Layers className="h-3 w-3" />
          {factCount}
        </span>
        {/* Count objetivos */}
        <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] bg-muted text-muted-foreground">
          <Target className="h-3 w-3" />
          {objCount}
        </span>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// InlineCreateInput — text field at the bottom of each group
// ---------------------------------------------------------------------------
interface InlineCreateInputProps {
  code: StrategyCode;
  onCommit: (code: StrategyCode, title: string) => void;
  onCancel: () => void;
  isPending?: boolean;
}

function InlineCreateInput({ code, onCommit, onCancel, isPending }: InlineCreateInputProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="border-t bg-muted/20 px-4 py-3 flex items-center gap-2">
      <Input
        ref={inputRef}
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && draft.trim()) onCommit(code, draft.trim());
          if (e.key === "Escape") onCancel();
        }}
        placeholder={`Describe la estrategia ${code}...`}
        className="h-8 text-sm"
        disabled={isPending}
      />
      <Button
        size="sm"
        className="h-8 shrink-0"
        onClick={() => draft.trim() && onCommit(code, draft.trim())}
        disabled={!draft.trim() || isPending}
      >
        Agregar
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 shrink-0"
        onClick={onCancel}
        disabled={isPending}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StrategyGroupAccordion — one per DOFA cross-type
// ---------------------------------------------------------------------------
interface StrategyGroupAccordionProps {
  code: StrategyCode;
  strategies: StrategyDto[];
  dofaItemCounts: Record<string, number>;
  objectiveCounts: Record<string, number>;
  onSelectStrategy: (id: string) => void;
  readOnly: boolean;
  creatingFor: StrategyCode | null;
  onStartCreating: (code: StrategyCode) => void;
  onCommitCreate: (code: StrategyCode, title: string) => void;
  onCancelCreate: () => void;
  isPending: boolean;
}

function StrategyGroupAccordion({
  code,
  strategies,
  dofaItemCounts,
  objectiveCounts,
  onSelectStrategy,
  readOnly,
  creatingFor,
  onStartCreating,
  onCommitCreate,
  onCancelCreate,
  isPending,
}: StrategyGroupAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const config = STRATEGY_TYPE_CONFIG[code];
  const tone = TONE_CLASSES[config.tone];
  const isCreating = creatingFor === code;
  const { Icon, tagline } = config;

  return (
    <div className={cn("rounded-lg border bg-card overflow-hidden shadow-sm", tone.borderLeft)}>
      {/* Group header */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition-colors",
          tone.bg,
          "hover:brightness-95",
        )}
        onClick={() => setIsOpen((o) => !o)}
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 transition-transform text-muted-foreground",
            isOpen && "rotate-90",
          )}
        />
        <Icon className={cn("h-4 w-4 shrink-0", tone.text)} aria-hidden />
        <span className={cn("font-semibold text-sm", tone.text)}>{code}</span>
        <span className="text-sm text-foreground">— {tagline}</span>
        <Badge variant="outline" className={cn("text-[10px] font-semibold ml-1", tone.badge)}>
          {strategies.length}
        </Badge>

        {!readOnly && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs ml-auto"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
              onStartCreating(code);
            }}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Nueva
          </Button>
        )}
      </div>

      {/* Group body */}
      {isOpen && (
        <div className="border-t bg-card">
          {strategies.length === 0 && !isCreating ? (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">
              No hay estrategias{" "}
              <span className={cn("font-semibold", tone.text)}>{code}</span> aún.
              {!readOnly && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 ml-1 text-xs"
                  onClick={() => onStartCreating(code)}
                >
                  Crear la primera
                </Button>
              )}
            </div>
          ) : (
            <ul className="divide-y">
              {strategies.map((s) => (
                <li key={s.id}>
                  <StrategyCard
                    strategy={s}
                    objCount={objectiveCounts[s.id] ?? 0}
                    factCount={dofaItemCounts[s.id] ?? 0}
                    onSelect={onSelectStrategy}
                  />
                </li>
              ))}
            </ul>
          )}

          {isCreating && !readOnly && (
            <InlineCreateInput
              code={code}
              onCommit={onCommitCreate}
              onCancel={onCancelCreate}
              isPending={isPending}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// EstrategiaList — main export
// ---------------------------------------------------------------------------
export function EstrategiaList({ analysisId, onSelectStrategy, readOnly = false }: EstrategiaListProps) {
  const { data: strategies = [], isLoading: loadingStrategies } = useStrategiesQuery(analysisId);
  const { data: strategyTypes = [], isLoading: loadingTypes } = useStrategyTypesQuery();
  const createMutation = useStrategyCreateMutation();

  // -------------------------------------------------------------------------
  // N+1 mitigation: batch queries for dofa-item and objective counts.
  // useQueries issues one query per strategy but TanStack Query deduplicates
  // and caches individually — far better than waterfall inside each card.
  // staleTime=60s keeps counts fresh without hammering the API on every render.
  // -------------------------------------------------------------------------
  const dofaItemQueries = useQueries({
    queries: strategies.map((s) => ({
      queryKey: strategyKeys.dofaItems(s.id),
      queryFn: () => listStrategyDofaItems(s.id),
      staleTime: 60_000,
    })),
  });

  const objectiveQueries = useQueries({
    queries: strategies.map((s) => ({
      queryKey: strategyKeys.objectives(s.id),
      queryFn: () => listStrategyObjectives(s.id),
      staleTime: 60_000,
    })),
  });

  // Collapse query arrays into id→count maps
  const dofaItemCounts = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    strategies.forEach((s, i) => {
      map[s.id] = dofaItemQueries[i]?.data?.length ?? 0;
    });
    return map;
  }, [strategies, dofaItemQueries]);

  const objectiveCounts = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    strategies.forEach((s, i) => {
      map[s.id] = objectiveQueries[i]?.data?.length ?? 0;
    });
    return map;
  }, [strategies, objectiveQueries]);

  // -------------------------------------------------------------------------
  // R-1: Group strategies by strategicTypeId → code via catalog
  // Orphan bucket: strategies whose typeId doesn't resolve are console.warn'd
  // only — no fifth group rendered.
  // -------------------------------------------------------------------------
  const grouped = useMemo<Record<StrategyCode, StrategyDto[]>>(() => {
    const map: Record<StrategyCode, StrategyDto[]> = { FO: [], DO: [], FA: [], DA: [] };
    for (const s of strategies) {
      const code = mapStrategicTypeIdToCode(s.strategicTypeId, strategyTypes);
      if (code) {
        map[code].push(s);
      } else {
        console.warn(
          `[EstrategiaList] strategicTypeId "${s.strategicTypeId}" no resuelve en el catálogo. Estrategia "${s.title}" omitida del grid.`,
        );
      }
    }
    return map;
  }, [strategies, strategyTypes]);

  // Header counts
  const totalStrategies = strategies.length;
  const completedTypes = STRATEGY_CODES.filter((c) => grouped[c].length > 0).length;

  // Inline-create state (global, one at a time)
  const [creatingFor, setCreatingFor] = useState<StrategyCode | null>(null);

  const handleStartCreating = (code: StrategyCode) => setCreatingFor(code);
  const handleCancelCreate = () => setCreatingFor(null);

  const handleCommitCreate = async (code: StrategyCode, title: string) => {
    const strategicTypeId = mapCodeToStrategicTypeId(code, strategyTypes);
    if (!strategicTypeId) {
      console.warn(`[EstrategiaList] No se encontró strategicTypeId para code "${code}"`);
      return;
    }
    await createMutation.mutateAsync({
      title,
      dofaAnalysisId: analysisId,
      strategicTypeId,
      description: null,
      responsibleId: null,
      // NOTE: do NOT send status (PM-05)
    });
    setCreatingFor(null);
  };

  if (loadingStrategies || loadingTypes) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header summary */}
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{totalStrategies}</span>{" "}
        {totalStrategies === 1 ? "estrategia definida" : "estrategias definidas"}
        {" · "}
        <span className="font-semibold text-foreground">{completedTypes}/4</span> tipos de cruce
        completados
      </p>

      {/* 2×2 responsive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {STRATEGY_CODES.map((code) => (
          <StrategyGroupAccordion
            key={code}
            code={code}
            strategies={grouped[code]}
            dofaItemCounts={dofaItemCounts}
            objectiveCounts={objectiveCounts}
            onSelectStrategy={onSelectStrategy}
            readOnly={readOnly}
            creatingFor={creatingFor}
            onStartCreating={handleStartCreating}
            onCommitCreate={handleCommitCreate}
            onCancelCreate={handleCancelCreate}
            isPending={createMutation.isPending}
          />
        ))}
      </div>
    </div>
  );
}
