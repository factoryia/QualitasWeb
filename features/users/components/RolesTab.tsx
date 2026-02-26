"use client";

import { useState, useEffect } from "react";
import type { UpsertRoleCommand } from "@/services/identity/services/roles.service";
import type { RoleDto } from "@/services/identity/services/roles.service";
import {
  useRoles,
  useRolePermissions,
  useRoleCreateOrUpdateMutation,
  useRoleDeleteMutation,
  useUpdateRolePermissionsMutation,
} from "@/features/users/hooks/use-roles-query";
import { ROLE_PERMISSION_GROUPS } from "@/features/users/constants/role-permissions-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { cn } from "@/lib/utils";
import { Plus, Shield, MoreVertical, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { RolePermissionsEditor } from "./roles/RolePermissionsEditor";

function RolesListSkeleton() {
  return (
    <div className="space-y-1 pr-2 ">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-10 w-full rounded-lg" />
      ))}
    </div>
  );
}

function RolePermissionsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      {[1, 2, 3].map((g) => (
        <div key={g} className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-12 rounded" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="grid gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function RolesTab() {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editRole, setEditRole] = useState<RoleDto | null>(null);
  const [editForm, setEditForm] = useState<UpsertRoleCommand>({
    name: "",
    description: "",
  });
  const [deleteTarget, setDeleteTarget] = useState<RoleDto | null>(null);

  const { data: roles = [], isLoading } = useRoles();
  const { data: rolePermissions, isLoading: loadingPermissions } =
    useRolePermissions(selectedRoleId);
  const createMutation = useRoleCreateOrUpdateMutation();
  const updateMutation = useRoleCreateOrUpdateMutation();
  const deleteMutation = useRoleDeleteMutation();
  const updatePermissionsMutation = useUpdateRolePermissionsMutation();

  const selectedRole = roles.find((r) => r.id === selectedRoleId);
  const grantedPermissionCodes = rolePermissions?.permissions ?? [];

 useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      if (!selectedRoleId && roles.length > 0) setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createMutation.mutateAsync({
        name: newName.trim(),
        description: newDesc.trim() || null,
      });
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
    } catch (err) {
      console.error(err);
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
    if (!editRole) return;
    try {
      await updateMutation.mutateAsync({
        id: editRole.id,
        name: editForm.name,
        description: editForm.description ?? null,
      });
      setEditOpen(false);
      setEditRole(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setSelectedRoleId((id) => (id === deleteTarget.id ? null : id));
      setDeleteTarget(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 h-full min-h-[500px]">
        
        {/* IZQUIERDA: LISTA DE ROLES */}
        {/* En móvil: se oculta si hay un rol seleccionado (hidden si selectedRoleId existe) */}
        <div className={cn(
          "w-full lg:w-64 shrink-0 space-y-3",
          selectedRoleId ? "hidden lg:block" : "block"
        )}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Roles Definidos</h3>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <ScrollArea className="h-[calc(100vh-320px)] lg:h-[calc(100vh-280px)]">
            {isLoading ? (
              <RolesListSkeleton />
            ) : (
              <div className="space-y-1 pr-2">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRoleId(r.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left border",
                      selectedRoleId === r.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Shield className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{r.name}</span>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* DERECHA: PERMISOS */}
        {/* En móvil: solo se muestra si hay un rol seleccionado */}
        <div className={cn(
          "flex-1 min-w-0",
          !selectedRoleId ? "hidden lg:block" : "block"
        )}>
          {selectedRole ? (
            <div className="space-y-4">
              {/* Botón Volver (Solo móvil) */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="lg:hidden mb-2 -ml-2 text-muted-foreground"
                onClick={() => setSelectedRoleId(null)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a roles
              </Button>

              {loadingPermissions ? (
                <RolePermissionsSkeleton />
              ) : (
                <RolePermissionsEditor
                  role={selectedRole}
                  permissionGroups={ROLE_PERMISSION_GROUPS}
                  grantedPermissionCodes={grantedPermissionCodes}
                  onSave={async (permissions) => {
                    await updatePermissionsMutation.mutateAsync({
                      roleId: selectedRole.id,
                      permissions,
                    });
                  }}
                  isSaving={updatePermissionsMutation.isPending}
                  headerActions={
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openEdit(selectedRole)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar rol
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteTarget(selectedRole)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  }
                />
              )}
            </div>
          ) : (
            <div className="hidden lg:flex items-center justify-center h-64 text-muted-foreground text-sm border border-dashed rounded-xl">
              Selecciona un rol de la lista para gestionar sus permisos
            </div>
          )}
        </div>
      </div>

      {/* Dialog crear rol */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Rol</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Supervisor de Calidad"
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción (opcional)</Label>
                <Input
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Breve descripción del rol"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreate(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || !newName.trim()}
              >
                {createMutation.isPending ? "Creando…" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog editar rol */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar rol</DialogTitle>
          </DialogHeader>
          {editRole && (
            <form onSubmit={handleEditSubmit}>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Nombre del rol"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descripción (opcional)</Label>
                  <Input
                    value={editForm.description ?? ""}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Breve descripción del rol"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Guardando…" : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar rol"
        message="¿Está seguro de que desea eliminar este rol? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
