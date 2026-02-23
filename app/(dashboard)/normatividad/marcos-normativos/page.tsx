"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, ClipboardCheck, Settings2 } from "lucide-react";
import { MarcosNormativosTab } from "@/features/compliance/components/MarcosNormativosTab";

export default function MarcosNormativosPage() {
  return (
    <div className="space-y-6 px-1 sm:px-0">
      {/* HEADER DE LA SECCIÓN */}
      <div className="min-w-0">
        <h1 className="text-lg sm:text-[22px] font-bold tracking-tight text-foreground wrap-break-word">
          Marco Normativo
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Gestión de marcos regulatorios, requisitos legales y cumplimiento organizacional.
        </p>
      </div>

      {/* SISTEMA DE TABS (ESTILO PILLS) */}
      <Tabs defaultValue="marcos" className="w-full space-y-4">
        <TabsList className="bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-1">
          <TabsTrigger value="marcos" className="gap-2 px-4">
            <FileText size={16} />
            <span className="hidden sm:inline">Marcos Normativos</span>
            <span className="sm:hidden">Marcos</span>
          </TabsTrigger>
          
          <TabsTrigger value="requisitos" className="gap-2 px-4">
            <ClipboardCheck size={16} />
            <span className="hidden sm:inline">Requisitos vs Exclusiones</span>
            <span className="sm:hidden">Requisitos</span>
          </TabsTrigger>

          <TabsTrigger value="modelo" className="gap-2 px-4">
            <Settings2 size={16} />
            <span className="hidden sm:inline">Modelo Normativo</span>
            <span className="sm:hidden">Modelo</span>
          </TabsTrigger>
        </TabsList>

        {/* CONTENIDO DE LOS TABS */}
        <TabsContent value="marcos" className="border-none p-0 outline-none">
          <MarcosNormativosTab />
        </TabsContent>

        <TabsContent value="requisitos" className="border-none p-0 outline-none">
          <div className="flex flex-col items-center justify-center h-[400px] border border-dashed rounded-xl bg-muted/20">
            <ClipboardCheck className="h-10 w-10 text-muted-foreground/40 mb-2" />
            <p className="text-muted-foreground text-sm">Módulo de Requisitos vs Exclusiones en desarrollo...</p>
          </div>
        </TabsContent>

        <TabsContent value="modelo" className="border-none p-0 outline-none">
          <div className="flex flex-col items-center justify-center h-[400px] border border-dashed rounded-xl bg-muted/20">
            <Settings2 className="h-10 w-10 text-muted-foreground/40 mb-2" />
            <p className="text-muted-foreground text-sm">Módulo de Modelo Normativo en desarrollo...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}