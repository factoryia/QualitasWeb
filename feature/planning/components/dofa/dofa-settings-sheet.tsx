"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import type { DofaAnalysisDto } from "@/feature/planning/api/dofa";
import { useDofaUpdateAnalysisMutation } from "@/feature/planning/hooks/use-dofa";
import { ENTITY_TYPES } from "./dofa-constants";

const STATUS_OPTIONS = [
  {
    value: "draft",
    label: "Borrador",
    className: "bg-muted text-muted-foreground border-transparent",
  },
  {
    value: "in_review",
    label: "En Revisión",
    className:
      "bg-amber-100 text-amber-800 border-transparent dark:bg-amber-900/30 dark:text-amber-300",
  },
  {
    value: "approved",
    label: "Activo",
    className:
      "bg-green-100 text-green-800 border-transparent dark:bg-green-900/30 dark:text-green-300",
  },
  {
    value: "archived",
    label: "Cerrado",
    className: "bg-primary/10 text-primary border-transparent",
  },
];

function statusCfg(s: string | null | undefined) {
  return (
    STATUS_OPTIONS.find((o) => o.value === (s ?? "draft")) ?? STATUS_OPTIONS[0]
  );
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-CO");
  } catch {
    return iso;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  analysis: DofaAnalysisDto;
  readOnly?: boolean;
};

export function DofaSettingsSheet({
  open,
  onOpenChange,
  analysis,
  readOnly = false,
}: Props) {
  const updateMutation = useDofaUpdateAnalysisMutation();

  const [title, setTitle] = useState(analysis.title ?? "");
  const [description, setDescription] = useState(analysis.description ?? "");
  const [period, setPeriod] = useState(analysis.period ?? "");
  const [status, setStatus] = useState(analysis.status ?? "draft");
  const [copied, setCopied] = useState(false);

  // Sync state when analysis changes (e.g., after refetch)
  useEffect(() => {
    setTitle(analysis.title ?? "");
    setDescription(analysis.description ?? "");
    setPeriod(analysis.period ?? "");
    setStatus(analysis.status ?? "draft");
  }, [analysis]);

  const persist = async (patch: {
    title?: string;
    description?: string | null;
    period?: string | null;
    status?: string | null;
  }) => {
    await updateMutation.mutateAsync({
      analysisId: analysis.id,
      payload: {
        title: patch.title ?? title,
        description: patch.description !== undefined ? patch.description : description || null,
        period: patch.period !== undefined ? patch.period : period || null,
        status: patch.status !== undefined ? patch.status : status,
      },
    });
  };

  const commitField = async (
    field: "title" | "description" | "period",
    value: string,
    original: string,
    label: string,
  ) => {
    if (readOnly) return;
    const trimmed = value.trim();
    if (trimmed === original.trim()) return;
    await persist({ [field]: trimmed || null });
    toast.success(`${label} actualizado`);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (readOnly || newStatus === status) return;
    setStatus(newStatus);
    await persist({ status: newStatus });
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(analysis.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  const cfg = statusCfg(status);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[380px] sm:w-[380px] sm:max-w-[380px] p-0 flex flex-col"
      >
        <SheetHeader className="px-5 pt-5 pb-3 border-b">
          <SheetTitle>Configuración del análisis</SheetTitle>
          <SheetDescription className="text-xs">
            Los cambios se guardan automáticamente.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Información */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Información del análisis
            </h3>

            <div className="space-y-1.5">
              <Label htmlFor="set-title" className="text-xs">
                Título
              </Label>
              <Input
                id="set-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() =>
                  commitField("title", title, analysis.title ?? "", "Título")
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
                disabled={readOnly}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="set-desc" className="text-xs">
                Descripción
              </Label>
              <Textarea
                id="set-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() =>
                  commitField(
                    "description",
                    description,
                    analysis.description ?? "",
                    "Descripción",
                  )
                }
                rows={3}
                disabled={readOnly}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Tipo de entidad</Label>
              <Select value={analysis.entityType ?? "Organization"} disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="set-period" className="text-xs">
                Ciclo de planeación
              </Label>
              <Input
                id="set-period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                onBlur={() =>
                  commitField("period", period, analysis.period ?? "", "Período")
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
                placeholder="Ej: 2026"
                disabled={readOnly}
              />
            </div>
          </section>

          <Separator />

          {/* Estado */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Estado y trazabilidad
            </h3>

            <div className="space-y-1.5">
              <Label className="text-xs">Estado actual</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("font-medium", cfg.className)}>
                  {cfg.label}
                </Badge>
                <Select
                  value={status}
                  onValueChange={handleStatusChange}
                  disabled={readOnly}
                >
                  <SelectTrigger className="h-8 flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">ID del análisis</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={analysis.id}
                  readOnly
                  className="font-mono text-xs h-8"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={copyId}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <Label className="text-xs text-muted-foreground">Período</Label>
                <p className="text-foreground mt-1">{period || "—"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Versión</Label>
                <p className="text-foreground mt-1">{analysis.version || "—"}</p>
              </div>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
