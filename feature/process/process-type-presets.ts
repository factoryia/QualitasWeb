/**
 * Presets de Macroprocesos (process_types) — port del demo.
 * ISO 9001:2015 (4.4) NO prescribe cantidad ni nombres — solo enfoque basado en procesos.
 *  - "ISO 9001 clásico": 3 categorías (Estratégico, Misional, Apoyo).
 *  - "MIPG" (sector público CO): agrega Evaluación como 4to pilar.
 *  - "Personalizado": el usuario define sus propios macroprocesos.
 */

export type ProcessTypeColor =
  | "purple"
  | "blue"
  | "amber"
  | "emerald"
  | "rose"
  | "slate"
  | "indigo"
  | "teal"
  | "orange"
  | "pink";

export type ProcessTypeLayoutHint =
  | "full_width"
  | "half_width"
  | "third_width"
  | null;

export interface PresetProcessType {
  name: string;
  code: string;
  color: ProcessTypeColor;
  icon: string;
  layoutHint: Exclude<ProcessTypeLayoutHint, null>;
  order: number;
  description?: string;
}

export interface ProcessTypePreset {
  label: string;
  description: string;
  types: PresetProcessType[];
}

export type PresetKey = "iso_9001" | "mipg" | "custom";

export const PROCESS_TYPE_PRESETS: Record<PresetKey, ProcessTypePreset> = {
  iso_9001: {
    label: "ISO 9001 Clásico",
    description:
      "3 macroprocesos según ISO 9001:2015 — Estratégico, Misional, Apoyo.",
    types: [
      { name: "Estratégico", code: "EST", color: "purple", icon: "Target", layoutHint: "full_width", order: 0 },
      { name: "Misional", code: "MIS", color: "blue", icon: "Briefcase", layoutHint: "full_width", order: 1 },
      { name: "Apoyo", code: "APO", color: "amber", icon: "Wrench", layoutHint: "full_width", order: 2 },
    ],
  },
  mipg: {
    label: "MIPG (Sector Público)",
    description:
      "4 macroprocesos según el Modelo Integrado de Planeación y Gestión.",
    types: [
      { name: "Estratégico", code: "EST", color: "purple", icon: "Target", layoutHint: "full_width", order: 0 },
      { name: "Misional", code: "MIS", color: "blue", icon: "Briefcase", layoutHint: "full_width", order: 1 },
      { name: "Apoyo", code: "APO", color: "amber", icon: "Wrench", layoutHint: "full_width", order: 2 },
      { name: "Evaluación", code: "EVA", color: "emerald", icon: "BarChart3", layoutHint: "full_width", order: 3 },
    ],
  },
  custom: {
    label: "Personalizado",
    description: "Define tus propios macroprocesos desde cero.",
    types: [],
  },
};

export const PROCESS_TYPE_COLORS: ProcessTypeColor[] = [
  "purple", "blue", "amber", "emerald", "rose",
  "slate", "indigo", "teal", "orange", "pink",
];

export const PROCESS_TYPE_ICON_OPTIONS = [
  "Target", "Briefcase", "Wrench", "BarChart3", "Users", "Settings",
  "ClipboardCheck", "Headphones", "Shield", "Layers", "Lightbulb",
  "Network", "Workflow", "Building2", "Globe", "BookOpen", "Cog",
  "Compass", "FileCheck", "Gauge", "GraduationCap", "Handshake",
  "LineChart", "PieChart", "Rocket", "Sparkles", "Zap", "TrendingUp",
  "LifeBuoy",
] as const;

const VALID_COLOR_SET = new Set<string>(PROCESS_TYPE_COLORS);
const VALID_ICON_SET = new Set<string>(PROCESS_TYPE_ICON_OPTIONS);

/** Mínimo para resolver estilos sin importar el DTO completo */
export type ProcessTypeDtoLike = {
  name: string;
  code: string;
  color: string | null;
  icon: string | null;
};

