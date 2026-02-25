"use client";

import { useState } from "react";
import type {
  GroupDto,
  CreateGroupCommand,
  UpdateGroupCommand,
} from "@/services/identity/services/groups.service";
import {
  useGroups,
  useGroupCreateMutation,
  useGroupUpdateMutation,
  useGroupDeleteMutation,
} from "@/features/users/hooks/use-groups-query";
import { useRoles } from "@/features/users/hooks/use-roles-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { Pencil, Trash2, Plus, Users } from "lucide-react";

export function GroupsTab() {
  const [createOpen, setCreateOpen] = useState(false);
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
  const [deleteTarget, setDeleteTarget] = useState<GroupDto | null>(null);

  const { data: groups = [], isLoading } = useGroups();
  const { data: roles = [] } = useRoles();
  const createMutation = useGroupCreateMutation();
  const updateMutation = useGroupUpdateMutation();
  const deleteMutation = useGroupDeleteMutation();

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    try {
      await createMutation.mutateAsync({
        ...createForm,
        roleIds: createForm.roleIds?.length ? createForm.roleIds : null,
      });
      setCreateOpen(false);
      setCreateForm({ name: "", description: "", isDefault: false, roleIds: [] });
    } catch (err: unknown) {
      const res =
        err && typeof err === "object" && "response" in err
          ? (err as {
              response?: { data?: { errors?: string[]; detail?: string } };
            }).response?.data
          : undefined;
      if (Array.isArray(res?.errors) && res.errors.length > 0) {
        setCreateError(res.errors.join(". "));
      } else if (res?.detail) {
        setCreateError(res.detail);
      } else {
        setCreateError("Error al crear el grupo. Intente de nuevo.");
      }
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
    if (!editGroup) return;
    try {
      await updateMutation.mutateAsync({
        id: editGroup.id,
        payload: {
          ...editForm,
          roleIds: editForm.roleIds?.length ? editForm.roleIds : null,
        },
      });
      setEditOpen(false);
      setEditGroup(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => {
            setCreateOpen(true);
            setCreateError("");
            setCreateForm({
              name: "",
              description: "",
              isDefault: false,
              roleIds: [],
            });
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Nuevo Grupo
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40 text-sm text-muted-foreground">
          Cargando grupos...
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm space-y-2">
          <Users className="h-10 w-10 opacity-40" />
          <p className="font-medium">Sin grupos creados</p>
          <p className="text-xs">
            Crea un grupo para organizar a tus usuarios.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => (
            <Card key={g.id} className="relative group">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{g.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {g.memberCount ?? 0} Miembro
                        {(g.memberCount ?? 0) !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEdit(g)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => setDeleteTarget(g)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {g.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {g.description}
                  </p>
                )}

                {(g.roleNames?.length ?? 0) > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-primary tracking-wider uppercase">
                      Roles incluidos
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(g.roleNames ?? []).map((name) => (
                        <Badge
                          key={name}
                          variant="outline"
                          className="text-[11px]"
                        >
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal crear grupo */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-h-[90vh] w-full max-w-md overflow-y-auto p-6">
            <h2 className="text-lg font-semibold">Crear grupo</h2>
            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  Nombre
                </label>
                <Input
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  placeholder="Nombre del grupo"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  Descripción
                </label>
                <Input
                  value={createForm.description ?? ""}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Descripción (opcional)"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={createForm.isDefault}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, isDefault: e.target.checked }))
                  }
                  className="rounded border-input"
                />
                <span className="text-sm text-muted-foreground">
                  Grupo por defecto
                </span>
              </label>
              <div>
                <label className="mb-2 block text-sm text-muted-foreground">
                  Roles
                </label>
                <div className="max-h-32 space-y-2 overflow-y-auto rounded border p-2">
                  {roles.map((role) => (
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
                        className="rounded border-input"
                      />
                      <span className="text-sm">{role.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              {createError && (
                <p className="text-sm text-destructive">{createError}</p>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1"
                >
                  {createMutation.isPending ? "Creando…" : "Crear"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                  disabled={createMutation.isPending}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modal editar grupo */}
      {editOpen && editGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-h-[90vh] w-full max-w-md overflow-y-auto p-6">
            <h2 className="text-lg font-semibold">Editar grupo</h2>
            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  Nombre
                </label>
                <Input
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  placeholder="Nombre del grupo"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  Descripción
                </label>
                <Input
                  value={editForm.description ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Descripción (opcional)"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editForm.isDefault}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, isDefault: e.target.checked }))
                  }
                  className="rounded border-input"
                />
                <span className="text-sm text-muted-foreground">
                  Grupo por defecto
                </span>
              </label>
              <div>
                <label className="mb-2 block text-sm text-muted-foreground">
                  Roles
                </label>
                <div className="max-h-32 space-y-2 overflow-y-auto rounded border p-2">
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
                        className="rounded border-input"
                      />
                      <span className="text-sm">{role.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1"
                >
                  {updateMutation.isPending ? "Guardando…" : "Guardar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  disabled={updateMutation.isPending}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar grupo"
        message="¿Está seguro de que desea eliminar este grupo? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
