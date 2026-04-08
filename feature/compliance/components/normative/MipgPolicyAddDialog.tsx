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
import type { MipgDimensionDto } from "../../api/mipg-dimensiones";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dimensions: MipgDimensionDto[];
  onSubmit: (data: {
    dimensionId: string;
    number: number;
    name: string;
    description: string;
    rectorEntity: string;
  }) => void | Promise<void>;
  saving: boolean;
}

export function MipgPolicyAddDialog({
  open,
  onOpenChange,
  dimensions,
  onSubmit,
  saving,
}: Props) {
  const [dimensionId, setDimensionId] = useState("");
  const [number, setNumber] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rectorEntity, setRectorEntity] = useState("");

  useEffect(() => {
    if (open) {
      setDimensionId("");
      setNumber("");
      setName("");
      setDescription("");
      setRectorEntity("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!dimensionId || !number || !name.trim() || !rectorEntity.trim()) return;
    
    onSubmit({
      dimensionId,
      number: parseInt(number, 10),
      name: name.trim(),
      description: description.trim(),
      rectorEntity: rectorEntity.trim(),
    });
  };

  const isValid = dimensionId && number && name.trim() && rectorEntity.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva Política MIPG</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Dimensión</Label>
            <Select value={dimensionId} onValueChange={setDimensionId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una dimensión" />
              </SelectTrigger>
              <SelectContent>
                {dimensions.map((dim) => (
                  <SelectItem key={dim.id} value={dim.id}>
                    D{dim.number} - {dim.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Número de Política</Label>
            <Input
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Ej: 1"
            />
          </div>

          <div className="space-y-2">
            <Label>Nombre de la Política</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Gestión Estratégica del Talento Humano"
            />
          </div>

          <div className="space-y-2">
            <Label>Descripción (Opcional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción de la política..."
              className="resize-none h-20"
            />
          </div>

          <div className="space-y-2">
            <Label>Entidad Rectora</Label>
            <Input
              value={rectorEntity}
              onChange={(e) => setRectorEntity(e.target.value)}
              placeholder="Ej: Función Pública"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={saving || !isValid}
            onClick={handleSubmit}
          >
            {saving ? "Guardando..." : "Crear Política"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
