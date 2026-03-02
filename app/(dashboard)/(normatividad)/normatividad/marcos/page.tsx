"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileX, Scale, ArrowLeft } from "lucide-react"; // Importamos ArrowLeft
import { Button } from "@/components/ui/button"; // Asegúrate de tener el import de Button
import { cn } from "@/lib/utils"; // Importamos cn para las clases condicionales

import { useMarcosNormativosQuery } from "@/features/compliance/hooks/use-marcos-normativos-query";
import { FrameworkDetail } from "@/features/compliance/components/normative/FrameworkDetail";
import { FrameworksList } from "@/features/compliance/components/normative/FrameworksList";
import { ExclusionsPanel } from "@/features/compliance/components/normative/ExclusionsPanel";
import { MipgPanel } from "@/features/compliance/components/normative/MipgPanel";

export default function MarcosNormativosPage() {
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string | null>(null);
  const { data: marcos = [] } = useMarcosNormativosQuery(true);
  const selectedMarco = marcos.find((m) => m.id === selectedFrameworkId) ?? null;

  // Helper para el botón de volver en móvil
  const renderBackButton = () => (
    <Button 
      variant="ghost" 
      size="sm" 
      className="lg:hidden mb-4 -ml-2 text-muted-foreground"
      onClick={() => setSelectedFrameworkId(null)}
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Volver a la lista
    </Button>
  );

  return (
    <div className="space-y-6 px-1 sm:px-0">
      {/* Título: Se oculta en móvil cuando hay algo seleccionado para ganar espacio */}
      <div className={cn("min-w-0", selectedFrameworkId && "hidden lg:block")}>
        <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground">
          Marco de Juego (Normatividad)
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Gestione cláusulas, criterios de cumplimiento y justificaciones de exclusión.
        </p>
      </div>

      <Tabs defaultValue="marcos" className="w-full space-y-4">
        {/* TabsList: Se oculta en móvil si hay un marco seleccionado para simular navegación de página completa */}
        <TabsList className={cn(
          "bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-1",
          selectedFrameworkId && "hidden lg:inline-flex"
        )}>
          <TabsTrigger value="marcos" className="gap-2 px-4">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Marcos Normativos</span>
            <span className="sm:hidden">Marcos</span>
          </TabsTrigger>
          {/* ... otros triggers se mantienen igual ... */}
          <TabsTrigger value="requisitos" className="gap-2 px-4">
            <FileX className="h-4 w-4" />
            <span className="hidden sm:inline">Requisitos</span>
            <span className="sm:hidden">Requisitos</span>
          </TabsTrigger>
          <TabsTrigger value="exclusiones" className="gap-2 px-4">
            <FileX className="h-4 w-4" />
            <span className="hidden sm:inline">Requisitos vs Exclusiones</span>
            <span className="sm:hidden">Exclusiones</span>
          </TabsTrigger>
          <TabsTrigger value="mipg" className="gap-2 px-4">
            <Scale className="h-4 w-4" />
            <span className="hidden sm:inline">Modelo MIPG</span>
            <span className="sm:hidden">MIPG</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marcos" className="border-none p-0 outline-none mt-0">
          <div className="flex flex-col lg:grid lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
            
            {/* LADO IZQUIERDO: LISTA */}
            <div className={cn(
              "w-full",
              selectedFrameworkId ? "hidden lg:block" : "block"
            )}>
              <FrameworksList
                selectedId={selectedFrameworkId}
                onSelect={setSelectedFrameworkId}
              />
            </div>

            {/* LADO DERECHO: DETALLE */}
            <div className={cn(
              "flex-1 min-w-0",
              !selectedFrameworkId ? "hidden lg:block" : "block"
            )}>
              {selectedFrameworkId && renderBackButton()}
              <FrameworkDetail
                frameworkId={selectedFrameworkId}
                marco={selectedMarco}
                onDeleted={() => setSelectedFrameworkId(null)}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="requisitos" className="border-none p-0 outline-none mt-0">
          <div className="flex flex-col lg:grid lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
            <div className={cn("w-full", selectedFrameworkId ? "hidden lg:block" : "block")}>
              <FrameworksList
                selectedId={selectedFrameworkId}
                onSelect={setSelectedFrameworkId}
              />
            </div>
            <div className={cn("flex-1 min-w-0", !selectedFrameworkId ? "hidden lg:block" : "block")}>
              {selectedFrameworkId && renderBackButton()}
              <FrameworkDetail
                frameworkId={selectedFrameworkId}
                marco={selectedMarco}
                onDeleted={() => setSelectedFrameworkId(null)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="exclusiones" className="border-none p-0 outline-none mt-0">
          <ExclusionsPanel />
        </TabsContent>

        <TabsContent value="mipg" className="border-none p-0 outline-none mt-0">
          <MipgPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}