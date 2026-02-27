"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PermissionRow } from "./PermissionRow";
import type { PermissionItem } from "@/features/users/constants/role-permissions-ui";

interface CustomPermissionsSectionProps {
  permissions: PermissionItem[];
  selected: Set<string>;
  onToggle: (code: string) => void;
  onEdit: (perm: PermissionItem) => void;
  onRemove: (code: string) => void;
  onAdd: () => void;
}

export function CustomPermissionsSection({
  permissions,
  selected,
  onToggle,
  onEdit,
  onRemove,
  onAdd,
}: CustomPermissionsSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
            Custom
          </span>
          <span className="text-sm font-medium text-foreground">
            Permisos personalizados
          </span>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1.5" />
          Añadir permiso
        </Button>
      </div>
      {permissions.length > 0 && (
        <div className="space-y-3 full">
          {permissions.map((perm) => (
            <PermissionRow
              key={perm.code}
              perm={perm}
              checked={selected.has(perm.code)}
              canEdit
              showRemove
              onToggle={() => onToggle(perm.code)}
              onEdit={() => onEdit(perm)}
              onRemove={() => onRemove(perm.code)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
