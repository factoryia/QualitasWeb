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
import type { ClausulaRequisitoDto } from "../../services/compliance.service";

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

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clause: ClausulaRequisitoDto | null;
  onSubmit: (data: {
    codigo: string;
    descripcion: string;
    tipoEvidencia: string;
    frecuenciaVerificacion: string;
    pesoPonderacion: number;
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
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipoEvidencia, setTipoEvidencia] = useState("Documental");
  const [frecuenciaVerificacion, setFrecuenciaVerificacion] = useState("Anual");
  const [pesoPonderacion, setPesoPonderacion] = useState<string>("10");

  useEffect(() => {
    if (open) {
      setCodigo("");
      setDescripcion("");
      setTipoEvidencia("Documental");
      setFrecuenciaVerificacion("Anual");
      setPesoPonderacion("10");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!descripcion.trim() || !clause) return;
    const peso = Number.parseFloat(pesoPonderacion);
    if (Number.isNaN(peso) || peso < 0) return;
    onSubmit({
      codigo: codigo.trim() || `C-${clause.numeroClausula}`,
      descripcion: descripcion.trim(),
      tipoEvidencia: tipoEvidencia.trim() || "Documental",
      frecuenciaVerificacion: frecuenciaVerificacion.trim() || "Anual",
      pesoPonderacion: peso,
    });
  };

  if (!clause) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Agregar Criterio de Cumplimiento</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Cláusula {clause.numeroClausula} — {clause.titulo}
          </p>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Código (opcional)</Label>
            <Input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej: C1, 8.3.1"
            />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describa el criterio de cumplimiento..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo de evidencia</Label>
            <Select value={tipoEvidencia} onValueChange={setTipoEvidencia}>
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
              value={frecuenciaVerificacion}
              onValueChange={setFrecuenciaVerificacion}
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
              value={pesoPonderacion}
              onChange={(e) => setPesoPonderacion(e.target.value)}
              placeholder="10"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={saving || !descripcion.trim()}
            onClick={handleSubmit}
          >
            {saving ? "Guardando..." : "Agregar criterio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
