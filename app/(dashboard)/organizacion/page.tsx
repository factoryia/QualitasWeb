"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, MapPin, Network } from "lucide-react";
import { OrgEntityInfo } from "@/features/organization/components/OrgEntityInfo";
import { OrgSedes } from "@/features/organization/components/OrgSedes";
import { OrgStructure } from "@/features/organization/components/OrgStructure";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { organizationService } from "@/features/organization/services/organization.service";

export default function OrganizationPage() {
  const user = useAuthStore((s) => s.user);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const token = useAuthStore.getState().accessToken;
    if (!token) {
      setLoading(false);
      return;
    }
    const auth = { accessToken: token, tenant: user.tenant ?? "root" };
    organizationService
      .getAllOrganizations(auth)
      .then((list) => {
        if (list.length > 0) {
          const tenant = user?.tenant ?? "root";
          const match = list.find((o) => o.code === tenant) ?? list[0];
          setOrganizationId(match.id);
        } else {
          setOrganizationId(null);
        }
      })
      .catch(() => setOrganizationId(null))
      .finally(() => setLoading(false));
  }, [user?.tenant]);

  if (!user) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Cargando...</div>;
  }
  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Cargando organización...</div>;
  }
  if (!organizationId) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-foreground">Organización</h1>
          <p className="text-sm text-muted-foreground">
            Gestión de información institucional, sedes y estructura organizacional.
          </p>
        </div>
        <div className="flex items-center justify-center py-20 rounded-lg border border-dashed border-border text-muted-foreground">
          No hay organizaciones para el tenant actual. Contacte al administrador.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-foreground">Organización</h1>
        <p className="text-sm text-muted-foreground">
          Gestión de información institucional, sedes y estructura organizacional.
        </p>
      </div>
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info" className="gap-1.5">
            <Building2 className="h-4 w-4" /> Información
          </TabsTrigger>
          <TabsTrigger value="sedes" className="gap-1.5">
            <MapPin className="h-4 w-4" /> Sedes
          </TabsTrigger>
          <TabsTrigger value="structure" className="gap-1.5">
            <Network className="h-4 w-4" /> Estructura
          </TabsTrigger>
        </TabsList>
        <TabsContent value="info"><OrgEntityInfo orgId={organizationId} /></TabsContent>
        <TabsContent value="sedes"><OrgSedes orgId={organizationId} /></TabsContent>
        <TabsContent value="structure"><OrgStructure orgId={organizationId} /></TabsContent>
      </Tabs>
    </div>
  );
}
