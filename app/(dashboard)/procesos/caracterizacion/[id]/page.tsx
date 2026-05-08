"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ListChecks,
  Wrench,
  Network,
  CheckCircle2,
  FileText,
  TrendingUp,
  ShieldAlert,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProcessFormDialog } from "@/components/processes/ProcessFormDialog";
import {
  ProcessActivitiesTab,
  ProcessIndicatorsTab,
  ProcessOverviewTab,
} from "@/components/processes/ProcessWorkspaceTabs";
import { ProcessDocumentsTab } from "@/components/processes/ProcessDocumentsTab";
import { ProcessRisksTab } from "@/components/processes/ProcessRisksTab";
import { ProcessChangesTab } from "@/components/processes/ProcessChangesTab";
import { ProcessImprovementTab } from "@/components/processes/ProcessImprovementTab";
import {
  useProcess,
  useProcessTypes,
  useSaveProcess,
  useProcessActivities,
  useProcessIndicators,
  useProcessDocuments,
} from "@/feature/process/hooks/use-processes";
import { useRisks, useRiskControlsForProcess } from "@/feature/risk/hooks/use-risks";
import { useImprovementActions } from "@/feature/actions/hooks/use-process-improvement-actions";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "basics", label: "Datos básicos", icon: Network },
  { key: "activities", label: "Actividades", icon: ListChecks },
  { key: "indicators", label: "Indicadores", icon: Wrench },
  { key: "documents", label: "Documentación", icon: FileText },
  { key: "improvement", label: "Mejora continua", icon: TrendingUp },
  { key: "risks", label: "Riesgos", icon: ShieldAlert },
  { key: "changes", label: "Gestión del cambio", icon: RefreshCw },
  { key: "review", label: "Revisión", icon: CheckCircle2 },
] as const;

