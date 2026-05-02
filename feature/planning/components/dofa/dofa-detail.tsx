"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronRight, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { DofaItemDto, StrategyDto, StrategyTypeDto } from "@/feature/planning/api/dofa";
import {
  useDofaAnalysisQuery,
  useBscPerspectivesQuery,
  useStrategiesQuery,
  useStrategyTypesQuery,
} from "@/feature/planning/hooks/use-dofa";
import { DofaDiagnostico } from "./dofa-diagnostico";
import { DofaSettingsSheet } from "./dofa-settings-sheet";
import { EstrategiaList } from "./estrategia-list";
import { StrategyPanel } from "./strategy-panel";
import { mapStrategicTypeIdToCode, STRATEGY_CODES } from "./strategy-types-helpers";

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type Phase = 1 | 2 | 3;

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  draft: {
    label: "Borrador",
    className: "bg-muted text-muted-foreground border-transparent",
  },
  in_review: {
    label: "En Revisión",
    className:
      "bg-amber-100 text-amber-800 border-transparent dark:bg-amber-900/30 dark:text-amber-300",
  },
  approved: {
    label: "Activo",
    className:
      "bg-green-100 text-green-800 border-transparent dark:bg-green-900/30 dark:text-green-300",
  },
  archived: {
    label: "Cerrado",
    className: "bg-primary/10 text-primary border-transparent",
  },
};

interface PhaseConfig {
  num: Phase;
  name: string;
  textClass: string;
  borderClass: string;
  bgClass: string;
  fillClass: string;
}

const PHASES: PhaseConfig[] = [
  {
    num: 1,
    name: "Diagnóstico",
    textClass: "text-blue-600 dark:text-blue-400",
    borderClass: "border-blue-500",
    bgClass: "bg-blue-50 dark:bg-blue-950/30",
    fillClass: "bg-blue-500",
  },
  {
    num: 2,
    name: "Estrategia",
    textClass: "text-violet-600 dark:text-violet-400",
    borderClass: "border-violet-500",
    bgClass: "bg-violet-50 dark:bg-violet-950/30",
    fillClass: "bg-violet-500",
  },
  {
    num: 3,
    name: "Plan",
    textClass: "text-amber-600 dark:text-amber-400",
    borderClass: "border-amber-500",
    bgClass: "bg-amber-50 dark:bg-amber-950/30",
    fillClass: "bg-amber-500",
  },
];

// ---------------------------------------------------------------------------
// Phase progress helpers (client-side, conservative until backend endpoint exists)
// ---------------------------------------------------------------------------

function usePhaseProgress(
  analysisId: string,
  items: DofaItemDto[],
  strategies: StrategyDto[] | undefined,
  strategyTypes: StrategyTypeDto[] | undefined,
) {
  const { data: bscPerspectives = [] } = useBscPerspectivesQuery();

  return useMemo(() => {
    const activeItems = items.filter((i) => i.isActive);
    const perspectiveKeys =
      bscPerspectives.length > 0
        ? bscPerspectives.map((p) => p.id)
        : ["Financiero", "Cliente", "ProcesosInternos", "AprendizajeYCrecimiento"];

    // Phase 1: % of perspectives with ≥1 internal (F/D) AND ≥1 external (O/A)
    const byPerspective: Record<string, Set<string>> = {};
    for (const item of activeItems) {
      const perspKey = item.bscPerspectiveId ?? item.perspective;
      if (!perspKey) continue;
      if (!byPerspective[perspKey]) byPerspective[perspKey] = new Set();
      byPerspective[perspKey].add(item.category);
    }
    const filledPerspectives = perspectiveKeys.filter((key) => {
      const cats = byPerspective[key];
      if (!cats) return false;
      const hasInternal = cats.has("Fortaleza") || cats.has("Debilidad");
      const hasExternal = cats.has("Oportunidad") || cats.has("Amenaza");
      return hasInternal && hasExternal;
    }).length;

    const phase1Progress =
      perspectiveKeys.length === 0
        ? 0
        : Math.round((filledPerspectives / perspectiveKeys.length) * 100);

    // Phase 2: % of the 4 cross-types (FO/DO/FA/DA) that have ≥1 strategy in this analysis
    const filteredStrategies = (strategies ?? []).filter(
      (s) => s.dofaAnalysisId === analysisId,
    );
    const codesPresent = new Set(
      filteredStrategies
        .map((s) => mapStrategicTypeIdToCode(s.strategicTypeId, strategyTypes ?? []))
        .filter((c): c is (typeof STRATEGY_CODES)[number] => c !== null),
    );
    const phase2Progress = Math.round((codesPresent.size / 4) * 100);

    // Phase 3: placeholder (Sprint 3)
    const phase3Progress = 0;

    return {
      1: {
        progress: phase1Progress,
        subtext: `${activeItems.length} factores · ${filledPerspectives}/${perspectiveKeys.length} perspectivas`,
      },
      2: {
        progress: phase2Progress,
        subtext: `${filteredStrategies.length} ${filteredStrategies.length === 1 ? "estrategia" : "estrategias"} · ${codesPresent.size}/4 tipos`,
      },
      3: {
        progress: phase3Progress,
        subtext: "0 iniciados · 0 objetivos",
      },
    } as Record<Phase, { progress: number; subtext: string }>;
  }, [items, bscPerspectives, analysisId, strategies, strategyTypes]);
}

