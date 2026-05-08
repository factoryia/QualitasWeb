"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ListPlus, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
import { buildRiskSuggestions } from "@/feature/risk/risk-suggestions";
import { risksApi } from "@/feature/risk/api/risks";
import {
  useCreateRisk,
  useDeleteRisk,
  useRiskCategories,
  useRisks,
  useUpdateRisk,
  riskQueryKeys,
} from "@/feature/risk/hooks/use-risks";
import type { CreateRiskRequest, RiskDto, UpdateRiskRequest } from "@/feature/risk/types";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = ["IDENTIFICADO", "EVALUADO", "TRATADO", "MONITOREADO", "CERRADO"];

function levelBadgeClass(level: string | null | undefined) {
  const l = (level ?? "").toUpperCase();
  if (l.includes("EXTRE")) return "bg-rose-600 text-white border-transparent";
  if (l.includes("ALTO")) return "bg-amber-600 text-white border-transparent";
  if (l.includes("MED")) return "bg-amber-100 text-amber-900 border-amber-300";
  if (l.includes("BAJO")) return "bg-emerald-100 text-emerald-900 border-emerald-300";
  return "bg-muted text-muted-foreground";
}

type Props = {
  processId: string;
  processName: string;
  processTypeName: string;
  processTypeCode?: string | null;
};

