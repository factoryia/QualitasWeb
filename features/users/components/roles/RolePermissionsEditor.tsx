"use client";

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RoleDto } from "@/services/identity/services/roles.service";
import type {
  PermissionGroup,
  PermissionItem,
} from "@/features/users/constants/role-permissions-ui";
import { RolePermissionsHeader } from "./RolePermissionsHeader";
import { PermissionGroupSection } from "./PermissionGroupSection";
import { CustomPermissionsSection } from "./CustomPermissionsSection";
import { EditPermissionDialog } from "./EditPermissionDialog";
import { AddPermissionDialog } from "./AddPermissionDialog";

interface RolePermissionsEditorProps {
  role: RoleDto;
  permissionGroups: PermissionGroup[];
  grantedPermissionCodes: string[];
  onSave: (permissions: string[]) => Promise<void>;
  isSaving?: boolean;
  headerActions?: React.ReactNode;
}

export function RolePermissionsEditor({
  role,
  permissionGroups,
  grantedPermissionCodes,
  onSave,
  isSaving = false,
  headerActions,
}: RolePermissionsEditorProps) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(grantedPermissionCodes)
  );
  const [customPermissions, setCustomPermissions] = useState<PermissionItem[]>(
    () => {
      const known = new Set(
        permissionGroups.flatMap((g) => g.permissions.map((p) => p.code))
      );
      return grantedPermissionCodes
        .filter((code) => !known.has(code))
        .map((code) => ({ code, name: code }));
    }
  );
  const [editPermOpen, setEditPermOpen] = useState(false);
  const [editPermTarget, setEditPermTarget] = useState<PermissionItem | null>(null);
  const [editPermOriginalCode, setEditPermOriginalCode] = useState<string | null>(null);
  const [addPermOpen, setAddPermOpen] = useState(false);
  const [newPermCode, setNewPermCode] = useState("");
  const [newPermName, setNewPermName] = useState("");

  useEffect(() => {
    setSelected(new Set(grantedPermissionCodes));
    const known = new Set(
      permissionGroups.flatMap((g) => g.permissions.map((p) => p.code))
    );
    setCustomPermissions((prev) => {
      const fromApi = grantedPermissionCodes
        .filter((code) => !known.has(code))
        .map((code) => ({ code, name: code }));
      if (fromApi.length === 0) return prev;
      const merged = new Map(prev.map((p) => [p.code, p]));
      fromApi.forEach((p) => merged.set(p.code, merged.get(p.code) ?? p));
      return Array.from(merged.values());
    });
  }, [grantedPermissionCodes.join(","), role.id, permissionGroups]);

  const toggle = (code: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const hasChanges =
    selected.size !== grantedPermissionCodes.length ||
    [...selected].some((code) => !grantedPermissionCodes.includes(code));

  const handleSave = () => {
    onSave(Array.from(selected));
  };

  const isCustomPermission = (code: string) =>
    customPermissions.some((p) => p.code === code);

  const openEditPerm = (perm: PermissionItem) => {
    setEditPermTarget({ ...perm });
    setEditPermOriginalCode(perm.code);
    setEditPermOpen(true);
  };

  const handleEditPermSubmit = () => {
    if (!editPermTarget) return;
    const oldCode = editPermOriginalCode;
    const newCode = editPermTarget.code.trim();
    const newName = editPermTarget.name.trim() || newCode;
    setCustomPermissions((prev) => {
      const without = prev.filter((p) => p.code !== oldCode);
      return [...without, { code: newCode, name: newName }];
    });
    setSelected((prev) => {
      const next = new Set(prev);
      if (oldCode) next.delete(oldCode);
      next.add(newCode);
      return next;
    });
    setEditPermOpen(false);
    setEditPermTarget(null);
    setEditPermOriginalCode(null);
  };

  const handleAddPerm = () => {
    const code = newPermCode.trim();
    const name = newPermName.trim() || code;
    if (!code) return;
    setCustomPermissions((prev) => {
      if (prev.some((p) => p.code === code)) return prev;
      return [...prev, { code, name }];
    });
    setSelected((prev) => new Set(prev).add(code));
    setNewPermCode("");
    setNewPermName("");
    setAddPermOpen(false);
  };

  const removeCustomPermission = (code: string) => {
    setCustomPermissions((prev) => prev.filter((p) => p.code !== code));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(code);
      return next;
    });
  };

  return (
    <div className="flex flex-col min-h-0 h-full">
      <RolePermissionsHeader
        role={role}
        hasChanges={hasChanges}
        isSaving={isSaving}
        onSave={handleSave}
        headerActions={headerActions}
      />
      <ScrollArea className="flex-1 min-h-0 max-h-[calc(100vh-180px)] rounded-md ">
        <div className="space-y-6 p-1 pr-4">
          {permissionGroups.map((group) => (
            <PermissionGroupSection
              key={group.moduleCode}
              group={group}
              selected={selected}
              isCustomPermission={isCustomPermission}
              onToggle={toggle}
              onEdit={openEditPerm}
            />
          ))}
          <CustomPermissionsSection
            permissions={customPermissions}
            selected={selected}
            onToggle={toggle}
            onEdit={openEditPerm}
            onRemove={removeCustomPermission}
            onAdd={() => setAddPermOpen(true)}
          />
        </div>
      </ScrollArea>
      <EditPermissionDialog
        open={editPermOpen}
        permission={editPermTarget}
        onOpenChange={setEditPermOpen}
        onSave={handleEditPermSubmit}
        onPermissionChange={setEditPermTarget}
      />
      <AddPermissionDialog
        open={addPermOpen}
        code={newPermCode}
        name={newPermName}
        onOpenChange={setAddPermOpen}
        onCodeChange={setNewPermCode}
        onNameChange={setNewPermName}
        onAdd={handleAddPerm}
      />
    </div>
  );
}
