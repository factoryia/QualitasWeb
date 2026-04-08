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
import type {
  OrganizationUnitDto,
  PositionDto,
  RegisterUserPayload,
  RoleDto,
  UpdateUserAdminPayload,
  UserWithOrg,
  UserRoleDto,
} from "../types";
import { usersApi } from "../api/users";
import { userRolesApi } from "../api/user-roles";

type Mode = "create" | "edit";

interface UserFormSheetProps {
  open: boolean;
  mode: Mode;
  onOpenChange: (open: boolean) => void;
  user?: UserWithOrg | null;
  roles: RoleDto[];
  positions: PositionDto[];
  organizationUnits: OrganizationUnitDto[];
  onCompleted: () => void;
}

export function UserFormSheet({
  open,
  mode,
  onOpenChange,
  user,
  roles,
  positions,
  organizationUnits,
  onCompleted,
}: UserFormSheetProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [positionId, setPositionId] = useState<string | undefined>();
  const [organizationUnitId, setOrganizationUnitId] = useState<
    string | undefined
  >();
  const [roleId, setRoleId] = useState<string | undefined>();

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) return;

    if (isEdit && user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setEmail(user.email ?? "");
      setUserName(user.userName ?? "");
      setPhoneNumber(user.phoneNumber ?? "");
      setPositionId(user.positionId ?? undefined);
      setOrganizationUnitId(user.organizationUnitId ?? undefined);
      const matchingRole = roles.find((r) => r.name === user.roleName);
      setRoleId(matchingRole?.id);
      setPassword("");
      setConfirmPassword("");
    } else {
      setFirstName("");
      setLastName("");
      setEmail("");
      setUserName("");
      setPhoneNumber("");
      setPositionId(undefined);
      setOrganizationUnitId(undefined);
      setRoleId(undefined);
      setPassword("");
      setConfirmPassword("");
    }
  }, [open, isEdit, user, roles]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEdit && user) {
        const updatePayload: Omit<UpdateUserAdminPayload, "id"> = {
          firstName,
          lastName,
          email,
          phoneNumber,
          organizationUnitId: organizationUnitId ?? null,
          positionId: positionId ?? null,
          roleId: roleId ?? "",
        };
        await usersApi.updateAsAdmin(user.id, updatePayload);

        if (roleId) {
          const selectedRole = roles.find((r) => r.id === roleId);
          if (selectedRole) {
            const payload: UserRoleDto[] = [
              {
                roleId: selectedRole.id,
                roleName: selectedRole.name,
                description: undefined,
                enabled: true,
              },
            ];
            await userRolesApi.assignRoles(user.id, payload);
          }
        }
        return;
      }

      // Create
      const registerPayload: RegisterUserPayload = {
        firstName,
        lastName,
        email,
        userName,
        password,
        confirmPassword,
        phoneNumber,
      };
      const newUserId = await usersApi.register(registerPayload);

      const updatePayload: Omit<UpdateUserAdminPayload, "id"> = {
        firstName,
        lastName,
        email,
        phoneNumber,
        organizationUnitId: organizationUnitId ?? null,
        positionId: positionId ?? null,
        roleId: roleId ?? "",
      };
      await usersApi.updateAsAdmin(newUserId, updatePayload);

      if (roleId) {
        const selectedRole = roles.find((r) => r.id === roleId);
        if (selectedRole) {
          const payload: UserRoleDto[] = [
            {
              roleId: selectedRole.id,
              roleName: selectedRole.name,
              description: undefined,
              enabled: true,
            },
          ];
          await userRolesApi.assignRoles(newUserId, payload);
        }
      }
    },
    onSuccess: () => {
      onCompleted();
      onOpenChange(false);
    },
  });

  const title = isEdit ? "Editar usuario" : "Nuevo usuario";
  const description = isEdit
    ? "Actualiza los datos del usuario, su cargo, área y rol."
    : "Crea un nuevo usuario del sistema y asigna su contexto organizacional.";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEdit && password !== confirmPassword) {
      // Validación mínima local
      alert("Las contraseñas no coinciden.");
      return;
    }
    mutation.mutate();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg">
        <form
          onSubmit={handleSubmit}
          className="flex h-full flex-col gap-4 overflow-hidden"
        >
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Nombre
                </label>
                <input
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-0 focus:border-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Apellidos
                </label>
                <input
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-0 focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-0 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Usuario
                </label>
                <input
                  required
                  disabled={isEdit}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-0 focus:border-primary disabled:bg-muted"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Teléfono
                </label>
                <input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-0 focus:border-primary"
                />
              </div>
            </div>

            {!isEdit && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Contraseña
                  </label>
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-0 focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Confirmar contraseña
                  </label>
                  <input
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-0 focus:border-primary"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Cargo
                </label>
                <select
                  value={positionId ?? ""}
                  onChange={(e) =>
                    setPositionId(e.target.value || undefined)
                  }
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-0 focus:border-primary"
                >
                  <option value="">Seleccionar cargo</option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Área (dependencia)
                </label>
                <select
                  value={organizationUnitId ?? ""}
                  onChange={(e) =>
                    setOrganizationUnitId(e.target.value || undefined)
                  }
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-0 focus:border-primary"
                >
                  <option value="">Seleccionar área</option>
                  {organizationUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Rol sistema
              </label>
              <select
                value={roleId ?? ""}
                onChange={(e) => setRoleId(e.target.value || undefined)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-0 focus:border-primary"
              >
                <option value="">Seleccionar rol</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
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
                    : "Crear usuario"}
              </button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

