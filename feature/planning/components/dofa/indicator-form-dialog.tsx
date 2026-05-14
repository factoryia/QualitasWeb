"use client";

import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGoalFrequenciesQuery,
  useIndicatorTypesQuery,
  useGoalTrendsQuery,
  useCreateIndicatorMutation,
  useUpdateIndicatorMutation,
} from "@/feature/planning/hooks/use-dofa";
import type { IndicatorDto } from "@/feature/planning/api/dofa";

interface Props {
  open: boolean;
  indicator: IndicatorDto | null;
  goalId: string;
  onClose: () => void;
}

interface FormState {
  name: string;
  frequencyId: string;
  indicatorTypeId: string;
  trendId: string;
  formula: string;
  dataSource: string;
}

function initState(indicator: IndicatorDto | null): FormState {
  if (indicator) {
    return {
      name: indicator.name,
      frequencyId: indicator.frequencyId,
      indicatorTypeId: indicator.indicatorTypeId,
      trendId: indicator.trendId ?? "",
      formula: indicator.formula ?? "",
      dataSource: indicator.dataSource ?? "",
    };
  }
  return {
    name: "",
    frequencyId: "",
    indicatorTypeId: "",
    trendId: "",
    formula: "",
    dataSource: "",
  };
}

interface InnerProps {
  indicator: IndicatorDto | null;
  goalId: string;
  onClose: () => void;
}

function IndicatorFormInner({ indicator, goalId, onClose }: InnerProps) {
  const isEdit = !!indicator;
  const [form, setForm] = useState<FormState>(() => initState(indicator));

  const { data: frequencies = [] } = useGoalFrequenciesQuery();
  const { data: indicatorTypes = [] } = useIndicatorTypesQuery();
  const { data: trends = [] } = useGoalTrendsQuery();

  const createMutation = useCreateIndicatorMutation();
  const updateMutation = useUpdateIndicatorMutation();

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("El nombre es obligatorio"); return; }
    if (!form.frequencyId) { toast.error("Selecciona una frecuencia"); return; }
    if (!form.indicatorTypeId) { toast.error("Selecciona un tipo de indicador"); return; }

    const payload = {
      name: form.name.trim(),
      frequencyId: form.frequencyId,
      indicatorTypeId: form.indicatorTypeId,
      trendId: form.trendId || null,
      formula: form.formula || null,
      dataSource: form.dataSource || null,
      responsibleId: null,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          goalId,
          indicatorId: indicator!.id,
          payload,
        });
        toast.success("Indicador actualizado");
      } else {
        await createMutation.mutateAsync({ goalId, payload });
        toast.success("Indicador creado");
      }
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? e?.message ?? "Error al guardar");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-4 py-2">
      <div>
        <Label>Nombre *</Label>
        <Input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Tasa de satisfacción del cliente"
          className="mt-1.5"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Frecuencia *</Label>
          <Select
            value={form.frequencyId}
            onValueChange={(v) => setForm((f) => ({ ...f, frequencyId: v }))}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {frequencies.map((freq) => (
                <SelectItem key={freq.id} value={freq.id}>
                  {freq.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Tipo de indicador *</Label>
          <Select
            value={form.indicatorTypeId}
            onValueChange={(v) => setForm((f) => ({ ...f, indicatorTypeId: v }))}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {indicatorTypes.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Tendencia esperada</Label>
        <Select
          value={form.trendId}
          onValueChange={(v) => setForm((f) => ({ ...f, trendId: v }))}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Sin tendencia" />
          </SelectTrigger>
          <SelectContent>
            {trends.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.symbol} {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Fórmula</Label>
        <Textarea
          rows={2}
          value={form.formula}
          onChange={(e) => setForm((f) => ({ ...f, formula: e.target.value }))}
          placeholder="(Valor actual / Valor objetivo) × 100"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label>Fuente de datos</Label>
        <Input
          value={form.dataSource}
          onChange={(e) => setForm((f) => ({ ...f, dataSource: e.target.value }))}
          placeholder="CRM, encuesta NPS, sistema contable..."
          className="mt-1.5"
        />
      </div>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Guardando..." : isEdit ? "Guardar" : "Crear indicador"}
        </Button>
      </DialogFooter>
    </div>
  );
}

export function IndicatorFormDialog({ open, indicator, goalId, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{indicator ? "Editar indicador" : "Nuevo indicador"}</DialogTitle>
        </DialogHeader>
        <IndicatorFormInner
          key={indicator?.id ?? "new"}
          indicator={indicator}
          goalId={goalId}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
