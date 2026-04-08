"use client";

import { CheckCircle2, AlertTriangle, AlertCircle, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ComplianceStatus =
  | "cumple"
  | "parcial"
  | "no_cumple"
  | "excluido"
  | "pendiente";

const statusConfig: Record<
  ComplianceStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  cumple: {
    label: "Cumple",
    icon: CheckCircle2,
    className: "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400",
  },
  parcial: {
    label: "Parcial",
    icon: AlertTriangle,
    className: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
  },
  no_cumple: {
    label: "No Cumple",
    icon: AlertCircle,
    className: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400",
  },
  excluido: {
    label: "Excluido",
    icon: MinusCircle,
    className: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  },
  pendiente: {
    label: "Pendiente",
    icon: MinusCircle,
    className: "bg-slate-50 text-slate-400 dark:bg-slate-800/80 dark:text-slate-500",
  },
};

export function ComplianceStatusBadge({ status }: { status: string }) {
  const config =
    statusConfig[status as ComplianceStatus] ?? statusConfig.pendiente;
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        config.className
      )}
    >
      <Icon className="h-3.5 w-3.5" /> {config.label}
    </span>
  );
}

export const COMPLIANCE_STATUSES: { value: ComplianceStatus; label: string }[] = [
  { value: "cumple", label: "Cumple" },
  { value: "parcial", label: "Parcial" },
  { value: "no_cumple", label: "No Cumple" },
  { value: "excluido", label: "Excluido" },
  { value: "pendiente", label: "Pendiente" },
];
