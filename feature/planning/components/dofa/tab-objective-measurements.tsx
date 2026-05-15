"use client";

import { useMemo } from "react";
import { Activity, Link as LinkIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyBlock } from "./empty-block";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fmtDate } from "@/lib/format";
import {
  useGoalsQuery,
  useIndicatorsQuery,
  useIndicatorDetailQuery,
} from "@/feature/planning/hooks/use-dofa";
import type { GoalDto, IndicatorDto, MeasurementDto } from "@/feature/planning/api/dofa";

interface Props {
  objectiveId: string;
}

export function TabObjectiveMeasurements({ objectiveId }: Props) {
  const { data: goals = [], isLoading: goalsLoading } = useGoalsQuery({ objectiveId });
  const filteredGoals = useMemo(
    () => goals.filter((g) => g.objectiveId === objectiveId),
    [goals, objectiveId],
  );

  if (goalsLoading) return <Skeleton className="h-32 w-full" />;

  if (filteredGoals.length === 0) {
    return (
      <EmptyBlock
        icon={Activity}
        title="Sin mediciones registradas"
        description="Las mediciones aparecerán aquí una vez que tengas metas e indicadores configurados."
      />
    );
  }

  return (
    <div className="space-y-4">
      {filteredGoals.map((goal) => (
        <GoalMeasurementsRows key={goal.id} goal={goal} />
      ))}
    </div>
  );
}

/** Renders rows for all indicators of a single goal */
function GoalMeasurementsRows({ goal }: { goal: GoalDto }) {
  const { data: indicators = [], isLoading } = useIndicatorsQuery(goal.id);

  if (isLoading) return <Skeleton className="h-12 w-full" />;
  if (indicators.length === 0) return null;

  return (
    <>
      {indicators.map((ind) => (
        <IndicatorMeasurementRows key={ind.id} indicator={ind} goal={goal} />
      ))}
    </>
  );
}

/** Renders rows for all measurements of a single indicator */
function IndicatorMeasurementRows({
  indicator,
  goal,
}: {
  indicator: IndicatorDto;
  goal: GoalDto;
}) {
  // Always fetch detail here — this tab shows everything
  const { data: detail, isLoading } = useIndicatorDetailQuery(goal.id, indicator.id);
  const measurements: MeasurementDto[] = detail?.measurements ?? [];

  if (isLoading || measurements.length === 0) return null;

  const sorted = [...measurements].sort((a, b) =>
    b.measurementDate.localeCompare(a.measurementDate),
  );

  return (
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
        {goal.description} — {indicator.name}
      </h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Indicador</TableHead>
            <TableHead>Meta</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Observaciones</TableHead>
            <TableHead>Evidencia</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-mono text-xs">
                {fmtDate(m.measurementDate)}
              </TableCell>
              <TableCell className="text-xs">{indicator.name}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {goal.description}
              </TableCell>
              <TableCell className="font-mono font-semibold text-sky-500">
                {m.value}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {m.observations || "—"}
              </TableCell>
              <TableCell>
                {m.evidenceUrl ? (
                  <a
                    href={m.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-sky-500 inline-flex items-center gap-1"
                  >
                    <LinkIcon className="h-3 w-3" />
                    Ver
                  </a>
                ) : (
                  "—"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
