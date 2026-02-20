"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileSearch, 
  AlertTriangle, 
  Activity, 
  Plus, 
  Filter 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SystemLogs } from "@/features/auditoria/components/LogsSistema";
import { AuditGeneral } from "@/features/auditoria/components/AuditGeneral";

export default function AuditoriasPage() {
  return (
    <div className="space-y-4">
      {/* HEADER DE LA SECCIÓN */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Auditorías
          </h1>
          <p className="text-sm text-muted-foreground">
            Programas, ejecución, equipo auditor y hallazgos.
          </p>
        </div>
      </div>
      {/* SISTEMA DE TABS (ESTILO PILLS) */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <TabsTrigger value="general" className="gap-2">
            <FileSearch size={16} />
            <span className="hidden sm:inline">Auditoría General</span>
            <span className="sm:hidden">Gestión</span>
          </TabsTrigger>          
          <TabsTrigger value="logs" className="gap-2">
            <Activity size={16} />
            Logs 
          </TabsTrigger>
        </TabsList>

        {/* CONTENIDOS */}
        <TabsContent value="general" className="mt-6">
          {/* <AuditPrograms /> */}
          <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <AuditGeneral/>
          </div>
        </TabsContent>
        <TabsContent value="logs" className="mt-6">
          {/* Este sería el componente que refleja la imagen image_8035d9.png */}
          <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
             {/* Aquí llamarías a un componente como <SystemLogs /> */}
             <SystemLogs></SystemLogs>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}