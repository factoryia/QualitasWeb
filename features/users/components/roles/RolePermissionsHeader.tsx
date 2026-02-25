"use client";

import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import type { RoleDto } from "@/services/identity/services/roles.service";

interface RolePermissionsHeaderProps {
  role: RoleDto;
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  headerActions?: React.ReactNode;
}

export function RolePermissionsHeader({
  role,
  hasChanges,
  isSaving,
  onSave,
  headerActions,
}: RolePermissionsHeaderProps) {
  return (
    <div className="shrink-0 flex items-start justify-between gap-4 pb-4">
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-semibold text-foreground">{role.name}</h3>
        {role.description && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {role.description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          onClick={onSave}
          disabled={isSaving || !hasChanges}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Guardando…" : "Guardar Cambios"}
        </Button>
        {headerActions}
      </div>
    </div>
  );
}
