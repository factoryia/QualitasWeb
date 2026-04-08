"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";

function permissionGroup(perm: string): string {
  const parts = perm.split(".");
  if (parts[0] === "Permissions") parts.shift();
  parts.pop();
  return parts.join(" / ") || "General";
}

function permissionAction(perm: string): string {
  const parts = perm.split(".");
  return parts[parts.length - 1];
}

interface RolePermissionsDisplayProps {
  permissions: string[];
}

/**
 * Lista de permisos agrupada y colapsable para no saturar la vista del rol.
 */
export function RolePermissionsDisplay({
  permissions,
}: RolePermissionsDisplayProps) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("");

  const grouped = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const p of permissions) {
      const g = permissionGroup(p);
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(p);
    }
    for (const [, arr] of map) {
      arr.sort((a, b) => a.localeCompare(b));
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [permissions]);

  const filteredGroups = useMemo(() => {
    if (!filter.trim()) return grouped;
    const q = filter.toLowerCase();
    return grouped
      .map(
        ([g, items]) =>
          [g, items.filter((p) => p.toLowerCase().includes(q))] as const,
      )
      .filter(([, items]) => items.length > 0);
  }, [grouped, filter]);

  const toggleGroup = (g: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  };

  const expandAll = () => {
    setOpenGroups(new Set(filteredGroups.map(([g]) => g)));
  };

  const collapseAll = () => setOpenGroups(new Set());

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground">{permissions.length}</span>{" "}
          permisos en{" "}
          <span className="font-medium text-foreground">{grouped.length}</span>{" "}
          categorías
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={expandAll}
            className="text-[11px] font-medium text-primary hover:underline"
          >
            Expandir todo
          </button>
          <span className="text-muted-foreground">·</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-[11px] font-medium text-primary hover:underline"
          >
            Contraer todo
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Buscar permiso…"
          className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs outline-none ring-0 focus:border-primary"
        />
      </div>

      <div className="max-h-[min(420px,55vh)] space-y-1 overflow-y-auto rounded-lg border border-border/80 bg-muted/15 p-2">
        {filteredGroups.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">
            Ningún permiso coincide con la búsqueda.
          </p>
        )}

        {filteredGroups.map(([group, items]) => {
          const isOpen = openGroups.has(group);
          return (
            <div
              key={group}
              className="overflow-hidden rounded-md border border-border/60 bg-card/90"
            >
              <button
                type="button"
                onClick={() => toggleGroup(group)}
                className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-xs font-semibold text-foreground hover:bg-muted/50"
              >
                {isOpen ? (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                )}
                <span className="min-w-0 flex-1 truncate">{group}</span>
                <span className="shrink-0 tabular-nums text-[10px] font-normal text-muted-foreground">
                  {items.length}
                </span>
              </button>

              {isOpen && (
                <div className="flex flex-wrap gap-1 border-t border-border/50 bg-muted/20 px-2 py-2">
                  {items.map((p) => (
                    <span
                      key={p}
                      title={p}
                      className="inline-flex max-w-[140px] cursor-default truncate rounded-md border border-border/70 bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm"
                    >
                      {permissionAction(p)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
