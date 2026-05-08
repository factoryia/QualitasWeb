"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProcessStatuses } from "@/feature/process/hooks/use-processes";
import type {
  ProcessDto,
  ProcessTypeDto,
  CreateProcessRequest,
  UpdateProcessRequest,
} from "@/feature/process/types";

interface ProcessFormDialogProps {
  open: boolean;
  process: ProcessDto | null;
  processTypes: ProcessTypeDto[];
  defaultTypeId?: string;
  onClose: () => void;
  onSave: (data: (CreateProcessRequest | UpdateProcessRequest) & { id?: string }) => Promise<void>;
}

const RISK_LEVELS = ["Low", "Medium", "High", "Critical"] as const;
const RISK_LABEL: Record<string, string> = {
  Low: "Bajo",
  Medium: "Medio",
  High: "Alto",
  Critical: "Crítico",
};

type FormValues = {
  code: string;
  name: string;
  processTypeId: string;
  owner: string;
  description: string;
  processObjective: string;
  processScope: string;
  processStatusId: string;
  processVersion: string;
  riskLevel: string;
  requiresAudit: boolean;
  processStartDate: string;
};

const EMPTY: FormValues = {
  code: "",
  name: "",
  processTypeId: "",
  owner: "",
  description: "",
  processObjective: "",
  processScope: "",
  processStatusId: "",
  processVersion: "1.0",
  riskLevel: "Medium",
  requiresAudit: false,
  processStartDate: "",
};

export function ProcessFormDialog({
  open,
  process,
  processTypes,
  defaultTypeId,
  onClose,
  onSave,
}: ProcessFormDialogProps) {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const { data: statuses = [] } = useProcessStatuses();

  useEffect(() => {
    if (open) {
      if (process) {
        setValues({
          code: process.code,
          name: process.name,
          processTypeId: process.processTypeId,
          owner: process.owner ?? "",
          description: process.description ?? "",
          processObjective: process.processObjective ?? "",
          processScope: process.processScope ?? "",
          processStatusId: process.processStatusId ?? "",
          processVersion: process.processVersion || "1.0",
          riskLevel: process.riskLevel || "Medium",
          requiresAudit: !!process.requiresAudit,
          processStartDate: process.processStartDate?.slice(0, 10) ?? "",
        });
      } else {
        setValues({ ...EMPTY, processTypeId: defaultTypeId ?? "" });
      }
      setErrors({});
    }
  }, [open, process, defaultTypeId]);

  function set<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof FormValues, string>> = {};
    if (!values.code.trim()) errs.code = "El código es requerido";
    else if (values.code.length > 50) errs.code = "Máximo 50 caracteres";
    if (!values.name.trim()) errs.name = "El nombre es requerido";
    else if (values.name.length > 256) errs.name = "Máximo 256 caracteres";
    if (!values.processTypeId) errs.processTypeId = "Selecciona un tipo de proceso";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: (CreateProcessRequest | UpdateProcessRequest) & { id?: string } = {
        id: process?.id,
        code: values.code.trim(),
        name: values.name.trim(),
        processTypeId: values.processTypeId,
        owner: values.owner.trim() || null,
        description: values.description.trim() || null,
        processObjective: values.processObjective.trim() || null,
        processScope: values.processScope.trim() || null,
        processStatusId: values.processStatusId || null,
        processVersion: values.processVersion.trim() || "1.0",
        riskLevel: values.riskLevel || "Medium",
        requiresAudit: values.requiresAudit,
        processStartDate: values.processStartDate ? `${values.processStartDate}T00:00:00Z` : null,
      };
      await onSave(payload);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const isEdit = !!process;

  /** Solo en creación: el envío exige los mismos campos que validate() (código, nombre, tipo). */
  const createRequiredOk = useMemo(() => {
    const code = values.code.trim();
    const name = values.name.trim();
    if (!code || code.length > 50) return false;
    if (!name || name.length > 256) return false;
    if (!values.processTypeId) return false;
    return true;
  }, [values.code, values.name, values.processTypeId]);

  const submitDisabled = saving || (!isEdit && !createRequiredOk);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar proceso" : "Nuevo proceso"}</DialogTitle>
          <DialogDescription>
            Registra los datos básicos del proceso. La caracterización detallada (PHVA, recursos,
            requisitos) se completa después desde el espacio del proceso.
          </DialogDescription>
        </DialogHeader>

        <form id="process-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pf-code">
                Código <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pf-code"
                placeholder="P-001"
                value={values.code}
                onChange={(e) => set("code", e.target.value)}
                maxLength={50}
              />
              {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pf-type">
                Tipo <span className="text-destructive">*</span>
              </Label>
              <Select
                value={values.processTypeId}
                onValueChange={(v) => set("processTypeId", v)}
              >
                <SelectTrigger id="pf-type">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {processTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.code} — {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.processTypeId && (
                <p className="text-xs text-destructive">{errors.processTypeId}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pf-name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pf-name"
              placeholder="Nombre del proceso"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              maxLength={256}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pf-description">Descripción</Label>
            <Textarea
              id="pf-description"
              placeholder="Resumen general del proceso"
              rows={2}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pf-owner">Responsable / Dueño</Label>
            <Input
              id="pf-owner"
              placeholder="Nombre del líder o área"
              value={values.owner}
              onChange={(e) => set("owner", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pf-status">Estado</Label>
              <Select
                value={values.processStatusId || "_none"}
                onValueChange={(v) => set("processStatusId", v === "_none" ? "" : v)}
              >
                <SelectTrigger id="pf-status">
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">— Sin asignar —</SelectItem>
                  {statuses.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pf-risk">Nivel de riesgo</Label>
              <Select value={values.riskLevel} onValueChange={(v) => set("riskLevel", v)}>
                <SelectTrigger id="pf-risk">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RISK_LEVELS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {RISK_LABEL[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pf-objective">Objetivo</Label>
            <Textarea
              id="pf-objective"
              placeholder="¿Qué busca lograr este proceso?"
              rows={2}
              value={values.processObjective}
              onChange={(e) => set("processObjective", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pf-scope">Alcance</Label>
            <Textarea
              id="pf-scope"
              placeholder="Límites y aplicabilidad del proceso"
              rows={2}
              value={values.processScope}
              onChange={(e) => set("processScope", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pf-version">Versión</Label>
              <Input
                id="pf-version"
                placeholder="1.0"
                value={values.processVersion}
                onChange={(e) => set("processVersion", e.target.value)}
                maxLength={20}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pf-start">Fecha de inicio</Label>
              <Input
                id="pf-start"
                type="date"
                value={values.processStartDate}
                onChange={(e) => set("processStartDate", e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="pf-audit" className="text-sm font-medium">
                Requiere auditoría
              </Label>
              <p className="text-xs text-muted-foreground">
                Marca este proceso como sujeto a auditoría interna.
              </p>
            </div>
            <Switch
              id="pf-audit"
              checked={values.requiresAudit}
              onCheckedChange={(v) => set("requiresAudit", v)}
            />
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form="process-form" disabled={submitDisabled}>
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear proceso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
