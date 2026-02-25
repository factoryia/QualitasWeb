"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { UpdateUserRequest } from "@/features/users/services/users.service";
import type { UserDto } from "@/features/users/services/users.service";
import type { RoleDto } from "@/services/identity/services/roles.service";

interface UserEditModalProps {
  open: boolean;
  user: UserDto | null;
  form: UpdateUserRequest | null;
  roleIds: string[];
  isActive: boolean | null;
  roles: RoleDto[];
  error: string;
  loading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (updater: (prev: UpdateUserRequest | null) => UpdateUserRequest | null) => void;
  onRoleIdsChange: (ids: string[]) => void;
  onIsActiveChange: (active: boolean) => void;
}

export function UserEditModal({
  open,
  user,
  form,
  roleIds,
  isActive,
  roles,
  error,
  loading,
  onClose,
  onSubmit,
  onFormChange,
  onRoleIdsChange,
  onIsActiveChange,
}: UserEditModalProps) {
  if (!open || !user || !form) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="max-h-[90vh] w-full max-w-md overflow-y-auto p-6">
        <h2 className="text-lg font-semibold">Editar usuario</h2>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Nombre</label>
              <Input
                value={form.firstName ?? ""}
                onChange={(e) =>
                  onFormChange((f) => (f ? { ...f, firstName: e.target.value } : f))
                }
                placeholder="Nombre"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Apellido</label>
              <Input
                value={form.lastName ?? ""}
                onChange={(e) =>
                  onFormChange((f) => (f ? { ...f, lastName: e.target.value } : f))
                }
                placeholder="Apellido"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Email</label>
            <Input
              type="email"
              value={form.email ?? ""}
              onChange={(e) =>
                onFormChange((f) => (f ? { ...f, email: e.target.value } : f))
              }
              placeholder="email@ejemplo.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-muted-foreground">Roles</label>
            <div className="max-h-32 space-y-2 overflow-y-auto rounded border p-2">
              {roles.map((role) => (
                <label key={role.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={roleIds.includes(role.id)}
                    onChange={(e) => {
                      if (e.target.checked) onRoleIdsChange([...roleIds, role.id]);
                      else onRoleIdsChange(roleIds.filter((id) => id !== role.id));
                    }}
                    className="rounded border-input"
                  />
                  <span className="text-sm">{role.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Estado</span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!isActive}
                onChange={(e) => onIsActiveChange(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm">{isActive ? "Activo" : "Inactivo"}</span>
            </label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Guardando…" : "Guardar"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
