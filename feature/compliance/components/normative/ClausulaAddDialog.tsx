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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClausulaRequisitoDto } from "../../api/clausulas-requisitos";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marcoNormativoId: string;
  existingClauses: ClausulaRequisitoDto[];
  onSubmit: (data: {
    clauseNumber: string;
    title: string;
    requirementType: string;
    isAuditable: boolean;
    parentRequirementId: string | null;
    description: string | null;
  }) => void | Promise<void>;
  saving: boolean;
}

const TIPOS_REQUISITO = [
  "Requisito",
  "Sección",
  "Subsección",
  "Criterio",
  "Otro",
];

export function ClausulaAddDialog({
  open,
  onOpenChange,
  marcoNormativoId,
  existingClauses,
  onSubmit,
  saving,
}: Props) {
  const [clauseNumber, setClauseNumber] = useState("");
  const [title, setTitle] = useState("");
  const [requirementType, setRequirementType] = useState("Requisito");
  const [isAuditable, setIsAuditable] = useState(true);
  const [parentRequirementId, setParentRequirementId] = useState<string>("none");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setClauseNumber("");
      setTitle("");
      setRequirementType("Requisito");
      setIsAuditable(true);
      setParentRequirementId("none");
      setDescription("");
    }
  }, [open]);

  const rootClauses = existingClauses.filter((c) => !c.parentRequirementId);

  const handleSubmit = () => {
    if (!clauseNumber.trim() || !title.trim()) return;
    onSubmit({
      clauseNumber: clauseNumber.trim(),
      title: title.trim(),
      requirementType: requirementType.trim() || "Requisito",
      isAuditable,
      parentRequirementId: parentRequirementId === "none" ? null : parentRequirementId,
      description: description.trim() || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Agregar Cláusula</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Número de cláusula</Label>
            <Input
              value={clauseNumber}
              onChange={(e) => setClauseNumber(e.target.value)}
              placeholder="Ej: 8.3"
            />
          </div>
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Diseño y desarrollo de los productos y servicios"
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo de requisito</Label>
            <Select value={requirementType} onValueChange={setRequirementType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_REQUISITO.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {rootClauses.length > 0 && (
            <div className="space-y-2">
              <Label>Cláusula padre (opcional)</Label>
              <Select value={parentRequirementId} onValueChange={setParentRequirementId}>
                <SelectTrigger>
                  <SelectValue placeholder="Ninguna (raíz)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguna (raíz)</SelectItem>
                  {rootClauses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.clauseNumber} — {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Label>Es auditable</Label>
            <Switch checked={isAuditable} onCheckedChange={setIsAuditable} />
          </div>
          <div className="space-y-2">
            <Label>Descripción (opcional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del requisito..."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={saving || !clauseNumber.trim() || !title.trim()}
            onClick={handleSubmit}
          >
            {saving ? "Guardando..." : "Agregar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
