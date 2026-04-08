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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    code: string;
    description: string;
    guidelineType: string;
  }) => void | Promise<void>;
  saving: boolean;
}

export function MipgGuidelineAddDialog({
  open,
  onOpenChange,
  onSubmit,
  saving,
}: Props) {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [guidelineType, setGuidelineType] = useState("Mandatory");

  useEffect(() => {
    if (open) {
      setCode("");
      setDescription("");
      setGuidelineType("Mandatory");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!code.trim() || !description.trim()) return;
    
    onSubmit({
      code: code.trim(),
      description: description.trim(),
      guidelineType,
    });
  };

  const isValid = code.trim() && description.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo Lineamiento MIPG</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Código</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ej: 3.1.2"
            />
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del lineamiento..."
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={guidelineType} onValueChange={setGuidelineType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mandatory">Obligatorio</SelectItem>
                <SelectItem value="Gradual">Gradual</SelectItem>
                <SelectItem value="Differential">Diferencial</SelectItem>
              </SelectContent>
            </Select>
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
            {saving ? "Guardando..." : "Crear Lineamiento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
