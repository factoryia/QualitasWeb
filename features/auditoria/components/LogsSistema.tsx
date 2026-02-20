"use client";
import { useEffect, useState, useCallback } from "react";
import { 
  auditService, 
  AuditItemDto,
  AuditDetailDto 
} from "@/features/auditoria/services/auditoria.service";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Calendar
} from "lucide-react";
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

  // NUEVOS ESTADOS PARA FILTROS
  const [searchTerm, setSearchTerm] = useState("");
  const [logTypeFilter, setlogTypeFilter] = useState("all");

  // Estados para el detalle del Log
  const [selectedLog, setSelectedLog] = useState<AuditDetailDto | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let data: AuditItemDto[] = [];
      let total = 0;

      if (logTypeFilter === "all") {
        // ESCENARIO A: Paginación de servidor
        const res = await auditService.getAudits(page, pageSize);
        if (res) {
          data = res.items;
          total = res.totalCount;
        }
      } else {
        // ESCENARIO B: Paginación de cliente (Seguridad o Excepciones)
        let fullData: AuditItemDto[] = [];
        
        if (logTypeFilter === "security") {
          fullData = await auditService.getSecurityAudits();
        } else if (logTypeFilter === "exception") {
          fullData = await auditService.getExceptionAudits();
        }

        // 1. Filtramos localmente por el buscador si hay texto
        const filtered = fullData.filter(log => 
          log.traceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.correlationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.userName?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        total = filtered.length;
        
        // 2. "Paginamos" manualmente el array
        const startIndex = (page - 1) * pageSize;
        data = filtered.slice(startIndex, startIndex + pageSize);
      }

      setLogs(data);
      setTotalCount(total);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, logTypeFilter, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Handlers para UI ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset a pág 1 cuando buscas
  };

  const handleSeverityChange = (value: string) => {
    setlogTypeFilter(value);
    setPage(1); // Reset a pág 1 cuando cambias filtro
  };

  // Función para abrir y cargar el detalle
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  
  };
  // Cambiar el tipo por un nombre intuitivo apenas se sepa qué representa cada número en la severidad.
  const getSeverityBadge = (severity: number) => {
    switch (severity) {
      case 5: return <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200 font-bold">Tipo 5</Badge>;
      case 4: return <Badge variant="outline" className="text-purple-600 bg-purple-50 border-purple-200">Tipo 4</Badge>;
      case 3: return <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">Tipo 3</Badge>;
      case 2: return <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">Tipo 2</Badge>;
      case 1: return <Badge variant="outline" className="text-pink-400 bg-pink-50 border-pink-200">Tipo 1</Badge>;
      default: return <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">Nulo</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* FILTROS Y BUSCADOR */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar por TraceID, Correlation o Usuario..." 
              className="pl-9" 
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={logTypeFilter} onValueChange={handleSeverityChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Severidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="security">Seguridad</SelectItem>
                <SelectItem value="exception">Excepciones</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 text-slate-600">
              <Calendar size={16} /> Rango UTC
            </Button>
          </div>
        </div>
      {/* LLAMADA A LA TABLA */}
      <LogsTabla 
        logs={logs}
        loading={loading}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage} // Setea la página directamente
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1); // Reinicia a página 1 si cambia el tamaño
        }}
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