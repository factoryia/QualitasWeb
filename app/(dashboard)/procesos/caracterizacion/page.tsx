"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessFormDialog } from "@/components/processes/ProcessFormDialog";
import {
  useProcessTypes,
  useSaveProcess,
} from "@/feature/process/hooks/use-processes";

export default function NewCharacterizationPage() {
  const router = useRouter();
  const { data: types = [] } = useProcessTypes(false);
  const saveProcess = useSaveProcess();
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" onClick={() => router.push("/procesos")} className="mb-2">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Volver al mapa
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Caracterización de Proceso</h1>
        <p className="text-sm text-muted-foreground">
          Registra los datos básicos del proceso. Después podrás detallar actividades,
          indicadores y documentos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Iniciar caracterización</CardTitle>
          <CardDescription>
            Crea el proceso con sus datos generales para abrir su espacio de caracterización.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setOpen(true)} className="gap-1">
            Comenzar <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </CardContent>
      </Card>

      <ProcessFormDialog
        open={open}
        process={null}
        processTypes={types.filter((t) => t.isActive)}
        onClose={() => {
          setOpen(false);
          router.push("/procesos");
        }}
        onSave={async (payload) => {
          const created = await saveProcess.mutateAsync(payload);
          router.push(`/procesos/caracterizacion/${created.id}`);
        }}
      />
    </div>
  );
}
