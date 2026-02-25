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
import type { ClausulaRequisitoDto } from "../../services/compliance.service";

const TIPOS_REQUISITO = [
  "Requisito",
  "Sección",
  "Subsección",
  "Criterio",
  "Otro",
];

export interface ClausulaEditFormData {
  titulo: string;
  tipoRequisito: string;
  esAuditable: boolean;
  clausulaPadreId: string | null;
  descripcion: string | null;
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
  const [titulo, setTitulo] = useState("");
  const [tipoRequisito, setTipoRequisito] = useState("Requisito");
  const [esAuditable, setEsAuditable] = useState(true);
  const [clausulaPadreId, setClausulaPadreId] = useState<string>("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    if (clause && open) {
      setTitulo(clause.titulo);
      setTipoRequisito(clause.tipoRequisito || "Requisito");
      setEsAuditable(clause.esAuditable);
      setClausulaPadreId(clause.clausulaPadreId ?? "");
      setDescripcion(clause.descripcion ?? "");
    }
  }, [clause, open]);

  const rootClauses = existingClauses.filter(
    (c) => !c.clausulaPadreId && c.id !== clause?.id
  );

  const handleSubmit = () => {
    if (!titulo.trim()) return;
    onSubmit({
      titulo: titulo.trim(),
      tipoRequisito: tipoRequisito.trim() || "Requisito",
      esAuditable,
      clausulaPadreId: clausulaPadreId || null,
      descripcion: descripcion.trim() || null,
    });
  };

  if (!clause) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Cláusula — {clause.numeroClausula}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Número (solo lectura)</Label>
            <Input value={clause.numeroClausula} readOnly className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título del requisito"
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo de requisito</Label>
            <Select value={tipoRequisito} onValueChange={setTipoRequisito}>
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
              <Select value={clausulaPadreId} onValueChange={setClausulaPadreId}>
                <SelectTrigger>
                  <SelectValue placeholder="Ninguna (raíz)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Ninguna (raíz)</SelectItem>
                  {rootClauses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.numeroClausula} — {c.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Label>Es auditable</Label>
            <Switch checked={esAuditable} onCheckedChange={setEsAuditable} />
          </div>
          <div className="space-y-2">
            <Label>Descripción (opcional)</Label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
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
            disabled={saving || !titulo.trim()}
            onClick={handleSubmit}
          >
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
