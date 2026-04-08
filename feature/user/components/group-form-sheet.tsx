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
import type { GroupDto, RoleDto } from "../types";
import { groupsApi } from "../api/groups";

type Mode = "create" | "edit";

interface GroupFormSheetProps {
  open: boolean;
  mode: Mode;
  onOpenChange: (open: boolean) => void;
  group?: GroupDto | null;
  roles: RoleDto[];
  onCompleted: () => void;
}

export function GroupFormSheet({
  open,
  mode,
  onOpenChange,
  group,
  roles,
  onCompleted,
}: GroupFormSheetProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) return;

    if (isEdit && group) {
      setName(group.name ?? "");
      setDescription(group.description ?? "");
      setIsDefault(group.isDefault);
      setSelectedRoleIds(group.roleIds ?? []);
    } else {
      setName("");
      setDescription("");
      setIsDefault(false);
      setSelectedRoleIds([]);
    }
  }, [open, isEdit, group]);

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        description,
        isDefault,
        roleIds: selectedRoleIds,
      };

      if (isEdit && group) {
        await groupsApi.update(group.id, payload);
      } else {
        await groupsApi.create(payload);
      }
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

  const title = isEdit ? "Editar grupo" : "Nuevo grupo";
  const descriptionText = isEdit
    ? "Actualiza el nombre, descripción y roles asociados a este grupo."
    : "Crea un nuevo grupo y define qué roles heredan sus miembros.";

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
                Nombre del grupo
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

            <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="h-3.5 w-3.5 rounded border border-input text-primary focus-visible:outline-none"
              />
              Marcar como grupo por defecto
            </label>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Roles asociados
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {roles.map((r) => {
                  const active = selectedRoleIds.includes(r.id);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => toggleRole(r.id)}
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {r.name}
                    </button>
                  );
                })}
                {roles.length === 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    No hay roles definidos aún. Crea primero uno o más roles
                    para poder asociarlos a este grupo.
                  </p>
                )}
              </div>
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
                    : "Crear grupo"}
              </button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

