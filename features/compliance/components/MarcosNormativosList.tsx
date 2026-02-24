"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarcoNormativoDto } from "../services/compliance.service";

interface MarcoNormativoListProps {
  marcos: MarcoNormativoDto[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddClick: () => void;
}

export function MarcoNormativoList({ 
  marcos, 
  selectedId, 
  onSelect, 
  onAddClick 
}: MarcoNormativoListProps) {
  // Estados internos de UI
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Lógica de filtrado
  const filteredFullList = marcos
    .filter((m) => showInactive || m.isActive !== false)
    .filter((m) =>
      m.nombre.toLowerCase().includes(search.toLowerCase()) ||
      m.codigo?.toLowerCase().includes(search.toLowerCase())
    );

  const totalCount = filteredFullList.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedList = filteredFullList.slice((page - 1) * pageSize, page * pageSize);

  // Reset a pág 1 si cambian filtros
  useEffect(() => {
    setPage(1);
  }, [search, showInactive]);

  return (
    <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0">
      <Button 
        onClick={onAddClick} 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm py-6"
      >
        <Plus className="h-4 w-4 mr-2" /> Nuevo Marco
      </Button>

      <Card className="shadow-sm border-gray-200 flex flex-col overflow-hidden">
        <CardContent className="p-3 space-y-3 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar marco..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-gray-50/50 border-none focus-visible:ring-1"
            />
          </div>

          <div className="flex items-center justify-between px-1">
            <Label htmlFor="side-inactive" className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
              Mostrar inactivos
            </Label>
            <Switch 
              id="side-inactive" 
              checked={showInactive} 
              onCheckedChange={setShowInactive} 
              className="scale-75" 
            />
          </div>

          <div className="space-y-1.5 min-h-[400px] max-h-[500px] overflow-y-auto pr-1">
            {paginatedList.length > 0 ? (
              paginatedList.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelect(m.id)}
                  className={cn(
                    "group relative p-4 rounded-xl cursor-pointer transition-all border",
                    selectedId === m.id
                      ? "bg-blue-50/50 border-blue-200 ring-1 ring-blue-200/50"
                      : "bg-white hover:bg-gray-50 border-transparent shadow-sm"
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <span className={cn("text-xs font-bold font-mono tracking-tight", selectedId === m.id ? "text-blue-600" : "text-gray-500")}>
                      {m.codigo}
                    </span>
                    <h3 className={cn("text-sm font-semibold line-clamp-1", selectedId === m.id ? "text-blue-900" : "text-gray-900")}>
                      {m.nombre}
                    </h3>
                  </div>
                  {selectedId === m.id && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <ChevronRight className="h-4 w-4 text-blue-500" />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-muted-foreground text-xs">
                No se encontraron resultados
              </div>
            )}
          </div>
        </CardContent>

        {/* PAGINACIÓN */}
        <div className="p-3 border-t bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-bold uppercase">
              Total: {totalCount}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Ver</span>
              <select 
                title="Items por página"
                value={pageSize} 
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="text-xs bg-transparent font-bold focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button 
              variant="outline" size="icon" className="h-7 w-7"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={14} />
            </Button>
            
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-blue-600">{page}</span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs text-slate-400">{totalPages || 1}</span>
            </div>

            <Button 
              variant="outline" size="icon" className="h-7 w-7"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || totalPages === 0}
            >
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}