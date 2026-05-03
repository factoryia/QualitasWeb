"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  useStrategyByIdQuery,
  useStrategyTypesQuery,
  useStrategyDeleteMutation,
} from "@/feature/planning/hooks/use-dofa";
import {
  mapStrategicTypeIdToCode,
  STRATEGY_TYPE_CONFIG,
} from "./strategy-types-helpers";
import { StrategyTabDescription } from "./strategy-tab-description";
import { StrategyTabFactors } from "./strategy-tab-factors";
import { StrategyTabObjectives } from "./strategy-tab-objectives";

// ---------------------------------------------------------------------------
// Tone badge classes (no risk-* tokens — Tailwind core)
// ---------------------------------------------------------------------------
const TONE_BADGE: Record<"low" | "medium" | "high" | "primary", string> = {
  low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-rose-100 text-rose-700 border-rose-200",
  primary: "bg-sky-100 text-sky-700 border-sky-200",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface StrategyPanelProps {
  strategyId: string | null;
  analysisId: string;
  onClose: () => void;
  readOnly?: boolean;
}

export function StrategyPanel({
  strategyId,
  analysisId,
  onClose,
  readOnly = false,
}: StrategyPanelProps) {
  const { data: strategy, isLoading } = useStrategyByIdQuery(strategyId ?? undefined);
  const { data: strategyTypes = [] } = useStrategyTypesQuery();
  const deleteMutation = useStrategyDeleteMutation();
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Resolve type code for downstream tabs
  const typeCode = strategy
    ? mapStrategicTypeIdToCode(strategy.strategicTypeId, strategyTypes)
    : null;
  const typeConfig = typeCode ? STRATEGY_TYPE_CONFIG[typeCode] : null;

  const handleDelete = async () => {
    if (!strategyId) return;
    await deleteMutation.mutateAsync(strategyId);
    setDeleteOpen(false);
    onClose();
  };

  return (
    <Sheet open={!!strategyId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto flex flex-col gap-0 p-0">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                <SheetTitle className="text-base leading-snug">
                  {strategy?.title ?? "Sin título"}
                </SheetTitle>
              )}
            </div>
          </div>
          <SheetDescription asChild>
            <div className="flex items-center gap-3 flex-wrap mt-1">
              {typeConfig && typeCode && (
                <Badge
                  variant="outline"
                  className={cn("text-xs font-semibold", TONE_BADGE[typeConfig.tone])}
                >
                  {typeCode} · {typeConfig.tagline}
                </Badge>
              )}
              {/* Progress bar (R-6: read-only from backend) */}
              {strategy && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="shrink-0">Progreso</span>
                  <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${strategy.progressPercentage ?? 0}%` }}
                    />
                  </div>
                  <span className="tabular-nums">{strategy.progressPercentage ?? 0}%</span>
                </div>
              )}
            </div>
          </SheetDescription>
        </SheetHeader>

        {/* Tabs */}
        <Tabs defaultValue="description" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-3 mx-6 mt-4">
            <TabsTrigger value="description">Descripción</TabsTrigger>
            <TabsTrigger value="factors">Factores</TabsTrigger>
            <TabsTrigger value="objectives">Objetivos</TabsTrigger>
          </TabsList>

          <div className="flex-1 px-6 py-4">
            <TabsContent value="description" className="mt-0">
              {strategy ? (
                <StrategyTabDescription
                  strategy={strategy}
                  readOnly={readOnly}
                />
              ) : (
                <div className="space-y-3">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              )}
            </TabsContent>

            <TabsContent value="factors" className="mt-0">
              {strategyId && (
                <StrategyTabFactors
                  strategyId={strategyId}
                  analysisId={analysisId}
                  readOnly={readOnly}
                  strategyTypeCode={typeCode}
                />
              )}
            </TabsContent>

            <TabsContent value="objectives" className="mt-0">
              {strategyId && (
                <StrategyTabObjectives
                  strategyId={strategyId}
                  readOnly={readOnly}
                />
              )}
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer: delete action */}
        {!readOnly && strategyId && (
          <div className="px-6 py-4 border-t flex justify-end">
            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Eliminar estrategia
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar estrategia?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Los factores y objetivos vinculados perderán el vínculo.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