export default function CharacterizationWizardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: process, isLoading } = useProcess(id);
  const { data: types = [] } = useProcessTypes(true);
  const { data: activities = [] } = useProcessActivities(id);
  const { data: indicators = [] } = useProcessIndicators(id);
  const { data: processDocs = [] } = useProcessDocuments(id);
  const { data: risks = [] } = useRisks(id);
  const { data: processControls = [] } = useRiskControlsForProcess(id);
  const { data: improvementActions = [] } = useImprovementActions(id);
  const saveProcess = useSaveProcess();

  const type = types.find((t) => t.id === process?.processTypeId);
  const changeCount = useMemo(
    () => processControls.filter((c) => (c.controlCategory ?? "").toUpperCase() === "CAMBIO").length,
    [processControls],
  );

  const [step, setStep] = useState(0);
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!process) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-sm text-muted-foreground">Proceso no encontrado.</p>
        <Button variant="outline" onClick={() => router.push("/procesos")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Volver al mapa
        </Button>
      </div>
    );
  }

  const isStepDone = (idx: number) => {
    if (idx === 0) return !!process.processObjective && !!process.processScope;
    if (idx === 1) return activities.length > 0;
    if (idx === 2) return indicators.length > 0;
    if (idx === 3) return processDocs.length > 0 || step > 3;
    if (idx === 4) return improvementActions.length > 0 || step > 4;
    if (idx === 5 || idx === 6) return step > idx;
    return false;
  };

  return (
    <div className="space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/procesos/${process.id}`)}
          className="mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Volver al espacio del proceso
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          Caracterización — {process.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Ocho pasos: datos, actividades, indicadores, documentación del SGD y áreas que se conectarán al
          backend cuando estén listas; cierra con la revisión.
        </p>
      </div>

      {/* Stepper: scroll horizontal en pantallas estrechas (8 pasos) */}
      <div className="overflow-x-auto pb-1 -mx-1 px-1">
        <div className="flex flex-nowrap items-center justify-start sm:justify-center gap-x-0.5 min-w-max sm:min-w-0 sm:flex-wrap sm:gap-x-1 sm:gap-y-2 py-1">
          {STEPS.map((s, idx) => {
            const StepIcon = s.icon;
            const active = idx === step;
            const completed = isStepDone(idx);
            return (
              <div key={s.key} className="flex items-center gap-x-0.5 sm:gap-x-2 shrink-0">
                {idx > 0 ? (
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-muted-foreground/40 hidden sm:block"
                    aria-hidden
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => setStep(idx)}
                  title={s.key === "risks" ? "Riesgos y oportunidades" : s.label}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left text-xs transition-colors sm:gap-2 sm:px-2.5 sm:py-2 sm:text-sm",
                    active
                      ? "border-primary bg-primary/5 font-medium text-primary"
                      : completed
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                        : "border-border hover:bg-accent",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold sm:text-xs",
                      active
                        ? "bg-primary text-primary-foreground"
                        : completed
                          ? "bg-emerald-500 text-white"
                          : "bg-muted",
                    )}
                  >
                    {completed && !active ? <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : idx + 1}
                  </span>
                  <StepIcon className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
                  <span className="max-w-22 truncate sm:max-w-36 md:max-w-none whitespace-nowrap">
                    {s.label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-[400px]">
        {step === 0 && (
          <Card>
            <CardHeader>
              <div className="min-w-0 space-y-1.5">
                <CardTitle className="text-base">Datos básicos</CardTitle>
                <CardDescription>
                  Código, tipo, nombre, objetivo, alcance, responsable, riesgo, fechas.
                </CardDescription>
              </div>
              <CardAction>
                <Button variant="outline" onClick={() => setEditOpen(true)}>
                  Editar datos básicos
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <ProcessOverviewTab process={process} />
            </CardContent>
          </Card>
        )}

        {step === 1 && <ProcessActivitiesTab processId={process.id} />}
        {step === 2 && <ProcessIndicatorsTab processId={process.id} />}

        {step === 3 && <ProcessDocumentsTab processId={process.id} />}

        {step === 4 && <ProcessImprovementTab process={process} />}

        {step === 5 && (
          <ProcessRisksTab
            processId={process.id}
            processName={process.name}
            processTypeName={type?.name ?? ""}
            processTypeCode={type?.code}
          />
        )}

        {step === 6 && <ProcessChangesTab processId={process.id} processName={process.name} />}

        {step === 7 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revisión</CardTitle>
              <CardDescription>
                Vista consolidada de los ocho bloques antes de volver al espacio del proceso.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mx-auto grid max-w-4xl grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-4">
                <SummaryStat
                  label="Datos básicos"
                  value={process.processObjective && process.processScope ? "OK" : "—"}
                  variant={process.processObjective && process.processScope ? "success" : "warn"}
                />
                <SummaryStat
                  label="Actividades"
                  value={activities.length}
                  variant={activities.length > 0 ? "success" : "warn"}
                />
                <SummaryStat
                  label="Indicadores"
                  value={indicators.length}
                  variant={indicators.length > 0 ? "success" : "warn"}
                />
                <SummaryStat
                  label="Documentación"
                  value={processDocs.length}
                  variant={processDocs.length > 0 ? "success" : "muted"}
                />
                <SummaryStat
                  label="Mejora continua"
                  value={improvementActions.length}
                  variant={improvementActions.length > 0 ? "success" : "muted"}
                />
                <SummaryStat
                  label="Riesgos"
                  value={risks.length}
                  variant={risks.length > 0 ? "success" : "muted"}
                />
                <SummaryStat
                  label="Cambio"
                  value={changeCount}
                  variant={changeCount > 0 ? "success" : "muted"}
                />
                <SummaryStat label="Auditoría" value="—" variant="muted" />
              </div>
              <p className="text-xs text-muted-foreground max-w-2xl mx-auto text-center">
                Mejora continua, riesgos y gestión del cambio están enlazados a sus módulos; la auditoría interna
                seguirá cuando exista una API dedicada en esta app.
              </p>
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/procesos/${process.id}`)}
                >
                  Ir al espacio del proceso
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Anterior
        </Button>
        <span className="text-xs text-muted-foreground">
          Paso {step + 1} de {STEPS.length}
        </span>
        <Button
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          disabled={step === STEPS.length - 1}
        >
          Siguiente <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>

      <ProcessFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        process={process}
        processTypes={types.filter((t) => t.isActive)}
        onSave={async (payload) => {
          await saveProcess.mutateAsync(payload);
        }}
      />
    </div>
  );
}

function SummaryStat({
  label,
  value,
  variant,
}: {
  label: string;
  value: string | number;
  variant: "success" | "warn" | "muted";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-2.5 sm:p-3",
        variant === "success" &&
          "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30",
        variant === "warn" &&
          "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30",
        variant === "muted" && "border-border bg-muted/25 text-muted-foreground",
      )}
    >
      <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{label}</p>
      <p
        className={cn(
          "text-lg sm:text-2xl font-semibold sm:font-bold tabular-nums leading-tight mt-0.5",
          variant === "muted" && "text-sm sm:text-base font-medium",
        )}
      >
        {value}
      </p>
    </div>
  );
}
