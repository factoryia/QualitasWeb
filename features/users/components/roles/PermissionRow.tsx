"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil } from "lucide-react";
import type { PermissionItem } from "@/features/users/constants/role-permissions-ui";

interface PermissionRowProps {
  perm: PermissionItem;
  checked: boolean;
  canEdit: boolean;
  showRemove?: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onRemove?: () => void;
}

export function PermissionRow({
  perm,
  checked,
  canEdit,
  showRemove = false,
  onToggle,
  onEdit,
  onRemove,
}: PermissionRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-muted/50 transition-colors gap-2">
      <span className="text-sm text-foreground flex-1">{perm.name}</span>
      <div className="flex items-center gap-1">
        <Switch checked={checked} onCheckedChange={onToggle} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={(e) => e.preventDefault()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit} disabled={!canEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar permiso
            </DropdownMenuItem>
            {showRemove && onRemove && (
              <DropdownMenuItem className="text-destructive" onClick={onRemove}>
                Quitar del rol
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
