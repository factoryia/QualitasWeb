"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import type {
  CreateStakeholderTypeRequest,
  StakeholderTypeDto,
  UpdateStakeholderTypeRequest,
} from "@/feature/planning/api/stakeholder-types";

type Mode = "create" | "edit";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  type: StakeholderTypeDto | null;
  saving: boolean;
  onCreate: (payload: CreateStakeholderTypeRequest) => void | Promise<void>;
  onUpdate: (id: string, payload: UpdateStakeholderTypeRequest) => void | Promise<void>;
}

const CLASSIFICATIONS = ["Interno", "Externo"] as const;

function StakeholderTypeUpsertDialogInner({
  open,
  onOpenChange,
  mode,
  type,
  saving,
  onCreate,
  onUpdate,
}: Props) {
  const isEdit = mode === "edit";
  const initial = useMemo(() => {
    if (isEdit && type) {
      return {
        code: type.code ?? "",
        name: type.name ?? "",
        classification: type.classification ?? "Externo",
        description: type.description ?? "",
        order: String(type.order ?? 0),
      };
    }
    return {
      code: "",
      name: "",
      classification: "Externo",
      description: "",
      order: "10",
    };
  }, [isEdit, type]);

  const [code, setCode] = useState(initial.code);
  const [name, setName] = useState(initial.name);
  const [classification, setClassification] = useState<string>(
    initial.classification,
  );
  const [description, setDescription] = useState(initial.description);
  const [order, setOrder] = useState<string>(initial.order);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!classification.trim()) return false;
    const n = Number(order);
    if (!Number.isFinite(n)) return false;
    if (!isEdit && !code.trim()) return false;
    return true;
  }, [name, classification, order, isEdit, code]);

  const title = isEdit ? "Editar Tipo" : "Agregar Tipo";

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const parsedOrder = Number(order);

    if (isEdit) {
      if (!type) return;
      await onUpdate(type.id, {
        name: name.trim(),
        classification: classification.trim(),
        description: description.trim() || null,
        order: parsedOrder,
      });
      return;
    }

    await onCreate({
      code: code.trim(),
      name: name.trim(),
      classification: classification.trim(),
      description: description.trim() || null,
      order: parsedOrder,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Código</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ej: PI-01"
              disabled={isEdit}
            />
          </div>

          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Cliente"
            />
          </div>

          <div className="space-y-2">
            <Label>Clasificación</Label>
            <Select value={classification} onValueChange={setClassification}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLASSIFICATIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Orden</Label>
            <Input
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              inputMode="numeric"
              placeholder="10"
            />
          </div>

          <div className="space-y-2">
            <Label>Descripción (opcional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del tipo..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={saving || !canSubmit} onClick={handleSubmit}>
            {saving ? "Guardando..." : isEdit ? "Guardar" : "Agregar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function StakeholderTypeUpsertDialog({
  open,
  onOpenChange,
  mode,
  type,
  saving,
  onCreate,
  onUpdate,
}: Props) {
  const key = `${open ? "open" : "closed"}-${mode}-${type?.id ?? "new"}`;
  return (
    <StakeholderTypeUpsertDialogInner
      key={key}
      open={open}
      onOpenChange={onOpenChange}
      mode={mode}
      type={type}
      saving={saving}
      onCreate={onCreate}
      onUpdate={onUpdate}
    />
  );
}
