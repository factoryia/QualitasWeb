"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  auditService, 
  AuditSummaryDto, 
  AuditItemDto 
} from "@/features/auditoria/services/auditoria.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// 1. Definimos que este componente recibe la función para cambiar de pestaña
interface AuditGeneralProps {
  onSetActiveTab: (tab: string) => void;
}

export function AuditGeneral() {
  const [summary, setSummary] = useState<AuditSummaryDto | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditItemDto[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryData, logsData] = await Promise.all([
        auditService.getAuditSummary(),
        // ANTES: auditService.getAudits(1, 3) -> ESTO DABA ERROR
        // AHORA: Enviamos el objeto esperado por el nuevo Service
        auditService.getAudits({ PageNumber: 1, PageSize: 3 }), 
      ]);

      if (summaryData) setSummary(summaryData);
      if (logsData) setRecentLogs(logsData.items);
    } catch (error) {
      console.error("Error cargando resumen:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* 1. WIDGETS DE RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Excepciones", val: summary?.eventsByType?.["Exception"] || 0, color: "text-black" },
          { label: "Seguridad", val: summary?.eventsByType?.["Security"] || 0, color: "text-black" },
          { label: "Actividad Total", val: summary?.eventsByType?.["Activity"] || 0, color: "text-black" }
        ].map((item, i) => (
          <Card key={i} className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="pt-6 text-center">
              <span className={cn("text-3xl font-bold", item.color)}>{item.val.toLocaleString()}</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2. GRÁFICAS DE DISTRIBUCIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 text-center">Eventos por Origen</h3>
            <div className="space-y-3">
              {summary && Object.entries(summary.eventsBySource).map(([source, count]) => {
                const total = Object.values(summary.eventsBySource).reduce((a, b) => a + (b as number), 0);
                const percentage = ((count as number) / total) * 100;
                return (
                  <div key={source} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span>{source}</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 text-center">Eventos por Severidad</h3>
            <div className="grid grid-cols-3 gap-2">
              {summary && Object.entries(summary.eventsBySeverity).map(([sev, count]) => (
                <div key={sev} className="p-2 rounded bg-slate-50 border border-slate-100 text-center">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase">{sev}</span>
                  <span className={cn(
                    "text-lg font-bold",
                    sev === "Error" ? "text-red-500" : 
                    sev === "Warning" ? "text-amber-500" : "text-blue-500"
                  )}>
                    {(count as number).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* 3. MINI TABLA: ACTIVIDAD RECIENTE */}
      <Card className="border-slate-200 shadow-sm ">
        <CardHeader className="border-b border-slate-200 dark:border-slate-800">
          <CardTitle className="text-sm  font-bold text-slate-700 flex items-center justify-between">
            Últimos Movimientos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y  divide-slate-100">
            {recentLogs.map((log) => (
              <div key={log.id} className="py-1 flex items-center justify-between group hover:bg-slate-50/50 transition-colors px-2 rounded-md">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-700">Tipo {log.eventType}</span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <Clock size={10} />
                    {new Date(log.occurredAtUtc).toLocaleTimeString()}
                    <span className="text-slate-300">|</span>
                    <span className="italic">{log.userName || "sistema@root.com"}</span>
                  </div>
                </div>
                <Badge variant="outline" className={cn(
                  "text-[10px] px-2 py-0 h-5",
                  log.severity >= 4 ? "border-red-200 text-red-600 bg-red-50" : "border-slate-200 text-slate-500"
                )}>
                  Nivel {log.severity}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}