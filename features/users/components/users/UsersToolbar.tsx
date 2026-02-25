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
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email o rol..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select
        value={filterRoleId || "all"}
        onValueChange={(v) => onFilterRoleChange(v === "all" ? "" : v)}
      >
        <SelectTrigger className="w-44">
          <Filter className="h-3.5 w-3.5 mr-1.5" />
          <SelectValue placeholder="Filtrar rol" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los roles</SelectItem>
          {roles.map((r) => (
            <SelectItem key={r.id} value={r.id}>
              {r.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value="all" onValueChange={() => {}}>
        <SelectTrigger className="w-48">
          <Building2 className="h-3.5 w-3.5 mr-1.5" />
          <SelectValue placeholder="Filtrar área" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las áreas</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={onNewUser} className="ml-auto">
        <Plus className="h-4 w-4 mr-1.5" />
        Nuevo usuario
      </Button>
    </div>
  );
}
