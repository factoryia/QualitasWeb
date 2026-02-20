"use client";
import { useEffect, useState, useCallback } from "react";
import { 
  auditService, 
  AuditItemDto, 
  AuditDetailDto, 
  AuditQueryParams 
} from "@/features/auditoria/services/auditoria.service";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Calendar } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { LogDetailModal } from "./LogsDetailsModal";
import { LogsTabla } from "./LogsTabla";

export function SystemLogs() {
  const [logs, setLogs] = useState<AuditItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // --- NUEVOS ESTADOS DE BÚSQUEDA ---
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // Estado para saber qué campo del Query Parameter afectar (Search por defecto)
  const [searchField, setSearchField] = useState<keyof AuditQueryParams>("Search");
  
  // Estado para el filtro de severidad/tipo
  const [logTypeFilter, setlogTypeFilter] = useState("all");

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 600); // 600ms es un buen equilibrio
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Estados para el detalle
  const [selectedLog, setSelectedLog] = useState<AuditDetailDto | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Parámetros base
      const queryParams: AuditQueryParams = {
        PageNumber: page,
        PageSize: pageSize,
      };

      // 2. Aplicamos la búsqueda al campo seleccionado
      if (debouncedSearch.trim()) {
        const term = debouncedSearch.trim();
        // Usamos la llave dinámica elegida en el Select (Search, TraceId, CorrelationId, etc.)
        queryParams[searchField] = term as any; 
      }

      // 3. Filtros predefinidos (Severity/EventType)
      if (logTypeFilter === "security") {
        queryParams.Severity = 3;
      } else if (logTypeFilter === "exception") {
        queryParams.Severity = 5;
      }

      const res = await auditService.getAudits(queryParams);
      if (res) {
        setLogs(res.items);
        setTotalCount(res.totalCount);
      }
    } catch (error) {
      console.error("Error en fetchData:", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, logTypeFilter, debouncedSearch, searchField]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
          <Select value={searchField as string} onValueChange={(val) => setSearchField(val as any)}>
            <SelectTrigger className="w-[160px] bg-slate-50">
              <SelectValue placeholder="Campo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Search">General (Search)</SelectItem>
              <SelectItem value="TraceId">Trace ID</SelectItem>
              <SelectItem value="CorrelationId">Correlation ID</SelectItem>
              <SelectItem value="TenantId">Tenant ID</SelectItem>
              <SelectItem value="UserId">User ID</SelectItem>
              <SelectItem value="Source">Source</SelectItem>
            </SelectContent>
          </Select>

          {/* SELECT PARA FILTRO DE SEVERIDAD */}
          <Select value={logTypeFilter} onValueChange={setlogTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Severidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los registros</SelectItem>
              <SelectItem value="security">Seguridad</SelectItem>
              <SelectItem value="exception">Excepciones</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2 text-slate-600">
            <Calendar size={16} /> Rango UTC
          </Button>
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