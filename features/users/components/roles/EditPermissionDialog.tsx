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
import type { PermissionItem } from "@/features/users/constants/role-permissions-ui";

interface EditPermissionDialogProps {
  open: boolean;
  permission: PermissionItem | null;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onPermissionChange: (updater: (p: PermissionItem | null) => PermissionItem | null) => void;
}

export function EditPermissionDialog({
  open,
  permission,
  onOpenChange,
  onSave,
  onPermissionChange,
}: EditPermissionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar permiso</DialogTitle>
        </DialogHeader>
        {permission && (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Código</Label>
              <Input
                value={permission.code}
                onChange={(e) =>
                  onPermissionChange((p) =>
                    p ? { ...p, code: e.target.value } : p
                  )
                }
                placeholder="Permissions.Module.Action"
              />
            </div>
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={permission.name}
                onChange={(e) =>
                  onPermissionChange((p) =>
                    p ? { ...p, name: e.target.value } : p
                  )
                }
                placeholder="Nombre visible"
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
