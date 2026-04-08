"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { RoleDto } from "../types";
import { rolesApi } from "../api/roles";

type Mode = "create" | "edit";

interface RoleFormSheetProps {
  open: boolean;
  mode: Mode;
  onOpenChange: (open: boolean) => void;
  role?: RoleDto | null;
  onCompleted: () => void;
}

export function RoleFormSheet({
  open,
  mode,
  onOpenChange,
  role,
  onCompleted,
}: RoleFormSheetProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissionsText, setPermissionsText] = useState("");

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) return;
    if (isEdit && role) {
      setName(role.name ?? "");
      setDescription(role.description ?? "");
      setPermissionsText((role.permissions ?? []).join("\n"));
    } else {
      setName("");
      setDescription("");
      setPermissionsText("");
    }
  }, [open, isEdit, role]);

  const mutation = useMutation({
    mutationFn: async () => {
      const trimmedPermissions = permissionsText
        .split("\n")
        .map((p) => p.trim())
        .filter(Boolean);

      const upserted = await rolesApi.upsert({
        id: isEdit && role ? role.id : undefined,
        name,
        description,
      });

      await rolesApi.updatePermissions(upserted.id, trimmedPermissions);
    },
    onSuccess: () => {
      onCompleted();
      onOpenChange(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const title = isEdit ? "Editar rol" : "Nuevo rol";
  const descriptionText = isEdit
    ? "Actualiza el nombre, descripción y permisos de este rol."
    : "Crea un nuevo rol del sistema y define sus permisos.";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg">
        <form
          onSubmit={handleSubmit}
          className="flex h-full flex-col gap-4 overflow-hidden"
        >
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{descriptionText}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Nombre del rol
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-0 focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-0 focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Permisos (uno por línea)
              </label>
              <textarea
                value={permissionsText}
                onChange={(e) => setPermissionsText(e.target.value)}
                rows={8}
                placeholder="Permissions.Identity.Users.View&#10;Permissions.Identity.Users.Update"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono outline-none ring-0 focus:border-primary"
              />
              <p className="text-[11px] text-muted-foreground">
                Cada permiso debe escribirse en una línea separada. El conjunto
                que guardes aquí reemplazará completamente los permisos
                anteriores del rol.
              </p>
            </div>
          </div>

          <SheetFooter>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={mutation.status === "pending"}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {mutation.status === "pending"
                  ? "Guardando..."
                  : isEdit
                    ? "Guardar cambios"
                    : "Crear rol"}
              </button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

