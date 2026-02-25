"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { RegisterUserCommand } from "@/features/users/services/users.service";
import type { RoleDto } from "@/services/identity/services/roles.service";

interface UserCreateModalProps {
  open: boolean;
  form: RegisterUserCommand;
  roleIds: string[];
  roles: RoleDto[];
  error: string;
  loading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (updater: (prev: RegisterUserCommand) => RegisterUserCommand) => void;
  onRoleIdsChange: (ids: string[]) => void;
}

export function UserCreateModal({
  open,
  form,
  roleIds,
  roles,
  error,
  loading,
  onClose,
  onSubmit,
  onFormChange,
  onRoleIdsChange,
}: UserCreateModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="max-h-[90vh] w-full max-w-md overflow-y-auto p-6">
        <h2 className="text-lg font-semibold">Crear usuario</h2>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Nombre</label>
              <Input
                value={form.firstName}
                onChange={(e) => onFormChange((f) => ({ ...f, firstName: e.target.value }))}
                required
                placeholder="Nombre"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Apellido</label>
              <Input
                value={form.lastName}
                onChange={(e) => onFormChange((f) => ({ ...f, lastName: e.target.value }))}
                required
                placeholder="Apellido"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => {
                const email = e.target.value;
                const shouldSuggest = !form.userName || form.userName.trim().length === 0;
                onFormChange((f) => ({
                  ...f,
                  email,
                  userName: shouldSuggest
                    ? (email.split("@")[0] || "").replace(/[^a-zA-Z0-9]/g, "")
                    : f.userName,
                }));
              }}
              required
              placeholder="email@ejemplo.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Usuario</label>
            <Input
              value={form.userName}
              onChange={(e) => onFormChange((f) => ({ ...f, userName: e.target.value }))}
              required
              placeholder="santiagosb"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">
              Contraseña (mín. 10 caracteres)
            </label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => onFormChange((f) => ({ ...f, password: e.target.value }))}
              required
              minLength={10}
              placeholder="Mínimo 10 caracteres"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">
              Confirmar contraseña
            </label>
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                onFormChange((f) => ({ ...f, confirmPassword: e.target.value }))
              }
              required
              minLength={10}
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
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creando…" : "Crear"}
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
