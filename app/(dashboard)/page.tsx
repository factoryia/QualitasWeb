"use client";

import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  TrendingUp,
  Network,
  Flame,
  ChevronRight,
  ListTodo,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/** 4 KPIs como en el mockup: icono + trend/pill arriba, label, valor grande, sub */
const KPIS = [
  {
    title: "Cumplimiento Global",
    value: "84%",
    sub: "Indicador consolidado de cumplimiento normativo.",
    icon: CheckCircle2,
    trend: "+5% vs mes anterior",
    trendStyle: "success",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
  },
  {
    title: "Riesgos Críticos",
    value: "12",
    sub: "Requieren atención inmediata del equipo.",
    icon: AlertTriangle,
    pill: "3 críticos",
    pillStyle: "danger",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10 dark:bg-rose-500/20",
  },
  {
    title: "Auditorías Abiertas",
    value: "08",
    sub: "Seguimiento activo y planificadas.",
    icon: ClipboardList,
    pill: "2 esta semana",
    pillStyle: "info",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
  },
  {
    title: "Índice FURAG",
    value: "91.2",
    sub: "Mejora sostenida en desempeño institucional.",
    icon: TrendingUp,
    trend: "+3.1 tendencia",
    trendStyle: "success",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
  },
];

const PILL_STYLES: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  danger: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
};

/** Intensidad 1-5 por celda (impacto x probabilidad). Colores del mockup. */
function heatLevel(row: number, col: number): number {
  return Math.max(1, Math.min(5, 6 - row + col - 1));
}

const HEAT_COLORS: Record<number, string> = {
  1: "bg-emerald-500 dark:bg-emerald-600",
  2: "bg-lime-500 dark:bg-lime-600",
  3: "bg-amber-500 dark:bg-amber-600",
  4: "bg-orange-500 dark:bg-orange-600",
  5: "bg-rose-500 dark:bg-rose-600",
};

const AUDITORIAS = [
  { title: "Auditoría ISO 9001", meta: "Actualizado hace 2 horas", pill: "En revisión", pillStyle: "warning" as const },
  { title: "Control interno financiero", meta: "3 hallazgos pendientes", pill: "Crítico", pillStyle: "danger" as const },
  { title: "Evaluación normativa MIPG", meta: "Cierre estimado este viernes", pill: "En tiempo", pillStyle: "success" as const },
];

const ACCIONES = [
  { title: "Se asignó acción correctiva a Gestión Documental", meta: "Hace 18 minutos", pill: "Nueva", pillStyle: "info" as const },
  { title: "Se actualizó el indicador de cumplimiento global", meta: "Hace 1 hora", pill: "Actualizado", pillStyle: "success" as const },
  { title: "Nuevo riesgo registrado en procesos críticos", meta: "Impacto alto / probabilidad media", pill: "Riesgo", pillStyle: "danger" as const },
];

export default function DashboardPage() {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">
          Resumen Ejecutivo
        </h1>
        <p className="text-sm text-muted-foreground">
          Visión general del cumplimiento normativo, riesgos e indicadores.
        </p>
      </header>

      {/* KPI cards - 4 columnas como en el mockup */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.title}
              className="overflow-hidden transition-shadow hover:shadow-md"
            >
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${kpi.bg} ${kpi.color}`}
                  >
                    <Icon className="size-5" />
                  </div>
                  {kpi.trend && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                      {kpi.trend}
                    </span>
                  )}
                  {kpi.pill && (
                    <span
                      className={`rounded-full px-2.5 py-1.5 text-xs font-semibold ${PILL_STYLES[kpi.pillStyle]}`}
                    >
                      {kpi.pill}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </p>
                  <p className="text-3xl font-extrabold tracking-tight">
                    {kpi.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {kpi.sub}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Estructura de Procesos + Mapa de Calor */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Network className="size-4 text-muted-foreground" />
                Estructura de Procesos
              </CardTitle>
              <CardDescription>
                Mapa y directorio de procesos de la organización.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/procesos" className="gap-1 font-semibold text-primary">
                Ver procesos
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-gradient-to-b from-background to-muted/30 p-6 text-center">
              <div className="text-4xl text-muted-foreground/60">◫</div>
              <h4 className="mt-3 text-base font-semibold text-foreground">
                Directorio central de procesos
              </h4>
              <p className="mt-1 max-w-[420px] text-sm text-muted-foreground">
                Organiza procesos, responsables y planes de acción en una vista clara, accesible y lista para auditoría.
              </p>
              <Button className="mt-4 shadow-md" asChild>
                <Link href="/procesos">Ir a procesos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flame className="size-4 text-muted-foreground" />
                Mapa de Calor
              </CardTitle>
              <CardDescription>
                Riesgo por impacto y probabilidad.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="#" className="gap-1 font-semibold text-primary">
                Analizar
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Impacto ↑</span>
              <span>Probabilidad →</span>
            </div>
            <div className="mt-2 grid grid-cols-5 gap-1.5" style={{ aspectRatio: "1" }}>
              {[5, 4, 3, 2, 1].map((row) =>
                [1, 2, 3, 4, 5].map((col) => {
                  const level = heatLevel(row, col);
                  return (
                    <div
                      key={`${row}-${col}`}
                      className={`flex items-center justify-center rounded-xl border-2 border-white font-bold text-foreground/90 shadow-sm transition-transform hover:scale-105 dark:border-border ${HEAT_COLORS[level]}`}
                      title={`Impacto ${row}, Probabilidad ${col}`}
                    >
                      {level}
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>Nivel de riesgo</span>
              <div className="flex items-center gap-2">
                <span>Bajo</span>
                <div
                  className="h-2.5 w-36 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #16a34a 0%, #84cc16 32%, #f59e0b 60%, #f97316 78%, #dc2626 100%)",
                  }}
                />
                <span>Crítico</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auditorías Prioritarias + Acciones Recientes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="size-4 text-muted-foreground" />
                Auditorías Prioritarias
              </CardTitle>
              <CardDescription>
                Seguimiento inmediato de auditorías activas.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="#" className="gap-1 font-semibold text-primary">
                Ver todo
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {AUDITORIAS.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border p-3.5"
                >
                  <div>
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.meta}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1.5 text-xs font-bold ${PILL_STYLES[item.pillStyle]}`}
                  >
                    {item.pill}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ListTodo className="size-4 text-muted-foreground" />
                Acciones Recientes
              </CardTitle>
              <CardDescription>
                Últimas tareas, alertas y movimientos del sistema.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="#" className="gap-1 font-semibold text-primary">
                Ver actividad
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {ACCIONES.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border p-3.5"
                >
                  <div>
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.meta}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1.5 text-xs font-bold ${PILL_STYLES[item.pillStyle]}`}
                  >
                    {item.pill}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
