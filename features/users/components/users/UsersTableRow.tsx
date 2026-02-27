"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { MoreHorizontal, Pencil, Trash2, UserX, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserDto } from "@/features/users/services/users.service";

interface UsersTableRowProps {
  user: UserDto;
  roleNames: string[];
  positionContent: React.ReactNode; 
  areaContent: React.ReactNode;
  onEdit: (user: UserDto) => void;
  onToggleActive: (user: UserDto) => void;
  onDelete: (user: UserDto) => void;
  isToggling?: boolean;
}

function getInitials(user: UserDto): string {
  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim() || user.userName || "";
  const fromName = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return fromName || user.email?.[0]?.toUpperCase() || "U";
}

function getFullName(user: UserDto): string {
  const full = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim() || user.userName || "";
  return full || "Sin nombre";
}

export function UsersTableRow({
  user,
  roleNames,
  positionContent, // 🆕 Desestructurar
  areaContent, // 🆕 Desestructurar
  onEdit,
  onToggleActive,
  onDelete,
  isToggling = false,
}: UsersTableRowProps) {
  const initials = getInitials(user);
  const fullName = getFullName(user);

  return (
    <TableRow className={!user.isActive ? "opacity-50" : ""}>
      <TableCell>
        <div className="flex items-center gap-2.5">
          <Avatar className="h-9 w-9 shrink-0">
            {user.imageUrl ? (
              <AvatarImage src={user.imageUrl} alt={fullName} />
            ) : null}
            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{fullName}</span>
            <span className="text-xs text-muted-foreground">
              {user.email ?? "—"}
            </span>
          </div>
        </div>
      </TableCell>
        <TableCell>
          <div className="text-xs font-medium">
            {positionContent}
          </div>
        </TableCell>

        {/* 3. ÁREA (NUEVO) */}
        <TableCell>
          <div className="text-xs text-muted-foreground">
            {areaContent}
          </div>
        </TableCell>
      <TableCell>
        {roleNames.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {roleNames.map((name) => {
              const isAdmin = /admin|administrador/i.test(name);
              return (
                <Badge
                  key={name}
                  variant={isAdmin ? "default" : "outline"}
                  className={cn(
                    "text-xs",
                    isAdmin
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/80 text-secondary-foreground border-border"
                  )}
                >
                  {name}
                </Badge>
              );
            })}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "h-2 w-2 shrink-0 rounded-full",
              user.isActive ? "bg-primary" : "bg-muted-foreground/40"
            )}
          />
          <span className="text-xs text-muted-foreground">
            {user.isActive ? "Activo" : "Inactivo"}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">—</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit(user)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onToggleActive(user)}
              disabled={isToggling}
            >
              {user.isActive ? (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  Desactivar
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Activar
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(user)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
