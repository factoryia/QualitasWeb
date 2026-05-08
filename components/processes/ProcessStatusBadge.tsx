"use client";

import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; className: string }> = {
  Defined: { label: "Definido", className: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200" },
  Designed: { label: "Diseñado", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  Implemented: { label: "Implementado", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  Monitored: { label: "Monitoreado", className: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" },
  Optimized: { label: "Optimizado", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  Suspended: { label: "Suspendido", className: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" },
};

interface Props {
  status?: string | null;
  fallbackLabel?: string;
  className?: string;
}

export function ProcessStatusBadge({ status, fallbackLabel, className }: Props) {
  const config = (status && statusConfig[status]) || {
    label: fallbackLabel ?? status ?? "—",
    className: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
