"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useAuditList } from "../hooks/use-audit";
import { AuditSeverity, AuditEventType } from "../types";
import { format } from "date-fns";

export function AuditLatestEvents() {
  const { data, isLoading } = useAuditList({
    pageNumber: 1,
    pageSize: 10,
    sort: "occurredAtUtc desc",
  });

  const events = data?.items || [];

  return (
    <Card className="rounded-2xl border py-6 border-slate-200 shadow-sm">
      <CardHeader className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 border-b border-slate-200 dark:border-slate-800">
        <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          Últimos Movimientos
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="py-4 text-center text-sm text-slate-400">Cargando...</div>
          ) : events.length === 0 ? (
            <div className="py-4 text-center text-sm text-slate-400">No hay movimientos recientes</div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="py-1 flex items-center justify-between group hover:bg-slate-50/50 transition-colors px-2 rounded-md"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {getEventLabel(event.eventType)}
                    </span>
                    {event.source && (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-slate-100 text-slate-500 border-none font-normal">
                        {event.source}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {format(new Date(event.occurredAtUtc), "hh:mm:ss a")}
                    <span className="text-slate-300">|</span>
                    <span className="italic">{event.userName || "sistema@root.com"}</span>
                    {event.requestId && (
                      <>
                        <span className="text-slate-300">|</span>
                        <span className="font-mono text-[9px] bg-slate-50 px-1 rounded" title={event.requestId}>
                          ID: {event.requestId.substring(0, 8)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] px-2 py-0 h-5 border-slate-200 text-slate-500"
                >
                  {getSeverityLabel(event.severity)}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getEventLabel(type: any) {
  const typeStr = String(type);
  switch (typeStr) {
    case "EntityChange":
    case "1":
      return "Cambio de Entidad";
    case "Security":
    case "2":
      return "Seguridad";
    case "Activity":
    case "3":
      return "Actividad";
    case "Exception":
    case "4":
      return "Excepción";
    default:
      return "Evento";
  }
}

function getSeverityLabel(severity: any) {
  const sevStr = String(severity);
  switch (sevStr) {
    case "Information":
    case "3":
      return "Nivel 1";
    case "Warning":
    case "4":
      return "Nivel 2";
    case "Error":
    case "5":
      return "Nivel 3";
    case "Critical":
    case "6":
      return "Nivel 4";
    default:
      return "Nivel 0";
  }
}
