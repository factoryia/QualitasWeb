"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, UserCheck } from "lucide-react";
import type { Area, Sede } from "../types";
import type { OrgMember } from "../hooks/use-organization-structure-query";
import { organizationService } from "../services/organization.service";

export interface OrgStructureDrawerProps {
  area: Area | null;
  orgId: string;
  sedes: Sede[];
  members: OrgMember[];
  onClose: () => void;
}

export function OrgStructureDrawer({ area, orgId, sedes, members, onClose }: OrgStructureDrawerProps) {
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    if (!area) return;
    organizationService.getUserCount(area.id).then((count) => setUserCount(count ?? 0));
  }, [area?.id]);

  const sede = area?.sede_id ? sedes.find((s) => s.id === area.sede_id) : null;
  const manager = area?.manager_id ? members.find((m) => m.user_id === area.manager_id) : null;

  return (
    <Sheet open={!!area} onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{area?.name}</SheetTitle>
          <SheetDescription>Detalle del área organizacional</SheetDescription>
        </SheetHeader>
        {area && (
          <div className="space-y-4 mt-6">
            {area.code && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Código</p>
                <Badge variant="secondary" className="font-mono">{area.code}</Badge>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Nivel Jerárquico</p>
              <p className="text-sm font-medium">{area.hierarchy_level}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Estado</p>
              {area.is_active === false ? (
                <Badge variant="outline">Inactiva</Badge>
              ) : (
                <Badge variant="secondary">Activa</Badge>
              )}
            </div>
            {sede && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{sede.name}{sede.is_principal ? " (Principal)" : ""}</span>
              </div>
            )}
            {manager && (
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{manager.full_name || "Sin nombre"}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{userCount} usuario(s) vinculado(s)</span>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
