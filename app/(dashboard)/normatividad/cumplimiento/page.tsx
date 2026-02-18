"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListChecks, CheckSquare2 } from "lucide-react";
import { ClausulasRequisitosTab } from "@/features/compliance/components/ClausulasRequisitosTab";
import { CriteriosCumplimientoTab } from "@/features/compliance/components/CriteriosCumplimientoTab";

export default function CumplimientoPage() {
  return (
    <div className="space-y-4 px-1 sm:px-0">
      <div className="min-w-0">
        <h1 className="text-lg sm:text-[22px] font-bold tracking-tight text-foreground wrap-break-word">Cumplimiento</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Gestión de cláusulas/requisitos y criterios de cumplimiento.
        </p>
      </div>
      <Tabs defaultValue="clausulas">
        <TabsList className="w-full sm:w-auto flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="clausulas" className="gap-1.5 flex-1 sm:flex-initial text-xs sm:text-sm">
            <ListChecks className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> <span className="truncate">Cláusulas/Requisitos</span>
          </TabsTrigger>
          <TabsTrigger value="criterios" className="gap-1.5 flex-1 sm:flex-initial text-xs sm:text-sm">
            <CheckSquare2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" /> <span className="truncate">Criterios</span>
          </TabsTrigger>
        </TabsList>
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
