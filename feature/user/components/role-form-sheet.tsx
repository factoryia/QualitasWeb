"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import type { RoleDto } from "../types";
import { rolesApi } from "../api/roles";

type Mode = "create" | "edit";

interface RoleFormSheetProps {
  open: boolean;
  mode: Mode;
  onOpenChange: (open: boolean) => void;
  role?: RoleDto | null;
  onCompleted: () => void;
}

/** "Permissions.QualitasCompliance.MarcosNormativos.View" → "QualitasCompliance / MarcosNormativos" */
function permissionGroup(perm: string): string {
  const parts = perm.split(".");
  if (parts[0] === "Permissions") parts.shift();
  parts.pop(); // remove action (View, Create, …)
  return parts.join(" / ") || "General";
}

function permissionAction(perm: string): string {
  const parts = perm.split(".");
  return parts[parts.length - 1];
}

export function RoleFormSheet({
  open,
  mode,
  onOpenChange,
  role,
  onCompleted,
}: RoleFormSheetProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchFilter, setSearchFilter] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set(),
  );

  const isEdit = mode === "edit";

  const { data: allPermissions = [] } = useQuery<string[], Error>({
    queryKey: ["identity", "tenant-permissions"],
    queryFn: () => rolesApi.listTenantPermissions(),
    staleTime: 10 * 60 * 1000,
    enabled: open,
  });

  const {
    data: roleFromApi,
    isLoading: loadingRolePerms,
    isError: rolePermsError,
  } = useQuery({
    queryKey: ["identity", "role-permissions", role?.id],
    queryFn: () => rolesApi.getRolePermissions(role!.id),
    enabled: open && isEdit && !!role?.id,
    staleTime: 30 * 1000,
  });

  /** Catálogo para agrupar: permisos del tenant + los ya asignados al rol (por si faltan en el listado). */
  const catalogForGrouping = useMemo(() => {
    const s = new Set<string>(allPermissions);
    selected.forEach((p) => s.add(p));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [allPermissions, selected]);

  const grouped = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const perm of catalogForGrouping) {
      const group = permissionGroup(perm);
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(perm);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [catalogForGrouping]);

  const filteredGrouped = useMemo(() => {
    if (!searchFilter.trim()) return grouped;
    const q = searchFilter.toLowerCase();
    return grouped
      .map(([group, perms]) => {
        const filtered = perms.filter((p) => p.toLowerCase().includes(q));
        return [group, filtered] as [string, string[]];
      })
      .filter(([, perms]) => perms.length > 0);
  }, [grouped, searchFilter]);

  useEffect(() => {
    if (!open) return;
    setSearchFilter("");
    setCollapsedGroups(new Set());
    if (!isEdit) {
      setName("");
      setDescription("");
      setSelected(new Set());
    }
  }, [open, isEdit]);

  useEffect(() => {
    if (!open || !isEdit || !role) return;
    if (roleFromApi) {
      setName(roleFromApi.name ?? "");
      setDescription(roleFromApi.description ?? "");
      setSelected(new Set(roleFromApi.permissions ?? []));
      return;
    }
    if (loadingRolePerms) {
      setName(role.name ?? "");
      setDescription(role.description ?? "");
      setSelected(new Set(role.permissions ?? []));
      return;
    }
    if (rolePermsError) {
      setName(role.name ?? "");
      setDescription(role.description ?? "");
      setSelected(new Set(role.permissions ?? []));
    }
  }, [
    open,
    isEdit,
    role,
    roleFromApi,
    loadingRolePerms,
    rolePermsError,
  ]);

  const togglePerm = (perm: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(perm)) next.delete(perm);
      else next.add(perm);
      return next;
    });
  };

  const toggleGroup = (perms: string[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = perms.every((p) => next.has(p));
      if (allSelected) {
        perms.forEach((p) => next.delete(p));
      } else {
        perms.forEach((p) => next.add(p));
      }
      return next;
    });
  };

  const toggleCollapse = (group: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const upserted = await rolesApi.upsert({
        id: isEdit && role ? role.id : undefined,
        name,
        description,
      });
      await rolesApi.updatePermissions(upserted.id, Array.from(selected));
    },
    onSuccess: async () => {
      if (isEdit && role?.id) {
        await queryClient.invalidateQueries({
          queryKey: ["identity", "role-permissions", role.id],
        });
      }
      onCompleted();
      onOpenChange(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const title = isEdit ? "Editar rol" : "Nuevo rol";
  const descriptionText = isEdit
    ? "Actualiza el nombre, descripción y permisos de este rol."
    : "Crea un nuevo rol del sistema y define sus permisos.";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg">
        <form
          onSubmit={handleSubmit}
          className="flex h-full flex-col gap-4 overflow-hidden"
        >
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{descriptionText}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Nombre del rol
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none ring-0 focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-0 focus:border-primary"
              />
            </div>

            {/* Permissions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Permisos
                </label>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  {selected.size} / {catalogForGrouping.length} seleccionados
                  {isEdit && loadingRolePerms && (
                    <span className="ml-1 text-primary">· sincronizando…</span>
                  )}
                </span>
              </div>
              {isEdit && rolePermsError && (
                <p className="text-[11px] text-amber-600 dark:text-amber-500">
                  No se pudieron cargar los permisos del servidor; se muestran
                  los datos del listado. Guardar puede sobrescribir permisos.
                </p>
              )}

              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="search"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filtrar permisos..."
                  className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs outline-none ring-0 focus:border-primary"
                />
              </div>

              <div className="max-h-[40vh] space-y-1 overflow-y-auto rounded-md border border-border p-2">
                {filteredGrouped.length === 0 && (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    {catalogForGrouping.length === 0
                      ? "Cargando permisos..."
                      : "Sin resultados"}
                  </p>
                )}

                {filteredGrouped.map(([group, perms]) => {
                  const allChecked = perms.every((p) => selected.has(p));
                  const someChecked =
                    !allChecked && perms.some((p) => selected.has(p));
                  const isCollapsed = collapsedGroups.has(group);

                  return (
                    <div key={group}>
                      <button
                        type="button"
                        onClick={() => toggleCollapse(group)}
                        className="flex w-full items-center gap-1.5 rounded px-1 py-1 text-left text-xs font-semibold text-foreground hover:bg-muted/60"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        )}
                        <input
                          type="checkbox"
                          checked={allChecked}
                          ref={(el) => {
                            if (el) el.indeterminate = someChecked;
                          }}
                          onChange={() => toggleGroup(perms)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-3.5 w-3.5 shrink-0 rounded border-border accent-primary"
                        />
                        <span className="truncate">{group}</span>
                        <span className="ml-auto shrink-0 text-[10px] font-normal tabular-nums text-muted-foreground">
                          {perms.filter((p) => selected.has(p)).length}/
                          {perms.length}
                        </span>
                      </button>

                      {!isCollapsed && (
                        <div className="ml-7 flex flex-col gap-0.5 pb-1">
                          {perms.map((perm) => (
                            <label
                              key={perm}
                              className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-0.5 text-xs hover:bg-muted/40"
                            >
                              <input
                                type="checkbox"
                                checked={selected.has(perm)}
                                onChange={() => togglePerm(perm)}
                                className="h-3.5 w-3.5 rounded border-border accent-primary"
                              />
                              <span className="text-muted-foreground">
                                {permissionAction(perm)}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
                disabled={
                  mutation.status === "pending" ||
                  (isEdit && loadingRolePerms && !rolePermsError)
                }
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {mutation.status === "pending"
                  ? "Guardando..."
                  : isEdit
                    ? "Guardar cambios"
                    : "Crear rol"}
              </button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
