"use client";

import { useEffect, useState, useMemo } from "react";
import {
  auditService,
  type AuditDetailDto,
  type AuditQueryParams,
} from "@/features/auditoria/services/auditoria.service";
import { useAuditsQuery } from "@/features/auditoria/hooks/use-auditoria-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LogDetailModal } from "./LogsDetailsModal";
import { LogsTabla } from "./LogsTabla";

import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/calendarRangePicker";

export function SystemLogs() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchField, setSearchField] = useState<keyof AuditQueryParams>("Search");
  const [logTypeFilter, setlogTypeFilter] = useState("all");
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 600);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const [selectedLog, setSelectedLog] = useState<AuditDetailDto | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const queryParams = useMemo<AuditQueryParams>(() => {
  // 1. Iniciamos con los parámetros básicos (Paginación)
  const params: AuditQueryParams = {
    PageNumber: page,
    PageSize: pageSize,
  };

  // 2. Agregamos búsqueda por texto si existe
  if (debouncedSearch.trim()) {
    params[searchField] = debouncedSearch.trim() as any;
  }

  // 3. Agregamos filtros de severidad (Selects)
  if (logTypeFilter === "security") params.Severity = 3;
  else if (logTypeFilter === "exception") params.Severity = 5;

  // 4. LÓGICA DE RANGO: Aquí está el "truco"
  // Si solo seleccionas 'from', params.FromUtc NO se crea.
  // Solo cuando 'to' tiene valor, ambos se adjuntan al objeto.
  if (date?.from && date?.to) {
    params.FromUtc = date.from.toISOString();
    
    // Opcional: Ajustar el final del día para incluir registros hasta las 23:59:59
    const endOfDay = new Date(date.to);
    endOfDay.setHours(23, 59, 59, 999);
    
    params.ToUtc = endOfDay.toISOString();
  }

  return params;
  
  // No olvides incluir 'date' en las dependencias para que el memo se recalcule
}, [page, pageSize, debouncedSearch, searchField, logTypeFilter, date]);

  const { data, isFetching, isPending } = useAuditsQuery(queryParams);
  const logs = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const loading = isFetching || isPending;

  // --- Handlers ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleViewDetail = async (id: string) => {
    setIsDialogOpen(true);
    setIsDetailLoading(true);
    try {
      const detail = await auditService.getAuditById(id);
      setSelectedLog(detail);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const getSeverityBadge = (severity: number) => {
    const styles: Record<number, string> = {
      5: "text-red-600 bg-red-50 border-red-200 font-bold",
      4: "text-purple-600 bg-purple-50 border-purple-200",
      3: "text-blue-600 bg-blue-50 border-blue-200",
      2: "text-amber-600 bg-amber-50 border-amber-200",
      1: "text-pink-400 bg-pink-50 border-pink-200",
    };
    return (
      <Badge variant="outline" className={styles[severity] || "text-emerald-600 bg-emerald-50 border-emerald-200"}>
        {severity ? `Tipo ${severity}` : "Nulo"}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        {/* BUSCADOR DINÁMICO */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder={`Buscar por ${searchField}...`} 
            className="pl-9" 
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* SELECT PARA ELEGIR CAMPO DE BÚSQUEDA */}
          <Select value={searchField as string} onValueChange={(val) => { setSearchField(val as keyof AuditQueryParams); setPage(1); }}>
            <SelectTrigger className="w-[160px] bg-slate-50">
              <SelectValue placeholder="Campo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Search">Sin filtro</SelectItem>
              <SelectItem value="TraceId">Trace ID</SelectItem>
              <SelectItem value="CorrelationId">Correlation ID</SelectItem>
              <SelectItem value="TenantId">Tenant ID</SelectItem>
              <SelectItem value="UserId">User ID</SelectItem>
            </SelectContent>
          </Select>

          {/* SELECT PARA FILTRO DE SEVERIDAD */}
          <Select value={logTypeFilter} onValueChange={(v) => { setlogTypeFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Severidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los registros</SelectItem>
              <SelectItem value="security">Seguridad</SelectItem>
              <SelectItem value="exception">Excepciones</SelectItem>
            </SelectContent>
          </Select>

          <DatePickerWithRange 
            date={date} 
            setDate={(newDate) => {
              setDate(newDate);
              setPage(1); // Importante: volver a la página 1 al filtrar
            }} 
          />
        </div>
      </div>

      <LogsTabla 
        logs={logs}
        loading={loading}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        onViewDetail={handleViewDetail}
        getSeverityBadge={getSeverityBadge}
      />

      <LogDetailModal 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        log={selectedLog}
        isLoading={isDetailLoading}
        getSeverityBadge={getSeverityBadge}
      />
    </div>
  );
}