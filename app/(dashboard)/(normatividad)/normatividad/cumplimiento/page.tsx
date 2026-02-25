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
} from "@/components/ui/dropdown-menu";
import { useMarcosNormativosQuery } from "@/features/compliance/hooks/use-marcos-normativos-query";
import { useClausulasByMarcoQuery } from "@/features/compliance/hooks/use-clausulas-query";
import {
  ComplianceTable,
  ComplianceTableSkeleton,
  ComplianceDetailSheet,
  ComplianceEditDialog,
  COMPLIANCE_STATUSES,
  type ClauseRow,
  type ComplianceEditData,
} from "@/features/compliance/components/compliance-matrix";
import toast from "react-hot-toast";
import { DropdownMenuCheckboxItem } from "@radix-ui/react-dropdown-menu";

/** Declaraciones en memoria (sin API de declaraciones aún) */
type DeclarationsState = Record<
  string,
  Omit<ClauseRow, "id" | "number" | "title">
>;

const defaultDeclaration = (): Omit<
  ClauseRow,
  "id" | "number" | "title"
> => ({
  status: "pendiente",
  how_it_complies: null,
  linked_processes: [],
  linked_documents: [],
  findings_count: 0,
  declaration_id: null,
});

export default function CumplimientoPage() {
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [selectedClause, setSelectedClause] = useState<ClauseRow | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [declarations, setDeclarations] = useState<DeclarationsState>({});

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
      const decl = declarations[c.id] ?? defaultDeclaration();
      return {
        id: c.id,
        number: c.numeroClausula,
        title: c.titulo,
        ...decl,
      };
    });
  }, [clausulas, declarations]);

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

  const selectedFrameworkName =
    frameworks.find((f) => f.id === selectedFrameworkId)?.nombre ?? "";

  const handleRowClick = (row: ClauseRow) => {
    setSelectedClause(row);
    setSheetOpen(true);
  };

  const handleSave = async (data: ComplianceEditData) => {
    if (!selectedClause) return;
    setSaving(true);
    try {
      setDeclarations((prev) => ({
        ...prev,
        [selectedClause.id]: {
          ...data,
          status: data.status,
          how_it_complies: data.how_it_complies,
          linked_processes: data.linked_processes,
          linked_documents: data.linked_documents,
          findings_count: selectedClause.findings_count,
          declaration_id: selectedClause.declaration_id,
        },
      }));
      setSelectedClause((prev) =>
        prev
          ? {
              ...prev,
              ...data,
              how_it_complies: data.how_it_complies,
              linked_processes: data.linked_processes,
              linked_documents: data.linked_documents,
            }
          : null
      );
      toast.success("Declaración actualizada correctamente.");
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const isLoading = loadingClauses && !!selectedFrameworkId;

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-1 sm:px-0">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-foreground">
          Matriz Transversal de Cumplimiento
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Verifique cómo los procesos, documentos e indicadores dan respuesta a
          la normatividad.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-3">
        <div className="flex items-center gap-2 border-r pr-3">
          <span className="text-xs font-semibold uppercase text-muted-foreground">
            Marco:
          </span>
          <Select
            value={selectedFrameworkId}
            onValueChange={setSelectedFrameworkId}
            disabled={loadingMarcos || frameworks.length === 0}
          >
            <SelectTrigger className="w-48 h-8 text-xs font-semibold">
              <SelectValue placeholder="Seleccione marco" />
            </SelectTrigger>
            <SelectContent>
              {frameworks.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.codigo || f.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-[200px] rounded-md border bg-background px-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cláusula o requisito..."
            className="border-0 h-8 shadow-none focus-visible:ring-0 text-xs min-w-0"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
            >
              <Filter className="h-3.5 w-3.5" /> Estado
              {statusFilter.length > 0 && ` (${statusFilter.length})`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {COMPLIANCE_STATUSES.map((s) => (
              <DropdownMenuCheckboxItem
                key={s.value}
                checked={statusFilter.includes(s.value)}
                onCheckedChange={(checked) =>
                  setStatusFilter((prev) =>
                    checked
                      ? [...prev, s.value]
                      : prev.filter((v) => v !== s.value)
                  )
                }
              >
                {s.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <ComplianceTableSkeleton />
      ) : (
        <ComplianceTable rows={filteredRows} onRowClick={handleRowClick} />
      )}

      <ComplianceDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        data={selectedClause}
        frameworkName={selectedFrameworkName}
        onEdit={() => {
          setSheetOpen(false);
          setEditOpen(true);
        }}
      />

      {selectedClause && (
        <ComplianceEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          clauseTitle={selectedClause.title}
          clauseNumber={selectedClause.number}
          initialData={{
            status: selectedClause.status,
            how_it_complies: selectedClause.how_it_complies,
            linked_processes: selectedClause.linked_processes,
            linked_documents: selectedClause.linked_documents,
          }}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}
