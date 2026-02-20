"use client";

import { AuditItemDto } from "../services/auditoria.service";
import { TableSkeletonLogs } from "@/components/ui/table-skeleton-logs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ChevronRight, ChevronLeft } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface LogsTablaProps {
  logs: AuditItemDto[];
  loading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewDetail: (id: string) => void;
  getSeverityBadge: (severity: number) => React.ReactNode;
}

export function LogsTabla({
  logs,
  loading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onViewDetail,
  getSeverityBadge
}: LogsTablaProps) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
      {loading ? (
        <TableSkeletonLogs className="p-4" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="px-4 py-3 text-[11px] font-bold uppercase text-slate-500 tracking-wider">Fecha (UTC)</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase text-slate-500 tracking-wider">Usuario</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase text-slate-500 tracking-wider">Evento / Fuente</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase text-slate-500 tracking-wider">Severidad</th>
                <th className="px-4 py-3 text-[11px] font-bold uppercase text-slate-500 tracking-wider">Trace ID</th>
                <th className="px-4 py-3 w-[40px]"></th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr 
                  key={log.id} 
                  onClick={() => onViewDetail(log.id)}
                  className="border-b border-slate-100 dark:border-slate-800 last:border-0 group cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-slate-400" />
                      {new Date(log.occurredAtUtc).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 italic">
                    {log.userName || "sistema@root.com"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Tipo {log.eventType}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">{log.source || "API-Compliance"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getSeverityBadge(log.severity)}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-400">
                    {log.traceId ? `${log.traceId.substring(0, 8)}...` : "---"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-transform group-hover:translate-x-0.5" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINACIÓN */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" size="icon" className="h-8 w-8"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1 || loading}
          >
            <ChevronLeft size={14} />
          </Button>
          <span className="text-xs font-semibold text-slate-600">Página {page}</span>
          <Button 
            variant="outline" size="icon" className="h-8 w-8"
            onClick={() => onPageChange(page + 1)}
            disabled={logs.length < pageSize || loading}
          >
            <ChevronRight size={14} />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 uppercase font-bold">Mostrar</span>
          <Select 
            value={pageSize.toString()} 
            onValueChange={(v) => onPageSizeChange(Number(v))}
            disabled={loading}
          >
            <SelectTrigger className="w-[70px] h-8 text-xs font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}