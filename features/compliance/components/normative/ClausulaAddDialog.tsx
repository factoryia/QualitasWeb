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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marcoNormativoId: string;
  existingClauses: ClausulaRequisitoDto[];
  onSubmit: (data: {
    numeroClausula: string;
    titulo: string;
    tipoRequisito: string;
    esAuditable: boolean;
    clausulaPadreId: string | null;
    descripcion: string | null;
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
  const [numeroClausula, setNumeroClausula] = useState("");
  const [titulo, setTitulo] = useState("");
  const [tipoRequisito, setTipoRequisito] = useState("Requisito");
  const [esAuditable, setEsAuditable] = useState(true);
  const [clausulaPadreId, setClausulaPadreId] = useState<string>("None");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    if (open) {
      setNumeroClausula("");
      setTitulo("");
      setTipoRequisito("Requisito");
      setEsAuditable(true);
      setClausulaPadreId("None");
      setDescripcion("");
    }
  }, [open]);

  const rootClauses = existingClauses.filter((c) => !c.clausulaPadreId);

  const handleSubmit = () => {
    if (!numeroClausula.trim() || !titulo.trim()) return;
    onSubmit({
      numeroClausula: numeroClausula.trim(),
      titulo: titulo.trim(),
      tipoRequisito: tipoRequisito.trim() || "Requisito",
      esAuditable,
      clausulaPadreId: clausulaPadreId === "none" ? null : clausulaPadreId,
      descripcion: descripcion.trim() || null,
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
              value={numeroClausula}
              onChange={(e) => setNumeroClausula(e.target.value)}
              placeholder="Ej: 8.3"
            />
          </div>
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Diseño y desarrollo de los productos y servicios"
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
                  <SelectItem value="none">Ninguna (raíz)</SelectItem>
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
            disabled={saving || !numeroClausula.trim() || !titulo.trim()}
            onClick={handleSubmit}
          >
            {saving ? "Guardando..." : "Agregar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
