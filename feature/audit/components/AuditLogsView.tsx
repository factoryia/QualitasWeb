"use client";

import { useState } from "react";
import { useAuditList, useAuditDetail } from "../hooks/use-audit";
import { AuditLogsTable } from "./AuditLogsTable";
import { AuditLogDetailDialog } from "./AuditLogDetailDialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";
import { AuditEventType, AuditSeverity } from "../types";
import { useDebounce } from "@/hooks/use-debounce";
import { DatePickerWithRange } from "@/components/ui/calendarRangePicker";
import { type DateRange } from "react-day-picker";
import { getSeverityBadge } from "../utils";

export function AuditLogsView() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [eventType, setEventType] = useState<AuditEventType | undefined>(undefined);
  const [severity, setSeverity] = useState<AuditSeverity | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data, isLoading } = useAuditList({
    pageNumber: page,
    pageSize: 10,
    search: debouncedSearch || undefined,
    eventType: eventType,
    severity: severity,
    fromUtc: dateRange?.from?.toISOString(),
    toUtc: dateRange?.to?.toISOString(),
    sort: "occurredAtUtc desc",
  });

  const { data: logDetail, isLoading: isLoadingDetail } = useAuditDetail(selectedAuditId || "");

  const handleViewDetail = (id: string) => {
    setSelectedAuditId(id);
    setIsModalOpen(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleTypeChange = (value: string) => {
    if (value === "all") {
      setEventType(undefined);
    } else {
      const typeNum = parseInt(value, 10);
      setEventType(typeNum as AuditEventType);
    }
    setPage(1);
  };

  const handleSeverityChange = (value: string) => {
    if (value === "all") {
      setSeverity(undefined);
    } else {
      const sevNum = parseInt(value, 10);
      setSeverity(sevNum as AuditSeverity);
    }
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setEventType(undefined);
    setSeverity(undefined);
    setDateRange(undefined);
    setPage(1);
  };

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por usuario, acción..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-9"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <Select
            value={severity?.toString() || "all"}
            onValueChange={handleSeverityChange}
          >
            <SelectTrigger className="w-[160px] bg-slate-50 dark:bg-slate-900/50">
              <SelectValue placeholder="Sin filtro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Sin filtro</SelectItem>
              <SelectItem value="3">Information</SelectItem>
              <SelectItem value="4">Warning</SelectItem>
              <SelectItem value="5">Error</SelectItem>
              <SelectItem value="6">Critical</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={eventType?.toString() || "all"}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Todos los registros" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los registros</SelectItem>
              <SelectItem value="1">Cambio de Entidad</SelectItem>
              <SelectItem value="2">Seguridad</SelectItem>
              <SelectItem value="3">Actividad</SelectItem>
              <SelectItem value="4">Excepción</SelectItem>
            </SelectContent>
          </Select>

          <DatePickerWithRange 
            date={dateRange} 
            setDate={(date) => {
              setDateRange(date);
              setPage(1);
            }} 
            className="w-full sm:w-auto"
          />

          {(searchTerm || eventType !== undefined || severity !== undefined || dateRange !== undefined) && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={clearFilters}
              className="h-10 w-10 text-muted-foreground hover:text-foreground shrink-0"
              title="Limpiar filtros"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <AuditLogsTable
        data={data}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
        onViewDetail={handleViewDetail}
      />

      <AuditLogDetailDialog
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        log={logDetail || null}
        isLoading={isLoadingDetail}
        getSeverityBadge={getSeverityBadge}
      />
    </div>
  );
}
