"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, FileX, ListChecks, Wrench } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  useProcessActivities,
  useSaveProcessActivity,
  useDeleteProcessActivity,
  useProcessIndicators,
  useSaveProcessIndicator,
  useDeleteProcessIndicator,
} from "@/feature/process/hooks/use-processes";
import type {
  ProcessActivityDto,
  ProcessDto,
  ProcessIndicatorDto,
} from "@/feature/process/types";

// ====================== OVERVIEW TAB ======================

export function ProcessOverviewTab({ process }: { process: ProcessDto }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información general</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Field label="Código" value={process.code} />
          <Field label="Tipo" value={process.processTypeName} />
          <Field label="Estado" value={process.processStatusName ?? "Sin asignar"} />
          <Field label="Versión" value={process.processVersion} />
          <Field label="Riesgo" value={process.riskLevel} />
          <Field
            label="Auditable"
            value={process.requiresAudit ? "Sí" : "No"}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Liderazgo y fechas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Field label="Responsable" value={process.owner ?? "—"} />
          <Field
            label="Inicio"
            value={process.processStartDate?.slice(0, 10) ?? "—"}
          />
          <Field
            label="Última revisión"
            value={process.lastReviewDate?.slice(0, 10) ?? "—"}
          />
          <Field
            label="Próxima revisión"
            value={process.nextReviewDate?.slice(0, 10) ?? "—"}
          />
          <Field
            label="Creado"
            value={process.createdOnUtc.slice(0, 10)}
          />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Objetivo y alcance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Objetivo
            </p>
            <p className="whitespace-pre-line">
              {process.processObjective || (
                <span className="text-muted-foreground italic">No definido</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Alcance
            </p>
            <p className="whitespace-pre-line">
              {process.processScope || (
                <span className="text-muted-foreground italic">No definido</span>
              )}
            </p>
          </div>
          {process.description && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                Descripción
              </p>
              <p className="whitespace-pre-line">{process.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

// ====================== ACTIVITIES TAB ======================

export function ProcessActivitiesTab({ processId }: { processId: string }) {
  const { data: activities = [], isLoading } = useProcessActivities(processId);
  const saveActivity = useSaveProcessActivity();
  const deleteActivity = useDeleteProcessActivity();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProcessActivityDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProcessActivityDto | null>(null);

  return (
    <Card>
      <CardHeader>
        <div className="min-w-0 space-y-1.5">
          <CardTitle className="text-base">Actividades del proceso</CardTitle>
          <CardDescription>
            Define las actividades que conforman el proceso. Soporta jerarquía padre/hijo.
          </CardDescription>
        </div>
        <CardAction>
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Nueva actividad
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex min-h-[120px] items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 px-6 py-10">
            <ListChecks className="h-10 w-10 shrink-0 text-muted-foreground/70" strokeWidth={1.5} />
            <p className="max-w-sm text-center text-sm text-muted-foreground">
              Sin actividades definidas todavía.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="w-16 text-center">Nivel</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs">{a.code}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{a.name}</p>
                      {a.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {a.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-xs text-muted-foreground">
                    {a.level}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => {
                          setEditing(a);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(a)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <ActivityFormDialog
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        processId={processId}
        activities={activities}
        onSave={async (values) => {
          await saveActivity.mutateAsync(values);
        }}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && !deleteActivity.isPending && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar actividad?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar <strong>{deleteTarget?.name}</strong>. Sus sub-actividades quedarán
              huérfanas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteActivity.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget)
                  deleteActivity.mutate(deleteTarget.id, {
                    onSuccess: () => setDeleteTarget(null),
                  });
              }}
              disabled={deleteActivity.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteActivity.isPending ? "Eliminando…" : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function ActivityFormDialog({
  open,
  onOpenChange,
  initial,
  processId,
  activities,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: ProcessActivityDto | null;
  processId: string;
  activities: ProcessActivityDto[];
  onSave: (
    values: {
      id?: string;
      processId: string;
      code: string;
      name: string;
      description: string | null;
      parentActivityId: string | null;
    }
  ) => Promise<void>;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [parentActivityId, setParentActivityId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setCode(initial.code);
      setName(initial.name);
      setDescription(initial.description ?? "");
      setParentActivityId(initial.parentActivityId ?? "");
    } else {
      setCode("");
      setName("");
      setDescription("");
      setParentActivityId("");
    }
  }, [open, initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        id: initial?.id,
        processId,
        code: code.trim(),
        name: name.trim(),
        description: description.trim() || null,
        parentActivityId: parentActivityId || null,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!saving) onOpenChange(o);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Editar actividad" : "Nueva actividad"}</DialogTitle>
        </DialogHeader>
        <form id="activity-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="act-code">Código *</Label>
              <Input
                id="act-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="A-01"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="act-parent">Actividad padre</Label>
              <Select
                value={parentActivityId || "_none"}
                onValueChange={(v) => setParentActivityId(v === "_none" ? "" : v)}
              >
                <SelectTrigger id="act-parent">
                  <SelectValue placeholder="Sin padre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">— Sin padre —</SelectItem>
                  {activities
                    .filter((a) => a.id !== initial?.id)
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.code} — {a.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="act-name">Nombre *</Label>
            <Input
              id="act-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="act-desc">Descripción</Label>
            <Textarea
              id="act-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="activity-form" disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ====================== INDICATORS TAB ======================

export function ProcessIndicatorsTab({ processId }: { processId: string }) {
  const { data: indicators = [], isLoading } = useProcessIndicators(processId);
  const saveIndicator = useSaveProcessIndicator();
  const deleteIndicator = useDeleteProcessIndicator();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProcessIndicatorDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProcessIndicatorDto | null>(null);

  return (
    <Card>
      <CardHeader>
        <div className="min-w-0 space-y-1.5">
          <CardTitle className="text-base">Indicadores del proceso</CardTitle>
          <CardDescription>
            KPIs vinculados al proceso para su seguimiento y mejora.
          </CardDescription>
        </div>
        <CardAction>
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Nuevo indicador
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex min-h-[120px] items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : indicators.length === 0 ? (
          <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 px-6 py-10">
            <Wrench className="h-10 w-10 shrink-0 text-muted-foreground/70" strokeWidth={1.5} />
            <p className="max-w-sm text-center text-sm text-muted-foreground">
              Sin indicadores configurados.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Meta</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {indicators.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-mono text-xs">{i.code}</TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{i.name}</p>
                    {i.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {i.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{i.indicatorType}</TableCell>
                  <TableCell className="text-right text-xs">
                    {i.targetGoal != null ? (
                      <>
                        {i.targetGoal} {i.unit ?? ""}
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => {
                          setEditing(i);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(i)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <IndicatorFormDialog
        open={open}
        onOpenChange={setOpen}
        initial={editing}
        processId={processId}
        onSave={async (values) => {
          await saveIndicator.mutateAsync(values);
        }}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && !deleteIndicator.isPending && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar indicador?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar <strong>{deleteTarget?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteIndicator.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget)
                  deleteIndicator.mutate(deleteTarget.id, {
                    onSuccess: () => setDeleteTarget(null),
                  });
              }}
              disabled={deleteIndicator.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteIndicator.isPending ? "Eliminando…" : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

const INDICATOR_TYPES = ["Eficacia", "Eficiencia", "Efectividad", "Calidad", "Productividad", "Cobertura"];

function IndicatorFormDialog({
  open,
  onOpenChange,
  initial,
  processId,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial: ProcessIndicatorDto | null;
  processId: string;
  onSave: (values: {
    id?: string;
    processId: string;
    code: string;
    name: string;
    indicatorType: string;
    description: string | null;
    unit: string | null;
    targetGoal: number | null;
  }) => Promise<void>;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [indicatorType, setIndicatorType] = useState("Eficiencia");
  const [unit, setUnit] = useState("");
  const [targetGoal, setTargetGoal] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setCode(initial.code);
      setName(initial.name);
      setIndicatorType(initial.indicatorType);
      setUnit(initial.unit ?? "");
      setTargetGoal(initial.targetGoal != null ? String(initial.targetGoal) : "");
      setDescription(initial.description ?? "");
    } else {
      setCode("");
      setName("");
      setIndicatorType("Eficiencia");
      setUnit("");
      setTargetGoal("");
      setDescription("");
    }
  }, [open, initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        id: initial?.id,
        processId,
        code: code.trim(),
        name: name.trim(),
        indicatorType,
        description: description.trim() || null,
        unit: unit.trim() || null,
        targetGoal: targetGoal.trim() ? Number(targetGoal) : null,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!saving) onOpenChange(o);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Editar indicador" : "Nuevo indicador"}</DialogTitle>
        </DialogHeader>
        <form id="ind-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ind-code">Código *</Label>
              <Input
                id="ind-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="IND-01"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ind-type">Tipo *</Label>
              <Select value={indicatorType} onValueChange={setIndicatorType}>
                <SelectTrigger id="ind-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDICATOR_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ind-name">Nombre *</Label>
            <Input
              id="ind-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ind-unit">Unidad</Label>
              <Input
                id="ind-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="horas, %, …"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ind-goal">Meta</Label>
              <Input
                id="ind-goal"
                type="number"
                step="any"
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ind-desc">Descripción</Label>
            <Textarea
              id="ind-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="ind-form" disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ====================== STUB TABS ======================

export function StubTab({
  title,
  description,
  hint,
}: {
  title: string;
  description: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="py-12 text-center space-y-3">
        <FileX className="h-10 w-10 mx-auto text-muted-foreground" />
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{description}</p>
        {hint && (
          <p className="text-xs text-muted-foreground italic max-w-md mx-auto">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
}
