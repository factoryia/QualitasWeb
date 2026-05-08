"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, Settings } from "lucide-react";
import { PROCESS_TYPE_PRESETS, type PresetKey } from "@/feature/process/process-type-presets";
import { useApplyProcessTypePreset } from "@/feature/process/hooks/use-processes";

interface Props {
  /** Si lo pasas, se llama después de aplicar OK */
  onApplied?: () => void;
}

export function ProcessTypePresetPicker({ onApplied }: Props) {
  const [target, setTarget] = useState<PresetKey | null>(null);
  const apply = useApplyProcessTypePreset();

  const handleConfirm = () => {
    if (!target) return;
    apply.mutate(
      { preset: target },
      {
        onSuccess: () => {
          setTarget(null);
          onApplied?.();
        },
      }
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" /> Aplicar preset
          </CardTitle>
          <CardDescription>
            Inicializa o reemplaza los tipos de proceso desde un estándar conocido. Los tipos
            que tienen procesos asignados se mantienen.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {(Object.keys(PROCESS_TYPE_PRESETS) as PresetKey[]).map((key) => {
            const preset = PROCESS_TYPE_PRESETS[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTarget(key)}
                className="text-left rounded-lg border p-3 hover:border-primary hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  <p className="text-sm font-semibold">{preset.label}</p>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {preset.description}
                </p>
                {preset.types.length > 0 && (
                  <p className="text-[11px] mt-2 text-muted-foreground">
                    {preset.types.length} tipos
                  </p>
                )}
              </button>
            );
          })}
        </CardContent>
      </Card>

      <AlertDialog open={!!target} onOpenChange={(o) => !o && !apply.isPending && setTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Aplicar preset {target ? PROCESS_TYPE_PRESETS[target].label : ""}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se crearán o actualizarán los tipos del preset. Los tipos existentes que NO estén
              en el preset se desactivarán solo si no tienen procesos vinculados. Esta acción
              respeta tu trabajo previo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={apply.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} disabled={apply.isPending}>
              {apply.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Aplicando…
                </>
              ) : (
                "Aplicar preset"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
