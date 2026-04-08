"use client";

import { useState, useEffect } from "react";
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
import type { ClausulaRequisitoDto } from "../../api/clausulas-requisitos";

const TIPOS_EVIDENCIA = [
  "Documental",
  "Registro",
  "Observación",
  "Entrevista",
  "Otro",
];

const FRECUENCIAS = [
  "Anual",
  "Semestral",
  "Trimestral",
  "Mensual",
  "Continua",
  "Por proceso",
];

import { Switch } from "@/components/ui/switch";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clause: ClausulaRequisitoDto | null;
  onSubmit: (data: {
    code: string;
    description: string;
    evidenceType: string;
    verificationFrequency: string;
    weightedScore: number;
    isCritical: boolean;
  }) => void | Promise<void>;
  saving: boolean;
}

export function CriterioCumplimientoAddDialog({
  open,
  onOpenChange,
  clause,
  onSubmit,
  saving,
}: Props) {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceType, setEvidenceType] = useState("Documental");
  const [verificationFrequency, setVerificationFrequency] = useState("Anual");
  const [weight, setWeight] = useState<string>("10");
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    if (open) {
      setCode("");
      setDescription("");
      setEvidenceType("Documental");
      setVerificationFrequency("Anual");
      setWeight("10");
      setIsCritical(false);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!description.trim() || !clause) return;
    const w = Number.parseFloat(weight);
    if (Number.isNaN(w) || w < 0) return;
    onSubmit({
      code: code.trim() || `C-${clause.clauseNumber}`,
      description: description.trim(),
      evidenceType: evidenceType.trim() || "Documental",
      verificationFrequency: verificationFrequency.trim() || "Anual",
      weightedScore: w,
      isCritical,
    });
  };

  if (!clause) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Agregar Criterio de Cumplimiento</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Cláusula {clause.clauseNumber} — {clause.title}
          </p>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Código (opcional)</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ej: C1, 8.3.1"
            />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describa el criterio de cumplimiento..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo de evidencia</Label>
            <Select value={evidenceType} onValueChange={setEvidenceType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_EVIDENCIA.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Frecuencia de verificación</Label>
            <Select
              value={verificationFrequency}
              onValueChange={setVerificationFrequency}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FRECUENCIAS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Peso ponderación (0-100)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="10"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Es Crítico</Label>
            <Switch checked={isCritical} onCheckedChange={setIsCritical} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={saving || !description.trim()}
            onClick={handleSubmit}
          >
            {saving ? "Guardando..." : "Agregar criterio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
