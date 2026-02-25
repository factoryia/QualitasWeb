"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface AddPermissionDialogProps {
  open: boolean;
  code: string;
  name: string;
  onOpenChange: (open: boolean) => void;
  onCodeChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onAdd: () => void;
}

export function AddPermissionDialog({
  open,
  code,
  name,
  onOpenChange,
  onCodeChange,
  onNameChange,
  onAdd,
}: AddPermissionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear permiso</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Código</Label>
            <Input
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              placeholder="Permissions.Module.Action"
            />
          </div>
          <div className="space-y-2">
            <Label>Nombre (opcional)</Label>
            <Input
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Nombre visible"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onAdd} disabled={!code.trim()}>
            Añadir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
