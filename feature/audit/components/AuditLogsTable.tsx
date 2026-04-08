"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { PagedResponse, AuditSummaryDto } from "../types";
import { getSeverityBadge, getEventTypeLabel } from "../utils";

const SKELETON_ROWS = 10;

interface AuditLogsTableProps {
  data?: PagedResponse<AuditSummaryDto>;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onViewDetail?: (id: string) => void;
}

export function AuditLogsTable({
  data,
  isLoading,
  page,
  onPageChange,
  onViewDetail,
}: AuditLogsTableProps) {
  
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card">
        <div className="w-full overflow-x-auto">
          <table className="w-full table-fixed border-separate border-spacing-0 text-left text-sm">
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[12%]" />
              <col className="w-[15%]" />
              <col className="w-[20%]" />
              <col className="w-[5%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-border/80 bg-muted/60 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Fecha / Hora</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Severidad</th>
                <th className="px-4 py-3">Origen</th>
                <th className="px-4 py-3">Trace ID</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <tr key={i} className={i < SKELETON_ROWS - 1 ? "border-b border-border/60" : ""}>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-4 py-3 text-right"><Skeleton className="ml-auto h-4 w-4" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const items = data?.items ?? [];
  const hasData = items.length > 0;

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="w-full overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="border-b border-border/80 bg-muted/60 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 whitespace-nowrap">Fecha / Hora</th>
              <th className="px-4 py-3 whitespace-nowrap">Usuario</th>
              <th className="px-4 py-3 whitespace-nowrap">Tipo</th>
              <th className="px-4 py-3 whitespace-nowrap">Severidad</th>
              <th className="px-4 py-3 whitespace-nowrap">Origen</th>
              <th className="px-4 py-3 whitespace-nowrap">Trace ID</th>
              <th className="px-4 py-3 text-right whitespace-nowrap"></th>
            </tr>
          </thead>
          <tbody>
            {!hasData && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No se encontraron registros de auditoría.
                </td>
              </tr>
            )}
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <tr
                  key={item.id}
                  className={`group text-sm text-foreground transition-colors hover:bg-muted/30 cursor-pointer ${
                    !isLast ? "border-b border-border/60" : ""
                  }`}
                  onClick={() => onViewDetail?.(item.id)}
                >
                  <td className="px-4 py-3 align-middle whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {format(new Date(item.occurredAtUtc), "dd MMM yyyy", { locale: es })}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(item.occurredAtUtc), "HH:mm:ss")}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex flex-col">
                      <span className="font-medium">{item.userName || "Sistema"}</span>
                      {item.userId && <span className="text-xs text-muted-foreground truncate max-w-[150px]">{item.userId}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {getEventTypeLabel(item.eventType)}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    {getSeverityBadge(item.severity)}
                  </td>
                  <td className="px-4 py-3 align-middle text-muted-foreground">
                    {item.source || "—"}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs text-slate-600 dark:text-slate-400 font-mono">
                      {item.traceId?.substring(0, 8)}...
                    </code>
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-0.5" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-border/80 px-4 py-3 text-xs text-muted-foreground gap-4">
          <div>
            Mostrando <span className="font-medium">{data.totalCount === 0 ? 0 : (data.pageNumber - 1) * data.pageSize + 1}</span> - <span className="font-medium">{Math.min(data.pageNumber * data.pageSize, data.totalCount)}</span> de <span className="font-medium">{data.totalCount}</span> eventos
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!data.hasPrevious}
              onClick={() => onPageChange(page - 1)}
              className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-40 hover:bg-muted/60 transition-colors"
            >
              Anterior
            </button>
            <span className="text-xs min-w-[80px] text-center">
              Página <span className="font-semibold">{data.pageNumber}</span> de <span className="font-semibold">{data.totalPages || 1}</span>
            </span>
            <button
              type="button"
              disabled={!data.hasNext}
              onClick={() => onPageChange(page + 1)}
              className="inline-flex items-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-40 hover:bg-muted/60 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
