"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronRight,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DofaAnalysisListDto } from "@/feature/planning/api/dofa";
import {
  useDofaAnalysesQuery,
  useDofaDeleteAnalysisMutation,
} from "@/feature/planning/hooks/use-dofa";

// ---------------------------------------------------------------------------
// Progress bar (client-side heuristic while backend gap exists)
// ---------------------------------------------------------------------------

/** Returns 0–100 based on item count in the list DTO (no phase detail available at list level). */
function deriveProgress(analysis: DofaAnalysisListDto): number {
  const status = analysis.status ?? "draft";
  if (status === "approved") return 100;
  if (status === "in_review") return 66;
  if (status === "draft") return 33;
  return 0;
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  in_review: "En revisión",
  approved: "Aprobado",
  archived: "Archivado",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  draft: "secondary",
  in_review: "default",
  approved: "outline",
  archived: "destructive",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = {
  organizationId: string;
  onSelect: (analysisId: string) => void;
  onCreateClick: () => void;
};

export function DofaList({ organizationId, onSelect, onCreateClick }: Props) {
  const { data: allAnalyses = [], isLoading } = useDofaAnalysesQuery();
  const deleteMutation = useDofaDeleteAnalysisMutation();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const analyses = useMemo(() => {
    let result = allAnalyses.filter(
      (a) => a.entityType === "Organization" && a.entityId === organizationId,
    );
    if (statusFilter !== "all") {
      result = result.filter((a) => (a.status ?? "draft") === statusFilter);
    }
    return [...result].sort((a, b) => {
      const ad = a.analysisDate ? new Date(a.analysisDate).getTime() : 0;
      const bd = b.analysisDate ? new Date(b.analysisDate).getTime() : 0;
      return bd - ad;
    });
  }, [allAnalyses, organizationId, statusFilter]);

  const deletingAnalysis = allAnalyses.find((a) => a.id === deletingId) ?? null;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando análisis...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Todos los estados" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <Button onClick={onCreateClick} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Nuevo análisis
          </Button>
        </div>
      </div>

      {/* List */}
      {analyses.length === 0 ? (
        <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
          {statusFilter === "all"
            ? "No hay análisis DOFA para esta organización."
            : "No hay análisis con ese estado."}
        </div>
      ) : (
        <div className="space-y-2">
          {analyses.map((a) => {
            const progress = deriveProgress(a);
            const status = a.status ?? "draft";
            return (
              <div
                key={a.id}
                className="flex items-center gap-4 rounded-lg border bg-card px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => onSelect(a.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-sm truncate">{a.title}</span>
                    <Badge variant={STATUS_VARIANTS[status] ?? "secondary"}>
                      {STATUS_LABELS[status] ?? status}
                    </Badge>
                  </div>
                  {a.period && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {a.period}
                    </div>
                  )}
                  {/* Progress bar */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right shrink-0">
                      {progress}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(a.id);
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirm */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar análisis</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingAnalysis
                ? `¿Eliminar "${deletingAnalysis.title}"? Esta acción no se puede deshacer.`
                : "¿Eliminar este análisis? Esta acción no se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingId(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={async () => {
                if (!deletingId) return;
                const ok = await deleteMutation.mutateAsync(deletingId);
                if (ok) setDeletingId(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
