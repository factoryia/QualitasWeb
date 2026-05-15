"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ChevronRight, Pencil, Plus, Trash2, Link as LinkIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { fmtDate } from "@/lib/format";
import {
  useIndicatorDetailQuery,
  useDeleteIndicatorMutation,
  useDeleteMeasurementMutation,
  useGoalFrequenciesQuery,
  useGoalTrendsQuery,
  useIndicatorTypesQuery,
} from "@/feature/planning/hooks/use-dofa";
import { Sparkline } from "./sparkline";
import { lookupCatalogName } from "./plan-helpers";
import { MeasurementFormDialog } from "./measurement-form-dialog";
import type { IndicatorDto, MeasurementDto } from "@/feature/planning/api/dofa";

interface Props {
  indicator: IndicatorDto;
  goalId: string;
  onEdit: () => void;
  readOnly?: boolean;
}

export function IndicatorAccordion({ indicator, goalId, onEdit, readOnly }: Props) {
  const [expanded, setExpanded] = useState(false);

  // PM-14: lazy load detail only when expanded
  const { data: detail } = useIndicatorDetailQuery(goalId, indicator.id, {
    enabled: expanded,
  });
  const measurements = detail?.measurements ?? [];

  // PM-18: client-side lookup
  const { data: frequencies = [] } = useGoalFrequenciesQuery();
  const { data: indicatorTypes = [] } = useIndicatorTypesQuery();
  const { data: trends = [] } = useGoalTrendsQuery();

  const freqName = lookupCatalogName(indicator.frequencyId, frequencies);
  const typeName = lookupCatalogName(indicator.indicatorTypeId, indicatorTypes);
  const trend = trends.find((t) => t.id === indicator.trendId);
  const trendSymbol = trend?.symbol ?? null;
  const trendColorClass = trend
    ? trend.code === "Increasing"
      ? "text-emerald-500"
      : trend.code === "Decreasing"
      ? "text-rose-500"
      : "text-slate-500"
    : "text-muted-foreground";

  const deleteIndMutation = useDeleteIndicatorMutation();
  const deleteMeasMutation = useDeleteMeasurementMutation();

  const [measDialog, setMeasDialog] = useState<{
    open: boolean;
    meas: MeasurementDto | null;
  }>({ open: false, meas: null });

  // Sparkline: last 10 measurements in chronological order
  const sparklineValues = [...measurements]
    .sort((a, b) => a.measurementDate.localeCompare(b.measurementDate))
    .slice(-10)
    .map((m) => m.value);
  const lastValue = sparklineValues[sparklineValues.length - 1];

  const handleDeleteIndicator = async () => {
    if (!confirm(`¿Eliminar el indicador "${indicator.name}"?`)) return;
    try {
      await deleteIndMutation.mutateAsync({ goalId, indicatorId: indicator.id });
      toast.success("Indicador eliminado");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const handleDeleteMeasurement = async (measurementId: string) => {
    if (!confirm("¿Eliminar esta medición?")) return;
    try {
      await deleteMeasMutation.mutateAsync({
        indicatorId: indicator.id,
        goalId,
        measurementId,
      });
      toast.success("Medición eliminada");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Clickable header */}
      <div
        className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/40"
        onClick={() => setExpanded((e) => !e)}
      >
        <ChevronRight
          className={cn("h-4 w-4 transition-transform", expanded && "rotate-90")}
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold leading-snug">{indicator.name}</div>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <Badge className="h-5 px-1.5 text-[10px] bg-sky-100 text-sky-700 border-0">
              {freqName}
            </Badge>
            <Badge className="h-5 px-1.5 text-[10px] bg-muted text-muted-foreground border-0">
              {typeName}
            </Badge>
            {trendSymbol && (
              <span className={`text-xs font-medium ${trendColorClass}`}>{trendSymbol}</span>
            )}
            {indicator.dataSource && (
              <span className="text-[10px] text-muted-foreground">
                📁 {indicator.dataSource}
              </span>
            )}
          </div>
        </div>

        {sparklineValues.length >= 2 && (
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Sparkline values={sparklineValues} width={100} height={28} />
            <span className="text-sm font-mono font-semibold text-sky-500">
              {lastValue}
            </span>
          </div>
        )}

        {!readOnly && (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onEdit}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive"
              onClick={handleDeleteIndicator}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t p-3 space-y-3">
          {indicator.formula && (
            <code className="block text-xs bg-muted px-2 py-1.5 rounded font-mono">
              f(x) = {indicator.formula}
            </code>
          )}

          {measurements.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Sin mediciones registradas
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Observaciones</TableHead>
                  <TableHead>Evidencia</TableHead>
                  {!readOnly && <TableHead className="w-16" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...measurements]
                  .sort((a, b) =>
                    b.measurementDate.localeCompare(a.measurementDate)
                  )
                  .map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono text-xs">
                        {fmtDate(m.measurementDate)}
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
                            onClick={(e) => e.stopPropagation()}
                          >
                            <LinkIcon className="h-3 w-3" />
                            Ver
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      {!readOnly && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setMeasDialog({ open: true, meas: m })}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={() => handleDeleteMeasurement(m.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}

          {!readOnly && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
              onClick={() => setMeasDialog({ open: true, meas: null })}
            >
              <Plus className="h-3.5 w-3.5" /> Nueva medición
            </Button>
          )}

          <MeasurementFormDialog
            open={measDialog.open}
            indicatorId={indicator.id}
            goalId={goalId}
            measurement={measDialog.meas}
            onClose={() => setMeasDialog({ open: false, meas: null })}
          />
        </div>
      )}
    </Card>
  );
}