// ---------------------------------------------------------------------------
// DofaDetail
// ---------------------------------------------------------------------------

type Props = {
  analysisId: string;
  onBack: () => void;
};

export function DofaDetail({ analysisId, onBack }: Props) {
  const analysisQuery = useDofaAnalysisQuery(analysisId);
  const [activePhase, setActivePhase] = useState<Phase>(1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);

  const { data: strategies } = useStrategiesQuery(analysisId);
  const { data: strategyTypes } = useStrategyTypesQuery();

  const analysis = analysisQuery.data;
  const items = analysis?.items ?? [];
  const phaseData = usePhaseProgress(analysisId, items, strategies, strategyTypes);

  const isReadOnly = analysis?.status === "approved" || analysis?.status === "archived";

  if (analysisQuery.isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No se encontró el análisis solicitado.</p>
        <Button variant="outline" className="mt-4" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
      </div>
    );
  }

  const statusConfig = STATUS_LABELS[analysis.status ?? "draft"] ?? STATUS_LABELS.draft;
  const displayTitle = analysis.title || "Sin título";

  return (
    <div className="flex flex-col gap-4">
      {/* ── Topbar ── */}
      <div className="rounded-lg border bg-card px-4 py-3 shadow-sm space-y-2">
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
          aria-label="Breadcrumb"
        >
          <span>Planificación</span>
          <ChevronRight className="h-3 w-3" />
          <button
            type="button"
            onClick={onBack}
            className="hover:text-foreground transition-colors"
          >
            Análisis de Contexto
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium truncate max-w-[300px]">
            {displayTitle}
          </span>
        </nav>

        {/* Title row */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
            <ArrowLeft className="mr-1 h-4 w-4" /> Volver
          </Button>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold truncate px-1 text-foreground">
              {displayTitle}
            </h1>
          </div>

          <Badge
            className={cn("font-medium", statusConfig.className)}
            variant="outline"
          >
            {statusConfig.label}
          </Badge>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            aria-label="Configuración del análisis"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Phase stepper cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PHASES.map((phase) => {
          const isActive = activePhase === phase.num;
          const data = phaseData[phase.num];
          const isCompleted = data.progress >= 100;
          const showCheck = isCompleted && !isActive;

          return (
            <button
              key={phase.num}
              onClick={() => setActivePhase(phase.num)}
              className={cn(
                "flex flex-col gap-2 rounded-lg border bg-card px-4 py-3 text-left transition-all hover:shadow-md",
                isActive
                  ? cn(phase.borderClass, "ring-1", phase.bgClass)
                  : "border-border hover:border-muted-foreground/30",
              )}
            >
              <div className="flex items-center gap-3 w-full">
                {/* Phase number / check circle */}
                <div
                  className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0",
                    showCheck
                      ? "bg-green-500 text-white"
                      : isActive
                        ? cn(
                            "bg-background border-2",
                            phase.borderClass,
                            phase.textClass,
                          )
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {showCheck ? <Check className="h-3.5 w-3.5" /> : phase.num}
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      "font-semibold text-sm leading-tight",
                      isActive ? phase.textClass : "text-foreground",
                    )}
                  >
                    {phase.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {data.subtext}
                  </div>
                </div>

                <div className="text-xs font-semibold text-foreground tabular-nums">
                  {data.progress}%
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full transition-all", phase.fillClass)}
                  style={{ width: `${data.progress}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Content area ── */}
      <div
        className="rounded-lg border bg-card shadow-sm overflow-hidden"
        id={`fase-${activePhase}`}
      >
        {activePhase === 1 && (
          <DofaDiagnostico analysisId={analysisId} readOnly={isReadOnly} />
        )}
        {activePhase === 2 && (
          <>
            <EstrategiaList
              analysisId={analysisId}
              onSelectStrategy={(id) => setSelectedStrategyId(id)}
              readOnly={isReadOnly}
            />
            <StrategyPanel
              strategyId={selectedStrategyId}
              analysisId={analysisId}
              onClose={() => setSelectedStrategyId(null)}
              readOnly={isReadOnly}
            />
          </>
        )}
        {activePhase === 3 && (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Fase 3 — Plan de objetivos (próximamente en Sprint 3)
          </div>
        )}
      </div>

      {/* Settings Sheet */}
      <DofaSettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        analysis={analysis}
        readOnly={isReadOnly}
      />
    </div>
  );
}