export function ProcessRisksTab({ processId, processName, processTypeName, processTypeCode }: Props) {
  const qc = useQueryClient();
  const { data: categories = [], isError: catErr } = useRiskCategories();
  const { data: risks = [], isLoading, isError: risksErr } = useRisks(processId);
  const createRisk = useCreateRisk(processId);
  const updateRisk = useUpdateRisk(processId);
  const deleteRisk = useDeleteRisk(processId);

  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const existingCodes = useMemo(() => new Set(risks.map((r) => r.riskCode)), [risks]);

  const suggestions = useMemo(
    () =>
      buildRiskSuggestions(processName, processTypeName, processTypeCode ?? undefined, categories, existingCodes),
    [processName, processTypeName, processTypeCode, categories, existingCodes],
  );

  const [suggestOpen, setSuggestOpen] = useState(false);
  const [selectedSuggest, setSelectedSuggest] = useState<Record<string, boolean>>({});

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<RiskDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RiskDto | null>(null);

  const [form, setForm] = useState({
    riskCategoryId: "",
    riskCode: "",
    riskTitle: "",
    description: "",
    cause: "",
    probabilityInherent: "3",
    impactInherent: "3",
    status: "IDENTIFICADO",
    probabilityResidual: "",
    impactResidual: "",
  });

  const invalidateRisks = () => {
    qc.invalidateQueries({ queryKey: riskQueryKeys.risks(processId) });
    qc.invalidateQueries({ queryKey: riskQueryKeys.riskControlsAll });
  };

  const openCreate = () => {
    setEditing(null);
    const firstCat = categories.find((c) => c.isActive)?.id ?? "";
    setForm({
      riskCategoryId: firstCat,
      riskCode: `R-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      riskTitle: "",
      description: "",
      cause: "",
      probabilityInherent: "3",
      impactInherent: "3",
      status: "IDENTIFICADO",
      probabilityResidual: "",
      impactResidual: "",
    });
    setEditorOpen(true);
  };

  const openEdit = (r: RiskDto) => {
    setEditing(r);
    setForm({
      riskCategoryId: r.riskCategoryId,
      riskCode: r.riskCode,
      riskTitle: r.riskTitle,
      description: r.description ?? "",
      cause: r.cause ?? "",
      probabilityInherent: String(r.probabilityInherent ?? ""),
      impactInherent: String(r.impactInherent ?? ""),
      status: r.status,
      probabilityResidual: r.probabilityResidual != null ? String(r.probabilityResidual) : "",
      impactResidual: r.impactResidual != null ? String(r.impactResidual) : "",
    });
    setEditorOpen(true);
  };

  const submitEditor = () => {
    if (!form.riskCategoryId || !form.riskCode.trim() || !form.riskTitle.trim()) return;
    const pi = form.probabilityInherent ? Number(form.probabilityInherent) : null;
    const ii = form.impactInherent ? Number(form.impactInherent) : null;
    const pr = form.probabilityResidual ? Number(form.probabilityResidual) : null;
    const ir = form.impactResidual ? Number(form.impactResidual) : null;

    if (editing) {
      const payload: UpdateRiskRequest = {
        riskCategoryId: form.riskCategoryId,
        responsibleId: editing.responsibleId,
        riskTitle: form.riskTitle.trim(),
        description: form.description.trim() || null,
        cause: form.cause.trim() || null,
        potentialConsequence: editing.potentialConsequence,
        triggeringEvents: editing.triggeringEvents,
        probabilityResidual: Number.isFinite(pr as number) ? pr : null,
        impactResidual: Number.isFinite(ir as number) ? ir : null,
        dateResidualEvaluated: editing.dateResidualEvaluated,
        controlGapAnalysis: editing.controlGapAnalysis,
        status: form.status,
        requiresImmediateAction: editing.requiresImmediateAction,
        dateNextReview: editing.dateNextReview,
        reviewFrequency: editing.reviewFrequency,
        riskResponse: editing.riskResponse,
        riskOwnerApproval: editing.riskOwnerApproval,
        dateApproved: editing.dateApproved,
      };
      updateRisk.mutate(
        { id: editing.id, payload },
        {
          onSuccess: () => setEditorOpen(false),
        },
      );
    } else {
      const payload: CreateRiskRequest = {
        processId,
        riskCategoryId: form.riskCategoryId,
        responsibleId: null,
        riskCode: form.riskCode.trim(),
        riskTitle: form.riskTitle.trim(),
        description: form.description.trim() || null,
        cause: form.cause.trim() || null,
        probabilityInherent: Number.isFinite(pi as number) ? pi : null,
        impactInherent: Number.isFinite(ii as number) ? ii : null,
      };
      createRisk.mutate(payload, {
        onSuccess: () => setEditorOpen(false),
      });
    }
  };

  const applySuggestions = async () => {
    const toAdd = suggestions.filter((s) => selectedSuggest[s.key]);
    if (!toAdd.length) {
      toast.error("Selecciona al menos una sugerencia");
      return;
    }
    try {
      for (const s of toAdd) {
        const catId = categories.find((c) => c.code === s.categoryCode)?.id;
        if (!catId) continue;
        const payload: CreateRiskRequest = {
          processId,
          riskCategoryId: catId,
          responsibleId: null,
          riskCode: s.key,
          riskTitle: s.riskTitle,
          description: s.description,
          probabilityInherent: s.probabilityInherent,
          impactInherent: s.impactInherent,
        };
        await risksApi.create(payload);
      }
      invalidateRisks();
      toast.success(`${toAdd.length} riesgo(s) creados`);
      setSuggestOpen(false);
      setSelectedSuggest({});
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "No se pudieron crear las sugerencias");
    }
  };

  const err = catErr || risksErr;

  return (
    <Card>
      <CardHeader>
        <div className="min-w-0 space-y-1.5">
          <CardTitle className="text-base">Riesgos y oportunidades</CardTitle>
          <CardDescription>
            {risks.length === 0
              ? "Sin registros aún."
              : `${risks.length} ${risks.length === 1 ? "registro" : "registros"} para este proceso.`}
          </CardDescription>
        </div>
        <CardAction className="flex flex-wrap gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => setSuggestOpen(true)} disabled={!categories.length}>
            <ListPlus className="h-3.5 w-3.5 mr-1" /> Sugerencias
          </Button>
          <Button size="sm" onClick={openCreate} disabled={!categories.length}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Registrar riesgo
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        {err ? (
          <p className="text-sm text-destructive">
            No se pudieron cargar los datos. Comprueba permisos de acceso o inténtalo de nuevo.
          </p>
        ) : null}

        {isLoading ? (
          <div className="flex justify-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : risks.length === 0 ? (
          <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground px-4">
            Aún no hay riesgos u oportunidades. Usa «Sugerencias» o «Registrar riesgo».
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="whitespace-nowrap">P · I</TableHead>
                  <TableHead>Nivel</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[88px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {risks.map((r) => {
                  const cat = catMap.get(r.riskCategoryId);
                  const level = r.levelInherent ?? r.levelResidual;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs">{r.riskCode}</TableCell>
                      <TableCell className="max-w-[220px]">
                        <div className="font-medium line-clamp-2">{r.riskTitle}</div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{cat?.name ?? "—"}</TableCell>
                      <TableCell className="text-xs tabular-nums text-muted-foreground">
                        {r.probabilityInherent ?? "—"} · {r.impactInherent ?? "—"}
                      </TableCell>
                      <TableCell>
                        {level ? (
                          <Badge variant="outline" className={cn("text-[10px] font-semibold", levelBadgeClass(level))}>
                            {level}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-xs">{r.status}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(r)} aria-label="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => setDeleteTarget(r)}
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={suggestOpen} onOpenChange={setSuggestOpen}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Sugerencias de riesgos</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Lista breve según el contexto del proceso. Marca las que quieras dar de alta.
            </p>
            <div className="space-y-3 py-2">
              {suggestions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay sugerencias nuevas para este contexto.</p>
              ) : (
                suggestions.map((s) => (
                  <label
                    key={s.key}
                    className="flex gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/40"
                  >
                    <Checkbox
                      checked={!!selectedSuggest[s.key]}
                      onCheckedChange={(v) =>
                        setSelectedSuggest((m) => ({ ...m, [s.key]: v === true }))
                      }
                    />
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-medium leading-snug">{s.riskTitle}</p>
                      <p className="text-xs text-muted-foreground">{s.description}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {s.categoryCode} · P:{s.probabilityInherent} · I:{s.impactInherent}
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSuggestOpen(false)}>
                Cerrar
              </Button>
              <Button onClick={() => void applySuggestions()} disabled={!suggestions.length}>
                Crear seleccionados
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar riesgo" : "Registrar riesgo"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="grid gap-2">
                <Label>Categoría</Label>
                <Select
                  value={form.riskCategoryId}
                  onValueChange={(v) => setForm((f) => ({ ...f, riskCategoryId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c) => c.isActive)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Código</Label>
                <Input
                  value={form.riskCode}
                  onChange={(e) => setForm((f) => ({ ...f, riskCode: e.target.value }))}
                  disabled={!!editing}
                />
              </div>
              <div className="grid gap-2">
                <Label>Título</Label>
                <Input value={form.riskTitle} onChange={(e) => setForm((f) => ({ ...f, riskTitle: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label>Prob. inherente (1–5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={form.probabilityInherent}
                    onChange={(e) => setForm((f) => ({ ...f, probabilityInherent: e.target.value }))}
                    disabled={!!editing}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Impacto inherente (1–5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={form.impactInherent}
                    onChange={(e) => setForm((f) => ({ ...f, impactInherent: e.target.value }))}
                    disabled={!!editing}
                  />
                </div>
              </div>
              {editing ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label>Prob. residual (1–5)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={form.probabilityResidual}
                      onChange={(e) => setForm((f) => ({ ...f, probabilityResidual: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Impacto residual (1–5)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={form.impactResidual}
                      onChange={(e) => setForm((f) => ({ ...f, impactResidual: e.target.value }))}
                    />
                  </div>
                </div>
              ) : null}
              {editing ? (
                <div className="grid gap-2">
                  <Label>Estado</Label>
                  <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              <div className="grid gap-2">
                <Label>Descripción</Label>
                <Textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Causa raíz (opcional)</Label>
                <Textarea rows={2} value={form.cause} onChange={(e) => setForm((f) => ({ ...f, cause: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditorOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={submitEditor} disabled={createRisk.isPending || updateRisk.isPending}>
                {editing ? "Guardar" : "Crear"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar riesgo?</AlertDialogTitle>
              <AlertDialogDescription>
                Se eliminará {deleteTarget?.riskCode}. Los controles vinculados pueden quedar huérfanos según
                reglas del backend.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (deleteTarget)
                    deleteRisk.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
                }}
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
