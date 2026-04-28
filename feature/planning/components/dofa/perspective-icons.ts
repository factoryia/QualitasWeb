import {
  Award,
  BarChart3,
  Briefcase,
  Cog,
  Compass,
  DollarSign,
  GraduationCap,
  Globe,
  Heart,
  Leaf,
  Lightbulb,
  Scale,
  Settings2,
  Shield,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Icon catalog (16 entries, lucide-react only)
// ---------------------------------------------------------------------------

export const ICON_OPTIONS: { key: string; Icon: LucideIcon; label: string }[] = [
  { key: "dollar",     Icon: DollarSign,   label: "Financiera"     },
  { key: "users",      Icon: Users,         label: "Cliente"        },
  { key: "cog",        Icon: Cog,           label: "Procesos"       },
  { key: "graduation", Icon: GraduationCap, label: "Aprendizaje"   },
  { key: "scale",      Icon: Scale,         label: "Legal"          },
  { key: "leaf",       Icon: Leaf,          label: "Ambiental"      },
  { key: "target",     Icon: Target,        label: "Objetivos"      },
  { key: "lightbulb",  Icon: Lightbulb,     label: "Innovación"    },
  { key: "shield",     Icon: Shield,        label: "Riesgo"         },
  { key: "heart",      Icon: Heart,         label: "Social"         },
  { key: "chart",      Icon: BarChart3,     label: "Desempeño"     },
  { key: "globe",      Icon: Globe,         label: "Global"         },
  { key: "award",      Icon: Award,         label: "Calidad"        },
  { key: "briefcase",  Icon: Briefcase,     label: "Negocio"        },
  { key: "compass",    Icon: Compass,       label: "General"        },
  { key: "settings",   Icon: Settings2,     label: "Configuración" },
];

export const ICON_MAP: Record<string, LucideIcon> = ICON_OPTIONS.reduce(
  (acc, o) => { acc[o.key] = o.Icon; return acc; },
  {} as Record<string, LucideIcon>,
);

// ---------------------------------------------------------------------------
// Color presets
// ---------------------------------------------------------------------------

export const COLOR_PRESETS: string[] = [
  "#22c55e", "#3b82f6", "#f59e0b", "#a855f7",
  "#ef4444", "#06b6d4", "#ec4899", "#64748b",
];

// ---------------------------------------------------------------------------
// Standard perspective detection
// ---------------------------------------------------------------------------

export const STANDARD_PERSPECTIVE_CODES = ["FIN", "CLI", "PRO", "APR"] as const;

/** Maps BSC standard codes to icon keys */
const CODE_TO_ICON_KEY: Record<string, string> = {
  FIN: "dollar",
  CLI: "users",
  PRO: "cog",
  APR: "graduation",
};

/** Maps lowercase name substrings to icon keys (fallback when code absent) */
const DEFAULT_KEY_TO_ICON: Record<string, string> = {
  financ:   "dollar",
  cliente:  "users",
  proceso:  "cog",
  aprend:   "graduation",
  legal:    "scale",
  ambiental: "leaf",
};

/**
 * Returns true if the perspective is one of the four BSC standard ones.
 * Uses `code` first; falls back to name substring when code is absent.
 */
export function isStandardPerspective(p: { code?: string; name: string }): boolean {
  if (p.code) {
    return (STANDARD_PERSPECTIVE_CODES as readonly string[]).includes(p.code.toUpperCase());
  }
  const lower = p.name.toLowerCase();
  return (
    lower.includes("financ") ||
    lower.includes("cliente") ||
    lower.includes("proceso") ||
    lower.includes("aprend")
  );
}

// ---------------------------------------------------------------------------
// Icon resolver
// ---------------------------------------------------------------------------

/**
 * Resolves the Lucide icon for a BSC perspective with four-level fallback:
 * 1. Explicit `icon` key stored by the backend.
 * 2. Lookup by `code` (FIN → dollar, CLI → users, …).
 * 3. Lookup by name substring.
 * 4. Compass as ultimate fallback.
 */
export function resolveIcon(p: { code?: string; name: string; icon?: string | null }): LucideIcon {
  if (p.icon && ICON_MAP[p.icon]) return ICON_MAP[p.icon];
  if (p.code) {
    const byCode = CODE_TO_ICON_KEY[p.code.toUpperCase()];
    if (byCode) return ICON_MAP[byCode];
  }
  const lower = p.name.toLowerCase();
  for (const [substr, key] of Object.entries(DEFAULT_KEY_TO_ICON)) {
    if (lower.includes(substr)) return ICON_MAP[key];
  }
  return Compass;
}

// ---------------------------------------------------------------------------
// Backward-compatible helpers (used by DofaPerspectivePanel / EmptyPerspectiveGuide)
// ---------------------------------------------------------------------------

/**
 * Maps a BSC perspective label to a Lucide icon component.
 * Kept for backward compatibility — prefer `resolveIcon` for new code.
 */
export function getPerspectiveIcon(name: string): LucideIcon {
  return resolveIcon({ name });
}

/**
 * Normalizes a BSC perspective label to a key used by EmptyPerspectiveGuide's
 * PERSPECTIVE_GUIDES map.
 */
export function getPerspectiveGuideKey(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("financ")) return "financiera";
  if (lower.includes("cliente")) return "cliente";
  if (lower.includes("proceso")) return "procesos";
  if (lower.includes("aprend")) return "aprendizaje";
  return lower;
}
