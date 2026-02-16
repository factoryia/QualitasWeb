"use client";

import { useState, useEffect } from "react";
import {
  groupsService,
  type GroupDto,
  type CreateGroupCommand,
  type UpdateGroupCommand,
} from "@/services/identity/services/groups.service";
import { rolesService, type RoleDto } from "@/services/identity/services/roles.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { Pencil, Trash2, Plus } from "lucide-react";

export function GroupsTab() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const tenant = useAuthStore((s) => s.user?.tenant ?? "root");
  const auth = accessToken ? { accessToken, tenant } : undefined;
  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState<CreateGroupCommand>({
    name: "",
    description: "",
    isDefault: false,
    roleIds: [],
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<GroupDto | null>(null);
  const [editForm, setEditForm] = useState<UpdateGroupCommand>({
    name: "",
    description: "",
    isDefault: false,
    roleIds: [],
  });
  const [editLoading, setEditLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<GroupDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadGroups = () => {
    if (!auth) return;
    setLoading(true);
    groupsService
      .getGroups(undefined, auth)
      .then(setGroups)
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    loadGroups();
  }, [accessToken, tenant]);

  useEffect(() => {
    if (!auth) return;
    rolesService.getRoles(auth).then(setRoles).catch(() => setRoles([]));
  }, [auth]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setCreateError("");
    setCreateLoading(true);
    try {
      await groupsService.createGroup(
        {
          ...createForm,
          roleIds: createForm.roleIds?.length ? createForm.roleIds : null,
        },
        auth
      );
      setCreateOpen(false);
      setCreateForm({ name: "", description: "", isDefault: false, roleIds: [] });
      loadGroups();
    } catch (err: unknown) {
      const res = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { errors?: string[]; detail?: string } } }).response?.data
        : undefined;
      if (Array.isArray(res?.errors) && res.errors.length > 0) {
        setCreateError(res.errors.join(". "));
      } else if (res?.detail) {
        setCreateError(res.detail);
      } else {
        setCreateError("Error al crear el grupo. Intente de nuevo.");
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const openEdit = (group: GroupDto) => {
    setEditGroup(group);
    setEditForm({
      name: group.name,
      description: group.description ?? "",
      isDefault: group.isDefault,
      roleIds: group.roleIds ?? [],
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !editGroup) return;
    setEditLoading(true);
    try {
      await groupsService.updateGroup(
        editGroup.id,
        {
          ...editForm,
          roleIds: editForm.roleIds?.length ? editForm.roleIds : null,
        },
        auth
      );
      setEditOpen(false);
      setEditGroup(null);
      loadGroups();
    } catch (err) {
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !auth) return;
    setDeleteLoading(true);
    try {
      await groupsService.deleteGroup(deleteTarget.id, auth);
      setGroups((prev) => prev.filter((g) => g.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-end gap-4">
        <Button
          type="button"
          onClick={() => {
            setCreateOpen(true);
            setCreateError("");
            setCreateForm({ name: "", description: "", isDefault: false, roleIds: [] });
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Nuevo Grupo
        </Button>
      </div>

      {/* Modal crear grupo */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Crear grupo
            </h2>
            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Nombre</label>
                <Input
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="Nombre del grupo"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Descripción</label>
                <Input
                  value={createForm.description ?? ""}
                  onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Descripción (opcional)"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={createForm.isDefault}
                  onChange={(e) => setCreateForm((f) => ({ ...f, isDefault: e.target.checked }))}
                  className="rounded border-slate-300"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">Grupo por defecto</span>
              </label>
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
                          checked={(createForm.roleIds ?? []).includes(role.id)}
                          onChange={() =>
                            setCreateForm((f) => ({
                              ...f,
                              roleIds: (f.roleIds ?? []).includes(role.id)
                                ? (f.roleIds ?? []).filter((id) => id !== role.id)
                                : [...(f.roleIds ?? []), role.id],
                            }))
                          }
                          className="rounded border-slate-300"
                        />
                        <span className="text-sm">{role.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
              {createError && (
                <p className="text-sm text-red-600 dark:text-red-400">{createError}</p>
              )}
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

      {/* Modal editar grupo */}
      {editOpen && editGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Editar grupo</h2>
            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Nombre</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="Nombre del grupo"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Descripción</label>
                <Input
                  value={editForm.description ?? ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Descripción (opcional)"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editForm.isDefault}
                  onChange={(e) => setEditForm((f) => ({ ...f, isDefault: e.target.checked }))}
                  className="rounded border-slate-300"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">Grupo por defecto</span>
              </label>
              <div>
                <label className="mb-2 block text-sm text-slate-600 dark:text-slate-400">Roles</label>
                <div className="max-h-32 space-y-2 overflow-y-auto rounded border border-slate-200 p-2 dark:border-slate-700">
                  {roles.map((role) => (
                    <label key={role.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(editForm.roleIds ?? []).includes(role.id)}
                        onChange={() =>
                          setEditForm((f) => ({
                            ...f,
                            roleIds: (f.roleIds ?? []).includes(role.id)
                              ? (f.roleIds ?? []).filter((id) => id !== role.id)
                              : [...(f.roleIds ?? []), role.id],
                          }))
                        }
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm">{role.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={editLoading} className="flex-1">
                  {editLoading ? "Guardando…" : "Guardar"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)} disabled={editLoading}>
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar grupo"
        message="¿Está seguro de que desea eliminar este grupo? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={8} cols={4} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">
                    Descripción
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">
                    Miembros
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {groups.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      No hay grupos
                    </td>
                  </tr>
                ) : (
                  groups.map((group) => (
                    <tr
                      key={group.id}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    >
                      <td className="px-4 py-3 font-medium">{group.name}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {group.description ?? "—"}
                      </td>
                      <td className="px-4 py-3">{group.memberCount ?? 0}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(group)}
                          className="mr-2 h-8 w-8 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(group)}
                          className="h-8 w-8 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
