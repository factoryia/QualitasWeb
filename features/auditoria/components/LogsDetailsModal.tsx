"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, Calendar, Info, User, Fingerprint, Activity, Copy 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { AuditDetailDto } from "../services/auditoria.service";

interface LogDetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  log: AuditDetailDto | null;
  isLoading: boolean;
  getSeverityBadge: (severity: number) => React.ReactNode;
}

export function LogDetailModal({ 
  isOpen, 
  onOpenChange, 
  log, 
  isLoading,
  getSeverityBadge 
}: LogDetailModalProps) {
  
  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] md:h-auto md:max-h-[85vh] p-0 flex flex-col border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden rounded-lg">
        
        {/* HEADER FIJO */}
        <DialogHeader className="p-4 md:p-6 border-b bg-white dark:bg-slate-950 sticky top-0 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg shrink-0",
                log?.severity === 5 ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
              )}>
                <Activity size={20} />
              </div>
              <div className="min-w-0 text-left">
                <DialogTitle className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 truncate">
                  {log?.payload?.message || "Detalle del Evento"}
                </DialogTitle>
                <DialogDescription className="text-[10px] md:text-xs font-mono text-slate-500 flex items-center gap-2 mt-1">
                  <span className="truncate">ID: {log?.id}</span>
                  <Copy 
                    size={12} 
                    className="cursor-pointer hover:text-blue-500 shrink-0" 
                    onClick={() => copyToClipboard(log?.id || "")} 
                  />
                </DialogDescription>
              </div>
            </div>
            <div className="hidden sm:block">
              {log && getSeverityBadge(log.severity)}
            </div>
          </div>
        </DialogHeader>

        {/* CUERPO CON SCROLL */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white dark:bg-slate-950">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-sm text-slate-500 font-medium">Cargando evidencia técnica...</p>
            </div>
          ) : log && (
            <div className="space-y-6">
              {/* FILA 1: TIEMPOS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b pb-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Clock size={12} /> Ocurrido (UTC)
                  </span>
                  <p className="text-xs md:text-sm font-semibold">
                    {log.occurredAtUtc ? new Date(log.occurredAtUtc).toLocaleString() : "---"}
                  </p>
                </div>
                <div className="space-y-1 border-slate-100 dark:border-slate-800 sm:border-x sm:px-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Calendar size={12} /> Recibido (UTC)
                  </span>
                  <p className="text-xs md:text-sm font-semibold">
                    {log.receivedAtUtc ? new Date(log.receivedAtUtc).toLocaleString() : "---"}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Info size={12} /> Fuente
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-[9px] uppercase font-bold">{log.source}</Badge>
                    <span className="text-[10px] font-mono text-slate-500 break-all">{log.payload?.routeOrLocation || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* FILA 2: USUARIO Y TRAZA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <User size={18} className="text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Actor</p>
                    <p className="text-sm font-bold truncate">{log.userName || "Sistema Interno"}</p>
                    <p className="text-[10px] text-slate-500 font-mono truncate">{log.userId || "service-account"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 md:border-l md:pl-4 border-slate-200 dark:border-slate-700">
                  <Fingerprint size={18} className="text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0 w-full">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Trazabilidad</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] text-slate-500 font-bold uppercase">Trace ID</span>
                        <span className="text-[10px] font-mono truncate text-blue-600" >{log.traceId}</span>
                        <Copy 
                          size={12} 
                          className="cursor-pointer hover:text-blue-500 mt-1" 
                          onClick={() => copyToClipboard(log.traceId || "")} 
                        />
                        
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] text-slate-500 font-bold uppercase">Correlation</span>
                        <span className="text-[10px] font-mono truncate text-slate-600">{log.correlationId}</span>
                        <Copy 
                          size={12} 
                          className="cursor-pointer hover:text-slate-600 mt-1" 
                          onClick={() => copyToClipboard(log.correlationId || "")} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN TÉCNICA */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                  <h4 className="text-xs font-bold text-slate-600 uppercase">Excepción</h4>
                  <span className="text-[9px] md:text-[10px] font-mono text-red-500 font-bold break-all">
                    {log.payload?.exceptionType}
                  </span>
                </div>
                
                {log.payload?.stackTop && (
                  <div className="space-y-2">
                    <div className="grid-cols-1 sm:grid-cols-3 gap-4 flex items-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Stack Trace</p>
                      <span className="text-[9px] md:text-[10px] font-mono text-slate-500 break-all">Copiar StockTrace</span>
                      <Copy 
                        size={12} 
                        className="cursor-pointer hover:text-blue-500 mb-1" 
                        onClick={() => copyToClipboard(log.payload?.stackTop?.join("\n") || "")} 
                      />
                    </div>
                    <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
                      <div className="max-h-48 overflow-y-auto space-y-2 custom-scrollbar">
                        {log.payload.stackTop.map((line: string, idx: number) => (
                          <div key={idx} className="text-[9px] md:text-[10px] font-mono text-slate-400 leading-tight break-words">
                            <span className="text-blue-500 mr-2">[{idx + 1}]</span>{line}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">JSON Payload</p>
                  <div className="relative group">
                    <pre className="p-4 rounded-lg bg-slate-900 text-emerald-400 text-[10px] md:text-[11px] overflow-x-auto border border-slate-800 font-mono max-h-60 overflow-y-auto">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="absolute top-2 right-2 h-7 px-2 text-[10px] opacity-100 md:opacity-0 md:group-hover:opacity-100 bg-slate-300"
                      onClick={() => copyToClipboard(JSON.stringify(log.payload, null, 2))}
                    >
                      Copiar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t flex justify-end">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cerrar Inspección
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}