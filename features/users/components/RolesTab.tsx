"use client";

import { useState, useEffect } from "react";
import {
  rolesService,
  type RoleDto,
  type UpsertRoleCommand,
} from "@/services/identity/services/roles.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { Pencil, Trash2, Plus } from "lucide-react";

export function RolesTab() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const tenant = useAuthStore((s) => s.user?.tenant ?? "root");
  const auth = accessToken ? { accessToken, tenant } : undefined;
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState<UpsertRoleCommand>({
    name: "",
    description: "",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editRole, setEditRole] = useState<RoleDto | null>(null);
  const [editForm, setEditForm] = useState<UpsertRoleCommand>({ name: "", description: "" });
  const [editLoading, setEditLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<RoleDto | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadRoles = () => {
    if (!auth) return;
    setLoading(true);
    rolesService
      .getRoles(auth)
      .then(setRoles)
      .catch(() => setRoles([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    loadRoles();
  }, [accessToken, tenant]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setCreateLoading(true);
    try {
      await rolesService.createOrUpdateRole(createForm, auth);
      setCreateOpen(false);
      setCreateForm({ name: "", description: "" });
      loadRoles();
    } catch (err) {
      console.error(err);
    } finally {
      setCreateLoading(false);
    }
  };

  const openEdit = (role: RoleDto) => {
    setEditRole(role);
    setEditForm({
      id: role.id,
      name: role.name,
      description: role.description ?? "",
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !editRole) return;
    setEditLoading(true);
    try {
      await rolesService.createOrUpdateRole(
        { id: editRole.id, name: editForm.name, description: editForm.description ?? null },
        auth
      );
      setEditOpen(false);
      setEditRole(null);
      loadRoles();
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
      await rolesService.deleteRole(deleteTarget.id, auth);
      setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id));
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
            setCreateForm({ name: "", description: "" });
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Nuevo Rol
        </Button>
      </div>

      {/* Modal crear rol */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Crear rol
            </h2>
            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Nombre</label>
                <Input
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="Nombre del rol"
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

      {/* Modal editar rol */}
      {editOpen && editRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Editar rol</h2>
            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm text-slate-600 dark:text-slate-400">Nombre</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="Nombre del rol"
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
        title="Eliminar rol"
        message="¿Está seguro de que desea eliminar este rol? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={8} cols={3} />
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
                  <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                      No hay roles
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr
                      key={role.id}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                    >
                      <td className="px-4 py-3 font-medium">{role.name}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {role.description ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(role)}
                          className="mr-2 h-8 w-8 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(role)}
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
