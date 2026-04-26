"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Clock,
  Pencil,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useDofaAnalysisQuery,
  useDofaUpdateAnalysisMutation,
} from "@/feature/planning/hooks/use-dofa";
import { DofaDiagnostico } from "./dofa-diagnostico";

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

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

const NEXT_STATUS: Record<string, string> = {
  draft: "in_review",
  in_review: "approved",
};

const NEXT_STATUS_LABEL: Record<string, string> = {
  draft: "Enviar a revisión",
  in_review: "Aprobar",
};

// ---------------------------------------------------------------------------
// Edit-analysis dialog (title, description, period)
// ---------------------------------------------------------------------------

type EditDraft = { title: string; description: string; period: string };

type EditDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  draft: EditDraft;
  onChange: (patch: Partial<EditDraft>) => void;
  onSave: () => void;
  isBusy: boolean;
};

function EditAnalysisDialog({
  open,
  onOpenChange,
  draft,
  onChange,
  onSave,
  isBusy,
}: EditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Editar análisis</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={draft.title}
              onChange={(e) => onChange({ title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Periodo</Label>
            <Input
              value={draft.period}
              onChange={(e) => onChange({ period: e.target.value })}
              placeholder="2026"
            />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={draft.description}
              onChange={(e) => onChange({ description: e.target.value })}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isBusy}
          >
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={isBusy || !draft.title.trim()}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// DofaDetail
// ---------------------------------------------------------------------------

type Props = {
  analysisId: string;
  onBack: () => void;
};

export function DofaDetail({ analysisId, onBack }: Props) {
  const analysisQuery = useDofaAnalysisQuery(analysisId);
  const updateMutation = useDofaUpdateAnalysisMutation();

  const [editOpen, setEditOpen] = useState(false);
  const [editDraft, setEditDraft] = useState<EditDraft>({
    title: "",
    description: "",
    period: "",
  });

  const openEdit = () => {
    const a = analysisQuery.data;
    if (!a) return;
    setEditDraft({
      title: a.title,
      description: a.description ?? "",
      period: a.period ?? "",
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    const a = analysisQuery.data;
    if (!a) return;
    const ok = await updateMutation.mutateAsync({
      analysisId,
      payload: {
        title: editDraft.title.trim(),
        description: editDraft.description.trim() || null,
        period: editDraft.period.trim() || null,
        status: a.status ?? "draft",
      },
    });
    if (ok) setEditOpen(false);
  };

  const advanceStatus = async () => {
    const a = analysisQuery.data;
    if (!a?.status) return;
    const next = NEXT_STATUS[a.status];
    if (!next) return;
    await updateMutation.mutateAsync({
      analysisId,
      payload: {
        title: a.title,
        description: a.description ?? null,
        period: a.period ?? null,
        status: next,
      },
    });
  };

  const isApproved = analysisQuery.data?.status === "approved";
  const currentStatus = analysisQuery.data?.status ?? "draft";
  const canAdvance = !!NEXT_STATUS[currentStatus] && !isApproved;

  if (analysisQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[480px] w-full" />
      </div>
    );
  }

  if (!analysisQuery.data) {
    return (
      <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
        No se pudo cargar el análisis.
      </div>
    );
  }

  const analysis = analysisQuery.data;

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-wrap items-start gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold truncate">{analysis.title}</h2>
            <Badge variant={STATUS_VARIANTS[currentStatus] ?? "secondary"}>
              {STATUS_LABELS[currentStatus] ?? currentStatus}
            </Badge>
            {analysis.period && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {analysis.period}
              </span>
            )}
          </div>
          {analysis.description && (
            <p className="text-sm text-muted-foreground mt-0.5 truncate">
              {analysis.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {!isApproved && (
            <Button
              variant="ghost"
              size="sm"
              onClick={openEdit}
              disabled={updateMutation.isPending}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Editar
            </Button>
          )}
          {canAdvance && (
            <Button
              size="sm"
              onClick={advanceStatus}
              disabled={updateMutation.isPending}
            >
              {currentStatus === "in_review" ? (
                <CheckCircle className="h-4 w-4 mr-1" />
              ) : (
                <Send className="h-4 w-4 mr-1" />
              )}
              {NEXT_STATUS_LABEL[currentStatus]}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          {isApproved && (
            <Badge variant="outline" className="text-green-700 border-green-600">
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Aprobado — solo lectura
            </Badge>
          )}
        </div>
      </div>

      {/* Phase tabs */}
      <Tabs defaultValue="diagnostico" className="w-full">
        <TabsList>
          <TabsTrigger value="diagnostico">Fase 1 — Diagnóstico</TabsTrigger>
          <TabsTrigger value="estrategia">Fase 2 — Estrategia</TabsTrigger>
          <TabsTrigger value="plan">Fase 3 — Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostico" className="mt-4">
          <DofaDiagnostico analysisId={analysisId} />
        </TabsContent>

        <TabsContent value="estrategia" className="mt-4">
          <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
            Fase 2 — Estrategias (próximamente en Sprint 2)
          </div>
        </TabsContent>

        <TabsContent value="plan" className="mt-4">
          <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
            Fase 3 — Plan de objetivos (próximamente en Sprint 3)
          </div>
        </TabsContent>
      </Tabs>

      <EditAnalysisDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        draft={editDraft}
        onChange={(patch) => setEditDraft((d) => ({ ...d, ...patch }))}
        onSave={saveEdit}
        isBusy={updateMutation.isPending}
      />
    </div>
  );
}
