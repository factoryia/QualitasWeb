"use client";

import { useState, useEffect } from "react";
import {
  usersService,
  type UserDto,
  type RegisterUserCommand,
  type UpdateUserRequest,
} from "@/features/users/services/users.service";
import { rolesService, type RoleDto } from "@/services/identity/services/roles.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pencil, Trash2, Plus, Search, Filter, X, MoreVertical, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const authFromStore = () => {
  const token = useAuthStore.getState().accessToken;
  const tenant = useAuthStore.getState().user?.tenant ?? "root";
  return token ? { accessToken: token, tenant } : undefined;
};

export function UsersTab() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const tenant = useAuthStore((s) => s.user?.tenant ?? "root");
  const [data, setData] = useState<{ items: UserDto[]; totalCount: number; totalPages: number }>({
    items: [],
    totalCount: 0,
    totalPages: 0,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [userRolesMap, setUserRolesMap] = useState<Record<string, RoleDto[]>>({});
  const pageSize = 10;

  // Filtros
  const [searchText, setSearchText] = useState("");
  const [filterIsActive, setFilterIsActive] = useState<boolean | undefined>(undefined);
  const [filterEmailConfirmed, setFilterEmailConfirmed] = useState<boolean | undefined>(undefined);
  const [filterRoleId, setFilterRoleId] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Crear usuario
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState<RegisterUserCommand>({
    firstName: "",
    lastName: "",
    email: "",
    userName: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });
  const [createRoleIds, setCreateRoleIds] = useState<string[]>([]);

  // Editar usuario
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserDto | null>(null);
  const [editForm, setEditForm] = useState<UpdateUserRequest | null>(null);
  const [editRoleIds, setEditRoleIds] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editIsActive, setEditIsActive] = useState<boolean | null>(null);

  // Eliminar
  const [deleteTarget, setDeleteTarget] = useState<{ id: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const auth = authFromStore();

  const loadUsers = () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const params: {
      PageNumber?: number;
      PageSize?: number;
      Search?: string;
      IsActive?: boolean;
      EmailConfirmed?: boolean;
      RoleId?: string;
    } = {
      PageNumber: page,
      PageSize: pageSize,
    };
    if (searchText.trim()) params.Search = searchText.trim();
    if (filterIsActive !== undefined) params.IsActive = filterIsActive;
    if (filterEmailConfirmed !== undefined) params.EmailConfirmed = filterEmailConfirmed;
    if (filterRoleId) params.RoleId = filterRoleId;

    usersService
      .searchUsers(params, { accessToken, tenant })
      .then((res) => {
        if (!cancelled) {
          setData({
            items: res.items || [],
            totalCount: res.totalCount ?? 0,
            totalPages: res.totalPages ?? 0,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setData({ items: [], totalCount: 0, totalPages: 0 });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  };

  useEffect(() => {
    loadUsers();
  }, [page, accessToken, tenant, searchText, filterIsActive, filterEmailConfirmed, filterRoleId]);

  useEffect(() => {
    if (!auth) return;
    rolesService.getRoles(auth).then(setRoles).catch(() => setRoles([]));
  }, [accessToken, tenant]);

  // Cargar roles de usuarios cuando se carga la lista
  useEffect(() => {
    if (!auth || data.items.length === 0 || roles.length === 0) return;
    const loadUserRoles = async () => {
      const newMap: Record<string, RoleDto[]> = {};
      const rolesById = new Map(roles.map((r) => [r.id, r]));
      for (const user of data.items) {
        if (!user.id) continue;
        try {
          const userRoles = await usersService.getUserRoles(user.id, auth);
          const enabledRoleIds = userRoles
            .filter((r) => r.enabled && r.roleId)
            .map((r) => r.roleId!);
          newMap[user.id] = enabledRoleIds.map((id) => rolesById.get(id)).filter(Boolean) as RoleDto[];
        } catch {
          newMap[user.id] = [];
        }
      }
      setUserRolesMap(newMap);
    };
    loadUserRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.items.length, roles.length, accessToken, tenant]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await usersService.deleteUser(deleteTarget.id, auth);
      setData((prev) => ({
        ...prev,
        items: prev.items.filter((u) => u.id !== deleteTarget.id),
        totalCount: Math.max(0, prev.totalCount - 1),
      }));
      setDeleteTarget(null);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEdit = async (user: UserDto) => {
    const id = user.id ?? "";
    if (!id || !auth) return;
    setEditUser(user);
    setEditIsActive(user.isActive);
    setEditForm({
      id,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phoneNumber: user.phoneNumber ?? "",
      email: user.email ?? "",
      deleteCurrentImage: false,
    });
    try {
      const userRoles = await usersService.getUserRoles(id, auth);
      setEditRoleIds(
        userRoles.filter((r) => r.enabled && r.roleId).map((r) => r.roleId!)
      );
    } catch {
      setEditRoleIds([]);
    }
    setEditError("");
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm || !editUser?.id || !auth) return;
    setEditError("");
    setEditLoading(true);
    try {
      await usersService.updateUser(editUser.id, editForm);
      await usersService.assignUserRoles(
        editUser.id,
        {
          userId: editUser.id,
          userRoles: roles
            .filter((r) => editRoleIds.includes(r.id))
            .map((r) => ({
              roleId: r.id,
              roleName: r.name,
              description: r.description,
              enabled: true,
            })),
        },
        auth
      );
      if (editIsActive !== null && editIsActive !== editUser.isActive) {
        await usersService.toggleUserStatus(editUser.id, editIsActive, auth);
      }
      setEditOpen(false);
      setEditUser(null);
      const res = await usersService.searchUsers(
        { PageNumber: page, PageSize: pageSize },
        auth
      );
      setData({
        items: res.items ?? [],
        totalCount: res.totalCount ?? 0,
        totalPages: res.totalPages ?? 0,
      });
    } catch (err: unknown) {
      setEditError(
        err && typeof err === "object" && "message" in err
          ? String((err as Error).message)
          : "Error al guardar"
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    if (createForm.password.length < 10) {
      setCreateError("La contraseña debe tener al menos 10 caracteres.");
      return;
    }
    if (createForm.password !== createForm.confirmPassword) {
      setCreateError("Las contraseñas no coinciden");
      return;
    }
    setCreateLoading(true);
    try {
      const { userId } = await usersService.registerUser(createForm, auth);
      if (createRoleIds.length > 0 && auth) {
        await usersService.assignUserRoles(
          userId,
          {
            userId,
            userRoles: roles
              .filter((r) => createRoleIds.includes(r.id))
              .map((r) => ({
                roleId: r.id,
                roleName: r.name,
                description: r.description,
                enabled: true,
              })),
          },
          auth
        );
      }
      setCreateOpen(false);
      setCreateForm({
        firstName: "",
        lastName: "",
        email: "",
        userName: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
      });
      setCreateRoleIds([]);
      if (auth) {
        const res = await usersService.searchUsers(
          { PageNumber: 1, PageSize: pageSize },
          auth
        );
        setData({
          items: res.items ?? [],
          totalCount: res.totalCount ?? 0,
          totalPages: res.totalPages ?? 0,
        });
        setPage(1);
      }
    } catch (err: unknown) {
      const res = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { errors?: string[]; detail?: string } } }).response?.data
        : undefined;
      if (Array.isArray(res?.errors) && res.errors.length > 0) {
        setCreateError(res.errors.join(". "));
        return;
      }
      if (res?.detail) {
        setCreateError(res.detail);
        return;
      }
      setCreateError(
        err && typeof err === "object" && "message" in err
          ? String((err as Error).message)
          : "Error al crear el usuario"
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setFilterIsActive(undefined);
    setFilterEmailConfirmed(undefined);
    setFilterRoleId("");
    setPage(1);
  };

  const hasActiveFilters = searchText.trim() || filterIsActive !== undefined || filterEmailConfirmed !== undefined || filterRoleId;

  return (
    <div>
      <div className="mb-4 flex flex-col gap-4">
        {/* Barra de búsqueda y filtros */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre, email o rol..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                    "flex items-center gap-2 px-2 md:px-4", // Ajustamos padding lateral en móvil
                    filterRoleId ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20" : ""
                  )}
                >
                  <Filter className="h-4 w-4 shrink-0" />
                  <span className="hidden md:inline">
                    {filterRoleId
                      ? roles.find((r) => r.id === filterRoleId)?.name || "Roles"
                      : "Todos los roles"}
                  </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => {
                  setFilterRoleId("");
                  setPage(1);
                }}
              >
                Todos los roles
              </DropdownMenuItem>
              {roles.map((role) => (
                <DropdownMenuItem
                  key={role.id}
                  onClick={() => {
                    setFilterRoleId(role.id);
                    setPage(1);
                  }}
                >
                  {role.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="flex justify-between gap-2 px-2 md:px-4">
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="hidden md:inline">Todas las áreas</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Todas las áreas</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="button"
            onClick={() => {
              setCreateOpen(true);
              setCreateError("");
              setCreateRoleIds([]);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="size-4 shrink-0" />
           <span className="hidden md:inline">Nuevo usuario</span>
          </Button>
        </div>
      </div>

      {/* Modal crear usuario */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Crear usuario
            </h2>
            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Nombre</label>
                  <Input
                    value={createForm.firstName}
                    onChange={(e) => setCreateForm((f) => ({ ...f, firstName: e.target.value }))}
                    required
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Apellido</label>
                  <Input
                    value={createForm.lastName}
                    onChange={(e) => setCreateForm((f) => ({ ...f, lastName: e.target.value }))}
                    required
                    placeholder="Apellido"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Email</label>
                <Input
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm((f) => {
                      const email = e.target.value;
                      const shouldSuggestUserName = !f.userName || f.userName.trim().length === 0;
                      return {
                        ...f,
                        email,
                        userName: shouldSuggestUserName
                          ? (email.split("@")[0] || "").replace(/[^a-zA-Z0-9]/g, "")
                          : f.userName,
                      };
                    })
                  }
                  required
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">
                  Usuario (solo letras y números, sin espacios)
                </label>
                <Input
                  value={createForm.userName}
                  onChange={(e) => setCreateForm((f) => ({ ...f, userName: e.target.value }))}
                  required
                  placeholder="santiagosb"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Este identificador no puede tener espacios ni caracteres especiales.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Contraseña (mín. 10 caracteres)</label>
                <Input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  minLength={10}
                  placeholder="Mínimo 10 caracteres"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Confirmar contraseña</label>
                <Input
                  type="password"
                  value={createForm.confirmPassword}
                  onChange={(e) => setCreateForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  required
                  minLength={10}
                  placeholder="Mínimo 10 caracteres"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-600 dark:text-slate-400">Roles</label>
                <div className="max-h-32 space-y-2 overflow-y-auto rounded border border-slate-200 p-2 dark:border-slate-700">
                  {roles.length === 0 ? (
                    <p className="text-sm text-slate-500">No hay roles disponibles</p>
                  ) : (
                    roles.map((role) => (
                      <label key={role.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={createRoleIds.includes(role.id)}
                          onChange={(e) => {
                            if (e.target.checked) setCreateRoleIds((ids) => [...ids, role.id]);
                            else setCreateRoleIds((ids) => ids.filter((id) => id !== role.id));
                          }}
                          className="rounded border-slate-300"
                        />
                        <span className="text-sm">{role.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
              {createError && <p className="text-sm text-red-600 dark:text-red-400">{createError}</p>}
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={createLoading} className="flex-1">
                  {createLoading ? "Creando…" : "Crear"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={createLoading}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal editar usuario */}
      {editOpen && editForm && editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Editar usuario</h2>
            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Nombre</label>
                  <Input
                    value={editForm.firstName ?? ""}
                    onChange={(e) => setEditForm((f) => (f ? { ...f, firstName: e.target.value } : f))}
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Apellido</label>
                  <Input
                    value={editForm.lastName ?? ""}
                    onChange={(e) => setEditForm((f) => (f ? { ...f, lastName: e.target.value } : f))}
                    placeholder="Apellido"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Email</label>
                <Input
                  type="email"
                  value={editForm.email ?? ""}
                  onChange={(e) => setEditForm((f) => (f ? { ...f, email: e.target.value } : f))}
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-slate-600 dark:text-slate-400">Roles</label>
                <div className="max-h-32 space-y-2 overflow-y-auto rounded border border-slate-200 p-2 dark:border-slate-700">
                  {roles.map((role) => (
                    <label key={role.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editRoleIds.includes(role.id)}
                        onChange={(e) => {
                          if (e.target.checked) setEditRoleIds((ids) => [...ids, role.id]);
                          else setEditRoleIds((ids) => ids.filter((id) => id !== role.id));
                        }}
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm">{role.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-600 dark:text-slate-400">Estado</span>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {editIsActive ? "Activo" : "Inactivo"}
                  </span>
                </label>
              </div>
              {editError && <p className="text-sm text-red-600 dark:text-red-400">{editError}</p>}
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={editLoading} className="flex-1">
                  {editLoading ? "Guardando…" : "Guardar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  disabled={editLoading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar usuario"
        message="¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={10} cols={4} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">
                      USUARIO / EMAIL
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">
                      ROL SISTEMA
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">ESTADO</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                        No hay usuarios
                      </td>
                    </tr>
                  ) : (
                    data.items.map((user) => {
                      const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.userName || "";
                      const initials = fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2) || user.email?.[0]?.toUpperCase() || "U";
                      const userRoles = user.id ? userRolesMap[user.id] || [] : [];

                      return (
                        <tr
                          key={user.id ?? user.email ?? ""}
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                {user.imageUrl ? (
                                  <AvatarImage src={user.imageUrl} alt={fullName} />
                                ) : null}
                                <AvatarFallback className="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 text-sm font-medium">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-slate-900 dark:text-slate-100">{fullName || "—"}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{user.email ?? "—"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {userRoles.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {userRoles.map((role) => (
                                  <span
                                    key={role.id}
                                    className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                  >
                                    {role.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "h-2 w-2 rounded-full",
                                  user.isActive ? "bg-emerald-500" : "bg-slate-400"
                                )}
                              />
                              <span
                                className={
                                  user.isActive
                                    ? "text-emerald-600 dark:text-emerald-400 font-medium"
                                    : "text-slate-500"
                                }
                              >
                                {user.isActive ? "Activo" : "Inactivo"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  <MoreVertical className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEdit(user)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setDeleteTarget({ id: user.id ?? "" })}
                                  className="text-red-600 focus:text-red-600 dark:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Mostrando {data.items.length} {data.items.length === 1 ? "resultado" : "resultados"}
              </span>
              {data.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    &lt;
                  </Button>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Página {page} de {data.totalPages}
                  </span>
                  <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
                    &gt;
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
