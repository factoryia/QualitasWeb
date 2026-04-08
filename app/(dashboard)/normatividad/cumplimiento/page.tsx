"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { useMarcosNormativosQuery } from "@/feature/compliance/hooks/use-marcos-normativos-query";
import { useClausulasByMarcoQuery } from "@/feature/compliance/hooks/use-clausulas-query";
import {
  ComplianceTable,
  ComplianceTableSkeleton,
  ComplianceDetailSheet,
  ComplianceEditDialog,
  COMPLIANCE_STATUSES,
  type ClauseRow,
  type ComplianceEditData,
} from "@/feature/compliance/components/compliance-matrix";
import toast from "react-hot-toast";

export default function CumplimientoPage() {
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [selectedClause, setSelectedClause] = useState<ClauseRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: marcos = [], isLoading: loadingMarcos } =
    useMarcosNormativosQuery(true);
  const { data: clausulas = [], isLoading: loadingClauses } =
    useClausulasByMarcoQuery(selectedFrameworkId || null);

  const frameworks = marcos;

  useEffect(() => {
    if (frameworks.length > 0 && !selectedFrameworkId && !loadingMarcos) {
      setSelectedFrameworkId(frameworks[0].id);
    }
  }, [frameworks.length, selectedFrameworkId, loadingMarcos, frameworks]);

  const rows: ClauseRow[] = useMemo(() => {
    return clausulas.map((c) => {
      return {
        id: c.id,
        number: c.clauseNumber,
        title: c.title,
        status: "pendiente",
        how_it_complies: null,
        linked_processes: [],
        linked_documents: [],
        findings_count: 0,
        declaration_id: null,
      };
    });
  }, [clausulas]);

  const filteredRows = useMemo(() => {
    let result = rows;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.number.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q)
      );
    }
    if (statusFilter.length > 0) {
      result = result.filter((c) => statusFilter.includes(c.status));
    }
    return result;
  }, [rows, search, statusFilter]);

  const selectedFrameworkName = useMemo(() => {
    return (
      frameworks.find((f) => f.id === selectedFrameworkId)?.code ?? "Norma"
    );
  }, [frameworks, selectedFrameworkId]);

  const handleRowClick = (row: ClauseRow) => {
    setSelectedClause(row);
    setSheetOpen(true);
  };

  const handleEditClick = () => {
    setEditOpen(true);
  };

  const handleSave = async (data: ComplianceEditData) => {
    if (!selectedClause) return;
    setSaving(true);
    try {
      // TODO: Implementar llamada a API real
      console.log("Guardando declaración:", data);
      toast.success("Funcionalidad pendiente de API");
      
      setEditOpen(false);
      setSheetOpen(false);
    } catch (error) {
        console.error(error);
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 px-1 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
            Matriz de Cumplimiento
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Evalúe el cumplimiento de los requisitos normativos.
          </p>
        </div>
        <div className="w-full sm:w-[280px]">
           <Select
            value={selectedFrameworkId}
            onValueChange={setSelectedFrameworkId}
            disabled={loadingMarcos}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione un marco..." />
            </SelectTrigger>
            <SelectContent>
              {frameworks.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.code} - {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar requisito..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar Estado
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
             {COMPLIANCE_STATUSES.map((status) => (
              <DropdownMenuCheckboxItem
                key={status.value}
                checked={statusFilter.includes(status.value)}
                onCheckedChange={(checked) => {
                  setStatusFilter((prev) =>
                    checked
                      ? [...prev, status.value]
                      : prev.filter((k) => k !== status.value)
                  );
                }}
              >
                {status.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border bg-card">
        {loadingClauses ? (
          <ComplianceTableSkeleton />
        ) : (
          <ComplianceTable
            rows={filteredRows}
            onRowClick={handleRowClick}
          />
        )}
      </div>

      <ComplianceDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        clause={selectedClause}
        frameworkName={selectedFrameworkName}
        onEdit={handleEditClick}
      />

      <ComplianceEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        clauseTitle={selectedClause?.title ?? ""}
        clauseNumber={selectedClause?.number ?? ""}
        initialData={
          selectedClause
            ? {
                status: selectedClause.status,
                how_it_complies: selectedClause.how_it_complies,
                linked_processes: selectedClause.linked_processes,
                linked_documents: selectedClause.linked_documents,
              }
            : {
                status: "pendiente",
                how_it_complies: "",
                linked_processes: [],
                linked_documents: [],
              }
        }
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}
