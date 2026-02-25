"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UsersTableRow } from "./UsersTableRow";
import { UsersTableSkeleton, USERS_TABLE_COL_SPAN } from "./UsersTableSkeleton";
import type {
  UserDto,
  UserRoleDto,
} from "@/features/users/services/users.service";

interface UsersTableProps {
  items: UserDto[];
  userRolesMap: Record<string, UserRoleDto[]>;
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (user: UserDto) => void;
  onToggleActive: (user: UserDto) => void;
  onDelete: (user: UserDto) => void;
  isToggling?: boolean;
}

export function UsersTable({
  items,
  userRolesMap,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onToggleActive,
  onDelete,
  isToggling = false,
}: UsersTableProps) {
  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-medium text-muted-foreground py-2.5 whitespace-nowrap">
                Usuario / email
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground py-2.5 w-24">
                Cargo
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground py-2.5 w-32">
                Área
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground py-2.5">
                Rol sistema
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground py-2.5 w-24">
                Estado
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground py-2.5 w-28">
                Último acceso
              </TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground py-2.5 w-12 text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <UsersTableSkeleton />
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={USERS_TABLE_COL_SPAN}
                  className="text-center py-8 text-muted-foreground"
                >
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              items.map((user) => {
                const userRoles = user.id ? userRolesMap[user.id] ?? [] : [];
                const roleNames = userRoles
                  .filter((r) => r.enabled && r.roleName)
                  .map((r) => r.roleName!);
                return (
                  <UsersTableRow
                    key={user.id ?? user.email ?? ""}
                    user={user}
                    roleNames={roleNames}
                    onEdit={onEdit}
                    onToggleActive={onToggleActive}
                    onDelete={onDelete}
                    isToggling={isToggling}
                  />
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Mostrando {items.length} resultado{items.length !== 1 ? "s" : ""}
        </span>
        {totalPages > 1 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(Math.max(1, page - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
