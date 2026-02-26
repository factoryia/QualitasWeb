"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Plus, Building2 } from "lucide-react";
import type { RoleDto } from "@/services/identity/services/roles.service";

interface UsersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterRoleId: string;
  onFilterRoleChange: (roleId: string) => void;
  roles: RoleDto[];
  onNewUser: () => void;
}

export function UsersToolbar({
  search,
  onSearchChange,
  filterRoleId,
  onFilterRoleChange,
  roles,
  onNewUser,
}: UsersToolbarProps) {
  return (
    // "gap-2" is better for tight mobile screens
    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
      
      {/* Search Input - Full width on tiny mobile, grows on desktop */}
      <div className="relative w-full sm:flex-1 sm:min-w-[200px] sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Roles Select */}
      <Select
        value={filterRoleId || "all"}
        onValueChange={(v) => onFilterRoleChange(v === "all" ? "" : v)}
      >
        <SelectTrigger className="flex-1 sm:w-44 min-w-[100px]">
          <Filter className="h-3.5 w-3.5 mr-1" />
          <div className="truncate text-left">
            {/* Logic: If nothing is selected, show responsive labels */}
            {!filterRoleId || filterRoleId === "all" ? (
              <>
                <span className="inline sm:hidden">Roles</span>
                <span className="hidden sm:inline">Todos los roles</span>
              </>
            ) : (
              <SelectValue />
            )}
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los roles</SelectItem>
          {roles.map((r) => (
            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Areas Select */}
      <Select value="all" onValueChange={() => {}}>
        <SelectTrigger className="flex-1 sm:w-48 min-w-[100px]">
          <Building2 className="h-3.5 w-3.5 mr-1" />
          <div className="truncate text-left">
            <span className="inline sm:hidden">Áreas</span>
            <span className="hidden sm:inline">Todas las áreas</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las áreas</SelectItem>
        </SelectContent>
      </Select>

      {/* New User Button - Icon only on mobile to save space */}
      <Button onClick={onNewUser} className="shrink-0">
        <Plus className="h-4 w-4 sm:mr-1.5" />
          <span className="inline sm:hidden">Nuevo</span>
          <span className="hidden sm:inline">Nuevo usuario</span>
      </Button>
    </div>
  );
}