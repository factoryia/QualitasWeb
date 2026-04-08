"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AuditSummaryAggregateDto, AuditSeverity } from "../types";

interface AuditChartsProps {
  summary?: AuditSummaryAggregateDto;
  isLoading?: boolean;
}

export function AuditCharts({ summary, isLoading }: AuditChartsProps) {
  const eventsBySource = summary?.eventsBySource || {};
  const totalBySource = Object.values(eventsBySource).reduce(
    (acc, val) => acc + val,
    0
  );

  // Events by Severity: 3 is Information, 5 is Error, 4 is Warning
  const info = summary?.eventsBySeverity["Information"] ?? 0;
  const error = summary?.eventsBySeverity["Error"] ?? 0;
  const warning = summary?.eventsBySeverity["Warning"] ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="rounded-2xl border py-6 border-slate-200 shadow-sm">
        <CardContent className="px-6 pt-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 text-center">
            Eventos por Origen
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                  <Skeleton className="h-1 w-full" />
                </div>
              ))}
            </div>
          ) : totalBySource === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Sin datos
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(eventsBySource).map(([source, count]) => {
                const percentage =
                  totalBySource > 0 ? (count / totalBySource) * 100 : 0;
                return (
                  <div key={source} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span>{source}</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border py-6 border-slate-200 shadow-sm">
        <CardContent className="px-6 pt-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 text-center">
            Eventos por Severidad
          </h3>
          {isLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-2 rounded bg-slate-50 border border-slate-100 text-center"
                >
                  <Skeleton className="mx-auto mb-2 h-2 w-20" />
                  <Skeleton className="mx-auto h-6 w-16" />
                </div>
              ))}
            </div>
          ) : summary ? (
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded bg-slate-50 border border-slate-100 text-center">
                <span className="block text-[9px] font-bold text-slate-400 uppercase">
                  Information
                </span>
                <span className="text-lg font-bold text-blue-500">
                  {info.toLocaleString()}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100 text-center">
                <span className="block text-[9px] font-bold text-slate-400 uppercase">
                  Error
                </span>
                <span className="text-lg font-bold text-red-500">
                  {error.toLocaleString()}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100 text-center">
                <span className="block text-[9px] font-bold text-slate-400 uppercase">
                  Warning
                </span>
                <span className="text-lg font-bold text-amber-500">
                  {warning.toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              Sin datos
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
