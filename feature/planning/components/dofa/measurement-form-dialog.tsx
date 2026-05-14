"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateMeasurementMutation,
  useUpdateMeasurementMutation,
} from "@/feature/planning/hooks/use-dofa";
import type { MeasurementDto } from "@/feature/planning/api/dofa";

interface Props {
  open: boolean;
  indicatorId: string;
  goalId: string;
  measurement: MeasurementDto | null;
  onClose: () => void;
}

const INIT = () => ({
  measurementDate: new Date().toISOString().slice(0, 10),
  value: "",
  observations: "",
  evidenceUrl: "",
});

export function MeasurementFormDialog({
  open,
  indicatorId,
  goalId,
  measurement,
  onClose,
}: Props) {
  const isEdit = !!measurement;
  const [form, setForm] = useState(INIT());
  const createMutation = useCreateMeasurementMutation();
  const updateMutation = useUpdateMeasurementMutation();

  useEffect(() => {
    if (!open) return;
    if (measurement) {
      setForm({
        measurementDate: measurement.measurementDate.slice(0, 10),
        value: String(measurement.value),
        observations: measurement.observations ?? "",
        evidenceUrl: measurement.evidenceUrl ?? "",
      });
    } else {
      setForm(INIT());
    }
  }, [open, measurement]);

  const handleSubmit = async () => {
    if (!form.value) { toast.error("El valor es obligatorio"); return; }
    if (!form.measurementDate) { toast.error("La fecha es obligatoria"); return; }

    const payload = {
      value: parseFloat(form.value),
      measurementDate: new Date(form.measurementDate + "T00:00:00Z").toISOString(),
      goalIndicatorId: indicatorId,
      observations: form.observations || null,
      evidenceUrl: form.evidenceUrl || null,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          indicatorId,
          goalId,
          measurementId: measurement!.id,
          payload,
        });
        toast.success("Medición actualizada");
      } else {
        await createMutation.mutateAsync({ indicatorId, goalId, payload });
        toast.success("Medición registrada");
      }
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? e?.message ?? "Error al guardar");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar medición" : "Nueva medición"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Fecha *</Label>
              <Input
                type="date"
                value={form.measurementDate}
                onChange={(e) => setForm((f) => ({ ...f, measurementDate: e.target.value }))}
                disabled={isEdit}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Valor *</Label>
              <Input
                type="number"
                step="any"
                placeholder="0.00"
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label>Observaciones</Label>
            <Textarea
              rows={2}
              value={form.observations}
              onChange={(e) => setForm((f) => ({ ...f, observations: e.target.value }))}
              placeholder="Notas sobre esta medición..."
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>URL de evidencia</Label>
            <Input
              type="url"
              placeholder="https://..."
              value={form.evidenceUrl}
              onChange={(e) => setForm((f) => ({ ...f, evidenceUrl: e.target.value }))}
              className="mt-1.5"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Guardando..." : isEdit ? "Guardar" : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
