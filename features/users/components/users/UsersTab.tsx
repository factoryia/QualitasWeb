"use client";

import { useState } from "react";
import {
  usersService,
  type UserDto,
  type RegisterUserCommand,
  type UpdateUserRequest,
} from "@/features/users/services/users.service";
import {
  useUsersSearch,
  useUserRolesMap,
  useUserUpdateMutation,
  useUserToggleStatusMutation,
  useUserDeleteMutation,
  useUserRegisterMutation,
  useUserAssignRolesMutation,
} from "@/features/users/hooks/use-users-query";
import { useRoles } from "@/features/users/hooks/use-roles-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { UsersToolbar } from "./UsersToolbar";
import { UsersTable } from "./UsersTable";
import { UserCreateModal } from "./UserCreateModal";
import { UserEditModal } from "./UserEditModal";

const PAGE_SIZE = 10;
const emptyCreateForm: RegisterUserCommand = {
  firstName: "",
  lastName: "",
  email: "",
  userName: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
};

export function UsersTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterRoleId, setFilterRoleId] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserDto | null>(null);
  const [editForm, setEditForm] = useState<UpdateUserRequest | null>(null);
  const [editRoleIds, setEditRoleIds] = useState<string[]>([]);
  const [editIsActive, setEditIsActive] = useState<boolean | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string } | null>(null);
  const [createForm, setCreateForm] = useState<RegisterUserCommand>(emptyCreateForm);
  const [createRoleIds, setCreateRoleIds] = useState<string[]>([]);
  const [createError, setCreateError] = useState("");
  const [editError, setEditError] = useState("");

  const accessToken = useAuthStore((s) => s.accessToken);
  const tenant = useAuthStore((s) => s.user?.tenant ?? "root");
  const auth = accessToken ? { accessToken, tenant } : undefined;

  const { data: searchData, isLoading } = useUsersSearch({
    PageNumber: page,
    PageSize: PAGE_SIZE,
    Search: search.trim() || undefined,
    RoleId: filterRoleId || undefined,
  });
  const { data: roles = [] } = useRoles();
  const userIds =
    searchData?.items?.map((u) => u.id).filter((id): id is string => !!id) ?? [];
  const userRolesMap = useUserRolesMap(userIds);

  const updateMutation = useUserUpdateMutation();
  const toggleMutation = useUserToggleStatusMutation();
  const deleteMutation = useUserDeleteMutation();
  const registerMutation = useUserRegisterMutation();
  const assignRolesMutation = useUserAssignRolesMutation();

  const items = searchData?.items ?? [];
  const totalPages = searchData?.totalPages ?? 0;

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
    try {
      await updateMutation.mutateAsync({ userId: editUser.id, data: editForm });
      await assignRolesMutation.mutateAsync({
        userId: editUser.id,
        payload: {
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
      });
      if (editIsActive !== null && editIsActive !== editUser.isActive) {
        await toggleMutation.mutateAsync({
          userId: editUser.id,
          activate: editIsActive,
        });
      }
      setEditOpen(false);
      setEditUser(null);
    } catch (err: unknown) {
      setEditError(
        err && typeof err === "object" && "message" in err
          ? String((err as Error).message)
          : "Error al guardar"
      );
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
    try {
      const { userId } = await registerMutation.mutateAsync(createForm);
      if (createRoleIds.length > 0 && auth) {
        await assignRolesMutation.mutateAsync({
          userId,
          payload: {
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
        });
      }
      setCreateOpen(false);
      setCreateForm(emptyCreateForm);
      setCreateRoleIds([]);
      setPage(1);
    } catch (err: unknown) {
      const res =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { errors?: string[]; detail?: string } } })
              .response?.data
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

  const toggleActive = (user: UserDto) => {
    const id = user.id ?? "";
    if (!id) return;
    toggleMutation.mutate({ userId: id, activate: !user.isActive });
  };

  return (
    <div className="space-y-4">
      <UsersToolbar
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        filterRoleId={filterRoleId}
        onFilterRoleChange={(v) => {
          setFilterRoleId(v);
          setPage(1);
        }}
        roles={roles}
        onNewUser={() => setCreateOpen(true)}
      />
      <UsersTable
        items={items}
        userRolesMap={userRolesMap}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onEdit={openEdit}
        onToggleActive={toggleActive}
        onDelete={(user) => setDeleteTarget({ id: user.id ?? "" })}
        isToggling={toggleMutation.isPending}
      />
      <UserCreateModal
        open={createOpen}
        form={createForm}
        roleIds={createRoleIds}
        roles={roles}
        error={createError}
        loading={registerMutation.isPending}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        onFormChange={setCreateForm}
        onRoleIdsChange={setCreateRoleIds}
      />
      <UserEditModal
        open={editOpen}
        user={editUser}
        form={editForm}
        roleIds={editRoleIds}
        isActive={editIsActive}
        roles={roles}
        error={editError}
        loading={updateMutation.isPending}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditSubmit}
        onFormChange={setEditForm}
        onRoleIdsChange={setEditRoleIds}
        onIsActiveChange={setEditIsActive}
      />
      <ConfirmModal
        open={!!deleteTarget}
        title="Eliminar usuario"
        message="¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
