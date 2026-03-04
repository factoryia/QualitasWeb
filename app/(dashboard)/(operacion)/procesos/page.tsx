'use client'
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  useProcessTypes,
  useProcesses,
  useInitProcessTypes,
  Process,
} from "@/features/operation/static/MOCKS";
import { ProcessCard } from "@/features/operation/components/ProcessCard";
import { ProcessFormDialog } from "@/features/operation/components/ProcessFormDialog";
import { ProcessDetailSheet } from "@/features/operation/components/ProcessDetailSheet";
import { ProcessValueChain } from "@/features/operation/components/ProcessValueChain";

export default function Processes() {
  const { data: types = [], isLoading: loadingTypes } = useProcessTypes();
  const { data: processes = [], isLoading: loadingProcesses } = useProcesses();
  const initTypes = useInitProcessTypes();

  const [formOpen, setFormOpen] = useState(false);
  const [defaultTypeId, setDefaultTypeId] = useState<string | undefined>();
  const [editProcess, setEditProcess] = useState<Process | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const grouped = useMemo(() => {
    const map = new Map<string, Process[]>();
    types.forEach((t) => map.set(t.id, []));
    processes.forEach((p) => {
      const arr = map.get(p.process_type_id);
      if (arr) arr.push(p);
    });
    return map;
  }, [types, processes]);

  const loading = loadingTypes || loadingProcesses;

  const typeColorMap: Record<string, string> = {
    EST: "border-l-primary",
    MIS: "border-l-risk-low",
    APO: "border-l-risk-medium",
    EVA: "border-l-[hsl(var(--ring))]",
  };

  const openProcess = (p: Process) => {
    setSelectedProcess(p);
    setSheetOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (types.length === 0) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center space-y-4 mt-20">
        <Settings className="h-12 w-12 mx-auto text-muted-foreground" />
        <h2 className="text-xl font-semibold">Inicializar Mapa de Procesos</h2>
        <p className="text-sm text-muted-foreground">
          Se crearán los 4 tipos de proceso estándar: Estratégico, Misional, Apoyo y Evaluación.
        </p>
        <Button onClick={() => initTypes.mutate()} disabled={initTypes.isPending}>
          {initTypes.isPending ? "Creando..." : "Inicializar tipos de proceso"}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mapa de Procesos</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los procesos de tu organización clasificados por tipo.
          </p>
        </div>
        <Button onClick={() => { setEditProcess(null); setDefaultTypeId(undefined); setFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Nuevo Proceso
        </Button>
      </div>

      <Tabs defaultValue="value-chain">
        <TabsList>
          <TabsTrigger value="value-chain">Mapa de Procesos</TabsTrigger>
          <TabsTrigger value="directory">Directorio y Fichas</TabsTrigger>
        </TabsList>

        {/* Cadena de Valor */}
        <TabsContent value="value-chain" className="mt-4">
          <ProcessValueChain 
            processTypes={types || []} // Cambia 'types' por 'processTypes'
            processes={processes || []} 
            onProcessClick={openProcess} // Asegúrate que el nombre coincida con la prop de la función
          />
        </TabsContent>

        {/* Directorio con Cards */}
        <TabsContent value="directory" className="mt-4">
          <div className="space-y-8">
            {types.map((type) => {
              const procs = grouped.get(type.id) ?? [];
              const color = typeColorMap[type.code] ?? "border-l-primary";
              return (
                <section key={type.id}>
                  <div className={`border-l-4 ${color} pl-4 mb-4 flex items-center justify-between`}>
                    <div>
                      <h3 className="font-semibold text-lg">{type.name}</h3>
                      <p className="text-xs text-muted-foreground">{procs.length} proceso{procs.length !== 1 ? "s" : ""}</p>
                    </div>
                    <Button
                      size="sm" variant="ghost"
                      onClick={() => { setEditProcess(null); setDefaultTypeId(type.id); setFormOpen(true); }}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Agregar
                    </Button>
                  </div>
                  {procs.length === 0 ? (
                    <p className="text-sm text-muted-foreground pl-5">Sin procesos registrados</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {procs.map((p) => (
                        <ProcessCard key={p.id} process={p} procedureCount={0} onClick={() => openProcess(p)} />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <ProcessFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        processTypes={types}
        defaultTypeId={defaultTypeId}
        process={editProcess}
      />

      <ProcessDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        process={selectedProcess}
        processTypes={types}
      />
    </div>
  );
}
