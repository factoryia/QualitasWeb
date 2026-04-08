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
  CreateStakeholderRequest,
  StakeholderDto,
  UpdateStakeholderRequest,
} from "@/feature/planning/api/stakeholders";
import type { StakeholderTypeDto } from "@/feature/planning/api/stakeholder-types"; 
import {
  COMMUNICATION_FREQUENCIES,
  INFLUENCE_LEVELS,
  INTEREST_LEVELS,
  PREFERRED_CHANNELS,
} from "./stakeholders.constants";

type Mode = "create" | "edit";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  stakeholder: StakeholderDto | null;
  types: StakeholderTypeDto[];
  saving: boolean;
  onCreate: (payload: CreateStakeholderRequest) => void | Promise<void>;
  onUpdate: (id: string, payload: UpdateStakeholderRequest) => void | Promise<void>;
}

function StakeholderUpsertDialogInner({
  open,
  onOpenChange,
  mode,
  stakeholder,
  types,
  saving,
  onCreate,
  onUpdate,
}: Props) {
  const isEdit = mode === "edit";

  const sortedTypes = useMemo(() => {
    return [...types].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [types]);

  const initial = useMemo(() => {
    if (isEdit && stakeholder) {
      return {
        name: stakeholder.name ?? "",
        stakeholderTypeId: stakeholder.stakeholderTypeId ?? "",
        email: stakeholder.email ?? "",
        phone: stakeholder.phone ?? "",
        organization: stakeholder.organization ?? "",
        influenceLevel: stakeholder.influenceLevel ?? "Medio",
        interestLevel: stakeholder.interestLevel ?? "Medio",
        communicationFrequency: stakeholder.communicationFrequency ?? "Mensual",
        preferredChannel: stakeholder.preferredChannel ?? "none",
        notes: stakeholder.notes ?? "",
        riskAssessment: stakeholder.riskAssessment ?? "",
      };
    }
    return {
      name: "",
      stakeholderTypeId: sortedTypes[0]?.id ?? "",
      email: "",
      phone: "",
      organization: "",
      influenceLevel: "Medio",
      interestLevel: "Medio",
      communicationFrequency: "Mensual",
      preferredChannel: "none",
      notes: "",
      riskAssessment: "",
    };
  }, [isEdit, stakeholder, sortedTypes]);

  const [name, setName] = useState(initial.name);
  const [stakeholderTypeId, setStakeholderTypeId] = useState<string>(
    initial.stakeholderTypeId,
  );
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [organization, setOrganization] = useState(initial.organization);
  const [influenceLevel, setInfluenceLevel] = useState<string>(
    initial.influenceLevel,
  );
  const [interestLevel, setInterestLevel] = useState<string>(
    initial.interestLevel,
  );
  const [communicationFrequency, setCommunicationFrequency] = useState<string>(
    initial.communicationFrequency,
  );
  const [preferredChannel, setPreferredChannel] = useState<string>(
    initial.preferredChannel,
  );
  const [notes, setNotes] = useState(initial.notes);
  const [riskAssessment, setRiskAssessment] = useState(initial.riskAssessment);

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!isEdit && !stakeholderTypeId) return false;
    if (!influenceLevel) return false;
    if (!interestLevel) return false;
    if (!communicationFrequency) return false;
    return true;
  }, [
    name,
    isEdit,
    stakeholderTypeId,
    influenceLevel,
    interestLevel,
    communicationFrequency,
  ]);

  const title = isEdit ? "Editar Parte Interesada" : "Agregar Parte Interesada";

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (isEdit) {
      if (!stakeholder) return;
      await onUpdate(stakeholder.id, {
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        organization: organization.trim() || null,
        influenceLevel,
        interestLevel,
        communicationFrequency,
        preferredChannel: preferredChannel === "none" ? null : preferredChannel,
        ownerOrganizationUnitId: stakeholder.ownerOrganizationUnitId ?? null,
        notes: notes.trim() || null,
        riskAssessment: riskAssessment.trim() || null,
      });
      return;
    }

    await onCreate({
      name: name.trim(),
      stakeholderTypeId,
      email: email.trim() || null,
      phone: phone.trim() || null,
      organization: organization.trim() || null,
      ownerOrganizationUnitId: null,
      relatedUserId: null,
      influenceLevel,
      interestLevel,
      communicationFrequency,
      preferredChannel: preferredChannel === "none" ? null : preferredChannel,
      notes: notes.trim() || null,
      riskAssessment: riskAssessment.trim() || null,
    });
  };

  const selectedTypeName = useMemo(() => {
    return sortedTypes.find((t) => t.id === stakeholderTypeId)?.name ?? "—";
  }, [sortedTypes, stakeholderTypeId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Nombre</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Cliente ABC / Juan Pérez"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            {isEdit ? (
              <Input value={selectedTypeName} disabled />
            ) : (
              <Select value={stakeholderTypeId} onValueChange={setStakeholderTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {sortedTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.code} — {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Organización (opcional)</Label>
            <Input
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Ej: Proveedor XYZ"
            />
          </div>

          <div className="space-y-2">
            <Label>Email (opcional)</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Teléfono (opcional)</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+57 ..."
            />
          </div>

          <div className="space-y-2">
            <Label>Influencia</Label>
            <Select value={influenceLevel} onValueChange={setInfluenceLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INFLUENCE_LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Interés</Label>
            <Select value={interestLevel} onValueChange={setInterestLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTEREST_LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Frecuencia de comunicación</Label>
            <Select
              value={communicationFrequency}
              onValueChange={setCommunicationFrequency}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMMUNICATION_FREQUENCIES.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Canal preferido (opcional)</Label>
            <Select value={preferredChannel} onValueChange={setPreferredChannel}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">—</SelectItem>
                {PREFERRED_CHANNELS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Notas (opcional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Necesidades, expectativas, acuerdos..."
              rows={3}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Evaluación de riesgo (opcional)</Label>
            <Textarea
              value={riskAssessment}
              onChange={(e) => setRiskAssessment(e.target.value)}
              placeholder="Riesgos asociados y mitigación..."
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

export function StakeholderUpsertDialog({
  open,
  onOpenChange,
  mode,
  stakeholder,
  types,
  saving,
  onCreate,
  onUpdate,
}: Props) {
  const key = `${open ? "open" : "closed"}-${mode}-${stakeholder?.id ?? "new"}`;
  return (
    <StakeholderUpsertDialogInner
      key={key}
      open={open}
      onOpenChange={onOpenChange}
      mode={mode}
      stakeholder={stakeholder}
      types={types}
      saving={saving}
      onCreate={onCreate}
      onUpdate={onUpdate}
    />
  );
}
