"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  GroupDto,
  OrganizationUnitDto,
  PagedResponse,
  RoleDto,
  UserWithOrg,
} from "../types";
import { useUserSearch } from "../hooks/useUserSearch";
import { rolesApi } from "../api/roles";
import { organizationUnitsApi } from "../api/organization-units";
import { usersApi } from "../api/users";
import { UserTable } from "./user-table";
import { positionsApi } from "../api/positions";
import { UserFormSheet } from "./user-form-sheet";
import { groupsApi } from "../api/groups";
import { RoleFormSheet } from "./role-form-sheet";
import { GroupFormSheet } from "./group-form-sheet";

type TabKey = "users" | "roles" | "groups";

export function UserManagement() {
  const [activeTab, setActiveTab] = useState<TabKey>("users");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [onlyActive, setOnlyActive] = useState(true);
  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>();
  const [selectedOrganizationUnitId, setSelectedOrganizationUnitId] =
    useState<string | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<UserWithOrg | null>(null);
  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
  const [roleFormMode, setRoleFormMode] = useState<"create" | "edit">("create");
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);
  const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);
  const [groupFormMode, setGroupFormMode] = useState<"create" | "edit">(
    "create",
  );
  const [selectedGroup, setSelectedGroup] = useState<GroupDto | null>(null);

  const userSearchQuery = useUserSearch({
    page,
    pageSize: 10,
    search: search.trim() || undefined,
    isActive: onlyActive ? true : undefined,
    roleId: selectedRoleId,
  });

  const data = userSearchQuery.data as PagedResponse<UserWithOrg> | undefined;
  const isLoading = userSearchQuery.isLoading;
  const error = userSearchQuery.error;

  const { data: roles } = useQuery<RoleDto[], Error>({
    queryKey: ["identity", "roles"],
    queryFn: () => rolesApi.list(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: organizationUnits } = useQuery<
    OrganizationUnitDto[],
    Error
  >({
    queryKey: ["foundation", "organization-units"],
    queryFn: () => organizationUnitsApi.list(false),
    staleTime: 5 * 60 * 1000,
  });

  const { data: positions } = useQuery({
    queryKey: ["foundation", "positions"],
    queryFn: () => positionsApi.list(false),
    staleTime: 5 * 60 * 1000,
  });

  const { data: groups } = useQuery<GroupDto[], Error>({
    queryKey: ["identity", "groups"],
    queryFn: () => groupsApi.list(),
    staleTime: 5 * 60 * 1000,
  });

  const filteredData = useMemo(() => {
    if (!data) return data;
    if (!selectedOrganizationUnitId) return data;

    const items = (data.items as UserWithOrg[]).filter(
      (u) => u.organizationUnitId === selectedOrganizationUnitId,
    );

    return {
      ...data,
      items,
    };
  }, [data, selectedOrganizationUnitId]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
  };

  const resetPagination = () => {
    setPage(1);
  };

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">
          Gestión de usuarios
        </h1>
        <p className="text-sm text-muted-foreground">
          Administra usuarios, roles y grupos del sistema.
        </p>
      </header>

      <div className="mt-2 flex gap-6">
        {/* Sidebar interno tipo tabs */}
        <aside className="w-56 shrink-0 space-y-3">
          <nav className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => handleTabChange("users")}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "users"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>Usuarios</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("roles")}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                activeTab === "roles"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>Roles</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("groups")}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                activeTab === "groups"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>Grupos</span>
            </button>
          </nav>

          <div className="rounded-lg border border-dashed border-border/70 bg-muted/40 p-3 text-xs">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Consejo
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Asigna roles específicos a cada usuario para controlar el acceso a
              los módulos del sistema.
            </p>
          </div>
        </aside>

        {/* Contenido principal */}
        <div className="flex-1 rounded-lg border border-border bg-card/80 shadow-sm">
          <div className="px-4 pb-4 pt-3">
            {activeTab === "users" && (
              <div className="space-y-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-1 flex-wrap items-center gap-2">
                    <input
                      type="search"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        resetPagination();
                      }}
                      placeholder="Buscar por nombre, email o rol..."
                      className="h-9 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none ring-0 transition-colors placeholder:text-muted-foreground focus:border-primary focus-visible:outline-none"
                    />
                    <select
                      className="h-9 min-w-[150px] rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none ring-0 transition-colors focus:border-primary focus-visible:outline-none"
                      value={selectedRoleId ?? ""}
                      onChange={(e) => {
                        const value = e.target.value || undefined;
                        setSelectedRoleId(value);
                        resetPagination();
                      }}
                    >
                      <option value="">Todos los roles</option>
                      {(roles ?? []).map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    <select
                      className="h-9 min-w-[180px] rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none ring-0 transition-colors focus:border-primary focus-visible:outline-none"
                      value={selectedOrganizationUnitId ?? ""}
                      onChange={(e) => {
                        const value = e.target.value || undefined;
                        setSelectedOrganizationUnitId(value);
                        resetPagination();
                      }}
                    >
                      <option value="">Todas las áreas</option>
                      {(organizationUnits ?? []).map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded border border-input text-primary focus-visible:outline-none"
                        checked={onlyActive}
                        onChange={(e) => {
                          setOnlyActive(e.target.checked);
                          resetPagination();
                        }}
                      />
                      Solo activos
                    </label>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
                      onClick={() => {
                        setFormMode("create");
                        setSelectedUser(null);
                        setIsFormOpen(true);
                      }}
                    >
                      + Nuevo usuario
                    </button>
                  </div>
                </div>

                <UserTable
                  data={filteredData}
                  isLoading={isLoading}
                  error={error ?? null}
                  page={page}
                  onPageChange={(newPage) => {
                    if (!data) {
                      setPage(newPage);
                      return;
                    }
                    if (newPage < 1 || newPage > data.totalPages) {
                      return;
                    }
                    setPage(newPage);
                  }}
                  onEditUser={(user) => {
                    setFormMode("edit");
                    setSelectedUser(user);
                    setIsFormOpen(true);
                  }}
                  onToggleActiveUser={(user) => {
                    // Toggle estado usando API
                    const activate = !user.isActive;
                    usersApi
                      .toggleStatus(user.id, activate)
                      .then(() => userSearchQuery.refetch());
                  }}
                />
              </div>
            )}

            {activeTab === "roles" && (
              <div className="flex gap-6">
                <aside className="w-60 shrink-0 space-y-3 rounded-lg border border-border/70 bg-muted/40 p-3">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Roles del sistema
                  </h3>
                  <button
                    type="button"
                    className="mb-1 inline-flex w-full items-center justify-center rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
                    onClick={() => {
                      setRoleFormMode("create");
                      setSelectedRole(null);
                      setIsRoleFormOpen(true);
                    }}
                  >
                    + Nuevo rol
                  </button>
                  <div className="flex flex-col gap-1">
                    {(roles ?? []).map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role)}
                        className={`flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                          selectedRole?.id === role.id
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <span>{role.name}</span>
                      </button>
                    ))}
                    {roles && roles.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        No hay roles configurados todavía.
                      </p>
                    )}
                  </div>
                </aside>

                <div className="flex-1 rounded-lg border border-border bg-card/80 p-4 text-sm">
                  {(() => {
                    if (!roles || roles.length === 0) {
                      return (
                        <p className="text-sm text-muted-foreground">
                          Actualmente no hay roles registrados en el sistema.
                        </p>
                      );
                    }

                    const activeRole = selectedRole ?? roles[0];
                    const perms = activeRole.permissions ?? [];

                    return (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h2 className="text-base font-semibold">
                              {activeRole.name}
                            </h2>
                            {activeRole.description && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {activeRole.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1 text-[11px] font-medium text-foreground shadow-sm hover:bg-muted"
                              onClick={() => {
                                setRoleFormMode("edit");
                                setSelectedRole(activeRole);
                                setIsRoleFormOpen(true);
                              }}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1 text-[11px] font-medium text-destructive hover:bg-destructive/15"
                              onClick={() => {
                                if (
                                  confirm(
                                    `¿Seguro que quieres eliminar el rol "${activeRole.name}"?`,
                                  )
                                ) {
                                  rolesApi
                                    .delete(activeRole.id)
                                    .then(() => userSearchQuery.refetch());
                                }
                              }}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>

                        <div>
                          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Permisos asignados
                          </h3>
                          {perms.length === 0 && (
                            <div className="rounded-md border border-dashed border-border/70 bg-muted/40 p-3 text-xs text-muted-foreground">
                              Este rol actualmente no tiene permisos asignados.
                              Puedes configurarlos editando el rol para
                              habilitar acceso a las diferentes
                              funcionalidades del sistema.
                            </div>
                          )}
                          {perms.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {perms.map((p) => (
                                <span
                                  key={p}
                                  className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground"
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {activeTab === "groups" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">
                      Grupos
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Agrupa usuarios por área o responsabilidad y asocia roles
                      comunes.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
                    onClick={() => {
                      setGroupFormMode("create");
                      setSelectedGroup(null);
                      setIsGroupFormOpen(true);
                    }}
                  >
                    + Nuevo grupo
                  </button>
                </div>

                {(!groups || groups.length === 0) && (
                  <div className="rounded-lg border border-dashed border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground">
                    Actualmente no hay grupos registrados en el sistema. Crea
                    un grupo para organizar usuarios y compartir roles.
                  </div>
                )}

                {groups && groups.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {groups.map((group) => {
                      const hasRoles =
                        group.roleNames &&
                        Array.isArray(group.roleNames) &&
                        group.roleNames.length > 0;
                      return (
                        <div
                          key={group.id}
                          className="flex h-full flex-col rounded-lg border border-border bg-card p-4 text-sm shadow-sm"
                        >
                          <div className="mb-2">
                            <h3 className="text-sm font-semibold text-foreground">
                              {group.name}
                            </h3>
                            {group.description && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {group.description}
                              </p>
                            )}
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {group.memberCount}{" "}
                              {group.memberCount === 1
                                ? "miembro"
                                : "miembros"}
                              {group.isDefault && " · Grupo por defecto"}
                              {group.isSystemGroup && " · Grupo de sistema"}
                            </p>
                          </div>

                          <div className="mt-1 flex-1 space-y-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Roles asociados
                            </p>
                            {!hasRoles && (
                              <p className="text-[11px] text-muted-foreground">
                                Este grupo actualmente no tiene roles asociados.
                                Puedes asignarlos para heredar permisos a todos
                                sus miembros.
                              </p>
                            )}
                            {hasRoles && (
                              <div className="flex flex-wrap gap-1">
                                {group.roleNames.map((r) => (
                                  <span
                                    key={r}
                                    className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                                  >
                                    {r}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              className="inline-flex flex-1 items-center justify-center rounded-md border border-input bg-background px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm hover:bg-muted"
                              onClick={() => {
                                setGroupFormMode("edit");
                                setSelectedGroup(group);
                                setIsGroupFormOpen(true);
                              }}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center justify-center rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-1 text-[11px] font-medium text-destructive hover:bg-destructive/15"
                              onClick={() => {
                                if (
                                  confirm(
                                    `¿Seguro que quieres eliminar el grupo "${group.name}"?`,
                                  )
                                ) {
                                  groupsApi
                                    .delete(group.id)
                                    .then(() => userSearchQuery.refetch());
                                }
                              }}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {roles && organizationUnits && positions && (
        <UserFormSheet
          open={isFormOpen}
          mode={formMode}
          onOpenChange={setIsFormOpen}
          user={selectedUser}
          roles={roles}
          positions={positions}
          organizationUnits={organizationUnits}
          onCompleted={() => {
            userSearchQuery.refetch();
          }}
        />
      )}

      {roles && (
        <RoleFormSheet
          open={isRoleFormOpen}
          mode={roleFormMode}
          onOpenChange={setIsRoleFormOpen}
          role={selectedRole}
          onCompleted={() => {
            userSearchQuery.refetch();
          }}
        />
      )}

      {groups && roles && (
        <GroupFormSheet
          open={isGroupFormOpen}
          mode={groupFormMode}
          onOpenChange={setIsGroupFormOpen}
          group={selectedGroup}
          roles={roles}
          onCompleted={() => {
            userSearchQuery.refetch();
          }}
        />
      )}
    </section>
  );
}

