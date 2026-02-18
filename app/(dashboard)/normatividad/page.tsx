"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ListChecks, CheckSquare2 } from "lucide-react";
import { MarcosNormativosTab } from "@/features/compliance/components/MarcosNormativosTab";
import { ClausulasRequisitosTab } from "@/features/compliance/components/ClausulasRequisitosTab";
import { CriteriosCumplimientoTab } from "@/features/compliance/components/CriteriosCumplimientoTab";

export default function NormatividadPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-foreground">Normatividad</h1>
        <p className="text-sm text-muted-foreground">
          Gestión de marcos regulatorios, cláusulas/requisitos y criterios de cumplimiento.
        </p>
      </div>
      <Tabs defaultValue="marcos">
        <TabsList>
          <TabsTrigger value="marcos" className="gap-1.5">
            <FileText className="h-4 w-4" /> Marcos Normativos
          </TabsTrigger>
          <TabsTrigger value="clausulas" className="gap-1.5">
            <ListChecks className="h-4 w-4" /> Cláusulas/Requisitos
          </TabsTrigger>
          <TabsTrigger value="criterios" className="gap-1.5">
            <CheckSquare2 className="h-4 w-4" /> Criterios de Cumplimiento
          </TabsTrigger>
        </TabsList>
        <TabsContent value="marcos">
          <MarcosNormativosTab />
        </TabsContent>
        <TabsContent value="clausulas">
          <ClausulasRequisitosTab />
        </TabsContent>
        <TabsContent value="criterios">
          <CriteriosCumplimientoTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
