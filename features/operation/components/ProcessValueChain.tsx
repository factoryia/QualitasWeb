import { Process, ProcessType } from "@/features/operation/static/MOCKS";
import { ProcessCard } from "@/features/operation/components/ProcessCard";
import { ArrowRight } from "lucide-react";

interface Props {
  processes: Process[];
  processTypes: ProcessType[];
  onProcessClick: (process: Process) => void;
}

export function ProcessValueChain({ processes = [], processTypes = [], onProcessClick }: Props) {
  // 1. Añadimos el "?" antes del .find y aseguramos que processTypes sea array
  const getProcessesByType = (typeCode: string) => {
    if (!processTypes) return []; // Protección extra
    const type = processTypes.find((t) => t?.code === typeCode);
    return processes.filter((p) => p.process_type_id === type?.id);
  };

  const estrategicos = getProcessesByType("EST");
  const misionales = getProcessesByType("MIS");
  const apoyo = getProcessesByType("APO");
  const evaluacion = getProcessesByType("EVA");

  return (
    <div className="space-y-12 p-6 bg-muted/10 rounded-xl border border-border/50">
      
      {/* SECCIÓN 1: PROCESOS ESTRATÉGICOS (Gestión y Dirección) */}
      <section className="space-y-4">
        <h3 className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Procesos Estratégicos
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          {estrategicos.map((p) => (
            <div key={p.id} className="w-64">
              <ProcessCard 
                process={p} 
                procedureCount={0} 
                onClick={() => onProcessClick(p)} 
              />
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 2: PROCESOS MISIONALES (La cadena de valor principal) */}
      <section className="relative space-y-4">
        <div className="absolute inset-0 flex items-center justify-center -z-10">
            <div className="w-full h-32 bg-primary/5 rounded-full blur-3xl" />
        </div>
        <h3 className="text-center text-xs font-bold uppercase tracking-widest text-primary">
          Procesos Misionales (Cadena de Valor)
        </h3>
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4">
          {misionales.map((p, index) => (
            <div key={p.id} className="flex items-center gap-2">
              <div className="w-64 shrink-0">
                <ProcessCard 
                  process={p} 
                  procedureCount={0} 
                  onClick={() => onProcessClick(p)} 
                />
              </div>
              {index < misionales.length - 1 && (
                <ArrowRight className="h-6 w-6 text-primary/40 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 3: PROCESOS DE APOYO Y EVALUACIÓN */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Procesos de Apoyo
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {apoyo.map((p) => (
              <div key={p.id} className="w-56">
                <ProcessCard 
                  process={p} 
                  procedureCount={0} 
                  onClick={() => onProcessClick(p)} 
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Evaluación y Control
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {evaluacion.map((p) => (
              <div key={p.id} className="w-56">
                <ProcessCard 
                  process={p} 
                  procedureCount={0} 
                  onClick={() => onProcessClick(p)} 
                />
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}