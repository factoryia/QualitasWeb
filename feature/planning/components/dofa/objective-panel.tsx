"use client";

import { format } from "date-fns";
import { CalendarDays, User } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useObjectiveQuery, useObjectiveStatusesQuery } from "@/feature/planning/hooks/use-dofa";
import { ProgressRing } from "./progress-ring";
import { OBJECTIVE_STATUS_CFG } from "./plan-helpers";
import { TabObjectiveDescription } from "./tab-objective-description";
import { TabObjectiveGoals } from "./tab-objective-goals";
import { TabObjectiveIndicators } from "./tab-objective-indicators";
import { TabObjectiveMeasurements } from "./tab-objective-measurements";

interface ObjectivePanelProps {
  objectiveId: string | null;
  onClose: () => void;
  readOnly?: boolean;
}

export function ObjectivePanel({ objectiveId, onClose, readOnly }: ObjectivePanelProps) {
  const isOpen = !!objectiveId;
  const { data: objective, isLoading } = useObjectiveQuery(objectiveId ?? undefined);
  const { data: statuses = [] } = useObjectiveStatusesQuery();

  const code =
    objective
      ? (statuses.find((s) => s.id === objective.statusId)?.code ?? "Planned")
      : "Planned";
  const cfg = OBJECTIVE_STATUS_CFG[code] ?? OBJECTIVE_STATUS_CFG.Planned;

  const fmtDate = (iso: string) => {
    try { return format(new Date(iso), "dd/MM/yyyy"); } catch { return iso; }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="sm:max-w-3xl overflow-y-auto p-6 sm:p-8">
        {/* sr-only title keeps Radix aria-labelledby valid when the visual header is custom */}
        <SheetTitle className="sr-only">{objective?.name ?? "Detalle del objetivo"}</SheetTitle>
        <SheetHeader className="p-0">
          <div className="flex items-start gap-3 pb-6 border-b border-border">
            <ProgressRing value={objective?.progressPercentage ?? 0} size={56} />
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <Skeleton className="h-5 w-48" />
              ) : (
                <SheetTitle className="text-base leading-snug">
                  {objective?.name ?? "..."}
                </SheetTitle>
              )}
              {objective?.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {objective.description}
                </p>
              )}
              {objective && (
                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <CalendarDays className="h-3 w-3" />
                    {fmtDate(objective.startDate)} – {fmtDate(objective.endDate)}
                  </span>
                  {objective.responsibleId && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <User className="h-3 w-3" />
                      Responsable asignado
                    </span>
                  )}
                </div>
              )}
            </div>
            <Badge variant="outline" className="gap-1.5 shrink-0 mt-1">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dotClass}`} />
              {cfg.label}
            </Badge>
          </div>
        </SheetHeader>

        {objectiveId && (
          <Tabs defaultValue="description" className="mt-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Descripción</TabsTrigger>
              <TabsTrigger value="goals">Metas</TabsTrigger>
              <TabsTrigger value="indicators">Indicadores</TabsTrigger>
              <TabsTrigger value="measurements">Mediciones</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              {objective ? (
                // key resets form state when user opens a different objective
                <TabObjectiveDescription
                  key={objective.id}
                  objective={objective}
                  readOnly={readOnly}
                  onClose={onClose}
                />
              ) : (
                <div className="space-y-3">
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              )}
            </TabsContent>
            <TabsContent value="goals" className="mt-4">
              <TabObjectiveGoals objectiveId={objectiveId} readOnly={readOnly} />
            </TabsContent>
            <TabsContent value="indicators" className="mt-4">
              <TabObjectiveIndicators objectiveId={objectiveId} readOnly={readOnly} />
            </TabsContent>
            <TabsContent value="measurements" className="mt-4">
              <TabObjectiveMeasurements objectiveId={objectiveId} />
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}
