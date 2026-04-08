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

const TIPOS_REQUISITO = [
  "Requisito",
  "Sección",
  "Subsección",
  "Criterio",
  "Otro",
];

export interface ClausulaEditFormData {
  title: string;
  requirementType: string;
  isAuditable: boolean;
  parentRequirementId: string | null;
  description: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clause: ClausulaRequisitoDto | null;
  existingClauses: ClausulaRequisitoDto[];
  onSubmit: (data: ClausulaEditFormData) => void | Promise<void>;
  saving: boolean;
}

export function ClausulaEditDialog({
  open,
  onOpenChange,
  clause,
  existingClauses,
  onSubmit,
  saving,
}: Props) {
  const [title, setTitle] = useState("");
  const [requirementType, setRequirementType] = useState("Requisito");
  const [isAuditable, setIsAuditable] = useState(true);
  const [parentRequirementId, setParentRequirementId] = useState<string>("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (clause && open) {
      setTitle(clause.title);
      setRequirementType(clause.requirementType || "Requisito");
      setIsAuditable(clause.isAuditable);
      setParentRequirementId(clause.parentRequirementId ?? "");
      setDescription(clause.description ?? "");
    }
  }, [clause, open]);

  const rootClauses = existingClauses.filter(
    (c) => !c.parentRequirementId && c.id !== clause?.id
  );

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      requirementType: requirementType.trim() || "Requisito",
      isAuditable,
      parentRequirementId: parentRequirementId || null,
      description: description.trim() || null,
    });
  };

  if (!clause) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Cláusula — {clause.clauseNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Número (solo lectura)</Label>
            <Input value={clause.clauseNumber} readOnly className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del requisito"
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
                  <SelectItem value="">Ninguna (raíz)</SelectItem>
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
            disabled={saving || !title.trim()}
            onClick={handleSubmit}
          >
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
