/*
//NO EN USO POR AHORA, MAÑANA LO REVISAMOS PARA VER SI LO USAMOS O LO BORRAMOS
"use client";

import { useEffect, useState } from "react";
import { Search, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface LogsFiltrosProps {
  filterType: string;
  onFilterChange: (value: string) => void;
  onSearchChange: (value: string) => void; // Nueva prop
}

export function LogsFiltros({ filterType, onFilterChange, onSearchChange }: LogsFiltrosProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Lógica de Debounce: Espera 500ms después de que dejes de escribir
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearchChange(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onSearchChange]);

  return (
    <div className="flex flex-col md:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Buscar por TraceID, Correlation o Usuario..." 
          className="pl-9" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <Select value={filterType} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Severidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="5">Seguridad</SelectItem>
            <SelectItem value="2">Excepciones</SelectItem>
          </SelectContent>
        </Select>
        
        <Button variant="outline" className="gap-2 text-slate-600">
          <Calendar size={16} /> Rango UTC
        </Button>
      </div>
    </div>
  );
}
*/