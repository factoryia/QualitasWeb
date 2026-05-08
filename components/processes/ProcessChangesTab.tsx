"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
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
  useCreateRiskControl,
  useDeleteRiskControl,
  useRiskControlsForProcess,
  useRisks,
  useUpdateRiskControl,
} from "@/feature/risk/hooks/use-risks";
import type { CreateRiskControlRequest, RiskControlDto, UpdateRiskControlRequest } from "@/feature/risk/types";

const CHANGE_CATEGORY = "CAMBIO";

const CONTROL_TYPES = ["PREVENTIVO", "DETECTIVO", "CORRECTIVO"];
const CONTROL_STATUS = ["DISEÑADO", "IMPLEMENTADO", "MONITOREADO", "INEFECTIVO"];

type Props = {
  processId: string;
  processName: string;
};

export function ProcessChangesTab({ processId, processName }: Props) {
  const { data: risks = [] } = useRisks(processId);
  const { data: controls = [], isLoading } = useRiskControlsForProcess(processId);
  const createCtrl = useCreateRiskControl(processId);
  const updateCtrl = useUpdateRiskControl(processId);
  const deleteCtrl = useDeleteRiskControl(processId);

  const riskTitle = useMemo(() => {
    const m = new Map(risks.map((r) => [r.id, r.riskTitle]));
    return (id: string) => m.get(id) ?? id.slice(0, 8);
  }, [risks]);

  const changes = useMemo(
    () => controls.filter((c) => (c.controlCategory ?? "").toUpperCase() === CHANGE_CATEGORY),
    [controls],
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RiskControlDto | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const [form, setForm] = useState({
    riskId: "",
    controlCode: "",
    controlName: "",
    description: "",
    controlType: "PREVENTIVO",
    status: "DISEÑADO",
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      riskId: risks[0]?.id ?? "",
      controlCode: `CHG-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      controlName: "",
      description: "",
      controlType: "PREVENTIVO",
      status: "DISEÑADO",
    });
    setDialogOpen(true);
  };

  const openEdit = (c: RiskControlDto) => {
    setEditing(c);
    setForm({
      riskId: c.riskId,
      controlCode: c.controlCode,
      controlName: c.controlName,
      description: c.description ?? "",
      controlType: c.controlType ?? "PREVENTIVO",
      status: c.status,
    });
    setDialogOpen(true);
  };

  const submit = () => {
    if (!form.riskId || !form.controlCode.trim() || !form.controlName.trim()) return;
    if (editing) {
      const payload: UpdateRiskControlRequest = {
        controlName: form.controlName.trim(),
        description: form.description.trim() || null,
        controlType: form.controlType,
        controlCategory: CHANGE_CATEGORY,
        ownerUserId: editing.ownerUserId,
        processName: processName || editing.processName,
        frequency: editing.frequency,
        designDocumentation: editing.designDocumentation,
        designEffectiveness: editing.designEffectiveness,
        operationalEffectiveness: editing.operationalEffectiveness,
        effectivenessEvidence: editing.effectivenessEvidence,
        status: form.status,
        dateLastAssessed: editing.dateLastAssessed,
        lastAssessmentResult: editing.lastAssessmentResult,
        assessmentComments: editing.assessmentComments,
      };
      updateCtrl.mutate(
        { id: editing.id, payload },
        { onSuccess: () => setDialogOpen(false) },
      );
    } else {
      const payload: CreateRiskControlRequest = {
        riskId: form.riskId,
        controlCode: form.controlCode.trim(),
        controlName: form.controlName.trim(),
        description: form.description.trim() || null,
        controlType: form.controlType,
        controlCategory: CHANGE_CATEGORY,
        processName,
      };
      createCtrl.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="min-w-0 space-y-1.5">
          <CardTitle className="text-base">Gestión del cambio</CardTitle>
          <CardDescription>
            Cambios planificados asociados a un riesgo de este proceso.
          </CardDescription>
        </div>
        <CardAction>
          <Button size="sm" onClick={openCreate} disabled={!risks.length}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Registrar cambio
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        {!risks.length ? (
          <p className="text-sm text-muted-foreground rounded-md border border-dashed px-3 py-4">
            Primero registra al menos un <strong>riesgo</strong> en la pestaña «Riesgos y oportunidades»; cada cambio
            planificado se asocia a uno de esos riesgos.
          </p>
        ) : null}

        {isLoading ? (
          <div className="flex justify-center py-12 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : changes.length === 0 ? (
          <div className="rounded-lg border border-dashed py-12 text-center text-sm text-muted-foreground px-4">
            No hay cambios registrados para este proceso.
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Descripción del cambio</TableHead>
                  <TableHead>Riesgo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[88px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {changes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.controlCode}</TableCell>
                    <TableCell className="max-w-[280px]">
                      <div className="font-medium line-clamp-2">{c.controlName}</div>
                      {c.description ? (
                        <div className="text-xs text-muted-foreground line-clamp-2">{c.description}</div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
                      {riskTitle(c.riskId)}
                    </TableCell>
                    <TableCell className="text-xs">{c.controlType ?? "—"}</TableCell>
                    <TableCell className="text-xs">{c.status}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)} aria-label="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setRemoveId(c.id)}
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar cambio" : "Registrar cambio planificado"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="grid gap-2">
                <Label>Riesgo asociado</Label>
                <Select
                  value={form.riskId}
                  onValueChange={(v) => setForm((f) => ({ ...f, riskId: v }))}
                  disabled={!!editing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar riesgo" />
                  </SelectTrigger>
                  <SelectContent>
                    {risks.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.riskCode} — {r.riskTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Código</Label>
                <Input value={form.controlCode} onChange={(e) => setForm((f) => ({ ...f, controlCode: e.target.value }))} disabled={!!editing} />
              </div>
              <div className="grid gap-2">
                <Label>Título del cambio</Label>
                <Input value={form.controlName} onChange={(e) => setForm((f) => ({ ...f, controlName: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Select value={form.controlType} onValueChange={(v) => setForm((f) => ({ ...f, controlType: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTROL_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editing ? (
                <div className="grid gap-2">
                  <Label>Estado</Label>
                  <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTROL_STATUS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              <div className="grid gap-2">
                <Label>Detalle</Label>
                <Textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={submit} disabled={createCtrl.isPending || updateCtrl.isPending}>
                {editing ? "Guardar" : "Crear"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!removeId} onOpenChange={(o) => !o && setRemoveId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar este registro de cambio?</AlertDialogTitle>
              <AlertDialogDescription>Se eliminará el control asociado al riesgo.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (removeId) deleteCtrl.mutate(removeId, { onSuccess: () => setRemoveId(null) });
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
