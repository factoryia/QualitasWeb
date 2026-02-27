"use client";

import { PermissionRow } from "./PermissionRow";
import type { PermissionGroup, PermissionItem } from "@/features/users/constants/role-permissions-ui";

interface PermissionGroupSectionProps {
  group: PermissionGroup;
  selected: Set<string>;
  isCustomPermission: (code: string) => boolean;
  onToggle: (code: string) => void;
  onEdit: (perm: PermissionItem) => void;
}

export function PermissionGroupSection({
  group,
  selected,
  isCustomPermission,
  onToggle,
  onEdit,
}: PermissionGroupSectionProps) {
  return (
    <div className="space-y-3 full">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
          {group.moduleCode}
        </span>
        <span className="text-sm font-medium text-foreground">
          {group.moduleName}
        </span>
      </div>
      <div className="space-y-3">
        {group.permissions.map((perm) => (
          <PermissionRow
            key={perm.code}
            perm={perm}
            checked={selected.has(perm.code)}
            canEdit={isCustomPermission(perm.code)}
            onToggle={() => onToggle(perm.code)}
            onEdit={() => onEdit(perm)}
          />
        ))}
      </div>
    </div>
  );
}
