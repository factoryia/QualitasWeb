"use client";

import { useMemo, useState } from "react";
import { Building2, Filter, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { DofaAnalysisListDto } from "@/feature/planning/api/dofa";
import {
  useDofaAnalysesQuery,
} from "@/feature/planning/hooks/use-dofa";
import { ENTITY_TYPES } from "./dofa-constants";
import { CreateAnalysisDialog } from "./create-analysis-dialog";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type V2Status = "borrador" | "activo" | "cerrado";

function toV2Status(status: string | null | undefined): V2Status {
  if (!status || status === "draft") return "borrador";
  if (status === "archived") return "cerrado";
  return "activo"; // in_review | approved
}

const V2_STATUS_CONFIG: Record<V2Status, { label: string; className: string }> = {
  borrador: { label: "Borrador", className: "bg-muted text-muted-foreground" },
  activo: { label: "Activo", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  cerrado: { label: "Cerrado", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusChip({ status }: { status: string | null | undefined }) {
  const v2 = toV2Status(status);
  const cfg = V2_STATUS_CONFIG[v2];
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", cfg.className)}>
      {cfg.label}
    </span>
  );
}

function ProgressMini({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="flex items-center gap-2">
      <div className="w-[70px] h-[5px] bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-green-500 dark:bg-green-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-green-700 dark:text-green-400 tabular-nums">{pct}%</span>
    </div>
  );
}

function deriveProgress(a: DofaAnalysisListDto): number {
  const s = a.status ?? "draft";
  if (s === "approved") return 100;
  if (s === "in_review") return 66;
  return 33;
}

function entityLabel(entityType: string | null | undefined) {
  return (
    ENTITY_TYPES.find(
      (t) => t.value.toLowerCase() === (entityType ?? "").toLowerCase(),
    )?.label ?? "Organización"
  );
}

// ---------------------------------------------------------------------------
// DofaList
// ---------------------------------------------------------------------------

type Props = {
  onSelect: (analysisId: string) => void;
};

export function DofaList({ onSelect }: Props) {
  const { data: analyses = [], isLoading } = useDofaAnalysesQuery();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | V2Status>("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    return analyses.filter((a) => {
      const title = a.title ?? "";
      if (search && !title.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== "all" && toV2Status(a.status) !== statusFilter) return false;
      if (
        entityFilter !== "all" &&
        (a.entityType ?? "Organization").toLowerCase() !== entityFilter.toLowerCase()
      )
        return false;
      return true;
    });
  }, [analyses, search, statusFilter, entityFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Análisis de Contexto</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestione los análisis DOFA de su organización
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Nuevo análisis
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="borrador">Borrador</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="cerrado">Cerrado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[200px]">
            <Building2 className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las entidades</SelectItem>
            {ENTITY_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value.toLowerCase()}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Entidad</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Avance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  {analyses.length === 0
                    ? "No hay análisis creados aún"
                    : "No se encontraron resultados"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((a) => (
                <TableRow
                  key={a.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelect(a.id)}
                >
                  <TableCell className="font-medium">{a.title || "Análisis DOFA"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{entityLabel(a.entityType)}</TableCell>
                  <TableCell className="text-sm">
                    {a.period ?? <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">—</TableCell>
                  <TableCell><StatusChip status={a.status} /></TableCell>
                  <TableCell><ProgressMini value={deriveProgress(a)} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CreateAnalysisDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={onSelect}
      />
    </div>
  );
}