function normalizeProcessTypeLabel(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

/** Color e ícono efectivos: respeta API si es válido; si no, infiere por código (EST, MIS…) o nombre. */
export function resolveProcessTypeVisuals(type: ProcessTypeDtoLike): {
  color: ProcessTypeColor;
  icon: string;
} {
  const code = (type.code ?? "").toUpperCase().trim();
  const name = normalizeProcessTypeLabel(type.name ?? "");

  let color: ProcessTypeColor | null =
    type.color && VALID_COLOR_SET.has(type.color) ? (type.color as ProcessTypeColor) : null;
  let icon: string | null =
    type.icon && VALID_ICON_SET.has(type.icon) ? type.icon : null;

  const byCode: Record<string, { color: ProcessTypeColor; icon: string }> = {
    EST: { color: "purple", icon: "Compass" },
    MIS: { color: "blue", icon: "Rocket" },
    APO: { color: "amber", icon: "Wrench" },
    SOP: { color: "teal", icon: "LifeBuoy" },
    EVA: { color: "emerald", icon: "BarChart3" },
  };

  const canonical = byCode[code];
  if (canonical) {
    if (!color) color = canonical.color;
    if (!icon) icon = canonical.icon;
  }

  if (!color) {
    if (name.includes("estrat") || name.includes("direccionam")) color = "purple";
    else if (name.includes("mision")) color = "blue";
    else if (name.includes("evalu")) color = "emerald";
    else if (name.includes("soport") || name.includes("soporte")) color = "teal";
    else if (name.includes("apoyo")) color = "amber";
  }

  if (!icon) {
    if (name.includes("estrat") || name.includes("direccionam")) icon = "Compass";
    else if (name.includes("mision")) icon = "Rocket";
    else if (name.includes("evalu")) icon = "BarChart3";
    else if (name.includes("soport") || name.includes("soporte")) icon = "LifeBuoy";
    else if (name.includes("apoyo")) icon = "Wrench";
  }

  return {
    color: color ?? "slate",
    icon: icon ?? "Layers",
  };
}

/** Estilos Tailwind PRE-ESCRITOS por color (necesarios para tree-shaking). */
export interface ProcessTypeStyles {
  bg: string;
  border: string;
  text: string;
  iconBg: string;
  progress: string;
  bar: string;
}

export function getTypeStyles(color: string | null | undefined): ProcessTypeStyles {
  switch (color) {
    case "purple":
      return {
        bg: "bg-purple-50 dark:bg-purple-950/30",
        border: "border-purple-300 dark:border-purple-700",
        text: "text-purple-700 dark:text-purple-300",
        iconBg: "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400",
        progress: "[&>div]:bg-purple-500",
        bar: "bg-purple-500",
      };
    case "blue":
      return {
        bg: "bg-blue-50 dark:bg-blue-950/30",
        border: "border-blue-300 dark:border-blue-700",
        text: "text-blue-700 dark:text-blue-300",
        iconBg: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
        progress: "[&>div]:bg-blue-500",
        bar: "bg-blue-500",
      };
    case "amber":
      return {
        bg: "bg-amber-50 dark:bg-amber-950/30",
        border: "border-amber-300 dark:border-amber-700",
        text: "text-amber-700 dark:text-amber-300",
        iconBg: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400",
        progress: "[&>div]:bg-amber-500",
        bar: "bg-amber-500",
      };
    case "emerald":
      return {
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        border: "border-emerald-300 dark:border-emerald-700",
        text: "text-emerald-700 dark:text-emerald-300",
        iconBg: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400",
        progress: "[&>div]:bg-emerald-500",
        bar: "bg-emerald-500",
      };
    case "rose":
      return {
        bg: "bg-rose-50 dark:bg-rose-950/30",
        border: "border-rose-300 dark:border-rose-700",
        text: "text-rose-700 dark:text-rose-300",
        iconBg: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400",
        progress: "[&>div]:bg-rose-500",
        bar: "bg-rose-500",
      };
    case "indigo":
      return {
        bg: "bg-indigo-50 dark:bg-indigo-950/30",
        border: "border-indigo-300 dark:border-indigo-700",
        text: "text-indigo-700 dark:text-indigo-300",
        iconBg: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400",
        progress: "[&>div]:bg-indigo-500",
        bar: "bg-indigo-500",
      };
    case "teal":
      return {
        bg: "bg-teal-50 dark:bg-teal-950/30",
        border: "border-teal-300 dark:border-teal-700",
        text: "text-teal-700 dark:text-teal-300",
        iconBg: "bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400",
        progress: "[&>div]:bg-teal-500",
        bar: "bg-teal-500",
      };
    case "orange":
      return {
        bg: "bg-orange-50 dark:bg-orange-950/30",
        border: "border-orange-300 dark:border-orange-700",
        text: "text-orange-700 dark:text-orange-300",
        iconBg: "bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400",
        progress: "[&>div]:bg-orange-500",
        bar: "bg-orange-500",
      };
    case "pink":
      return {
        bg: "bg-pink-50 dark:bg-pink-950/30",
        border: "border-pink-300 dark:border-pink-700",
        text: "text-pink-700 dark:text-pink-300",
        iconBg: "bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400",
        progress: "[&>div]:bg-pink-500",
        bar: "bg-pink-500",
      };
    case "slate":
    default:
      return {
        bg: "bg-slate-50 dark:bg-slate-900/40",
        border: "border-slate-300 dark:border-slate-700",
        text: "text-slate-700 dark:text-slate-300",
        iconBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
        progress: "[&>div]:bg-slate-500",
        bar: "bg-slate-500",
      };
  }
}
