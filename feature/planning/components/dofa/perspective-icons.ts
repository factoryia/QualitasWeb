import {
  DollarSign,
  GraduationCap,
  Settings2,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps a BSC perspective label to a Lucide icon component.
 * Matching is case-insensitive and based on substring includes.
 */
export function getPerspectiveIcon(name: string): LucideIcon {
  const lower = name.toLowerCase();
  if (lower.includes("financ")) return DollarSign;
  if (lower.includes("cliente")) return Users;
  if (lower.includes("proceso")) return Settings2;
  if (lower.includes("aprend")) return GraduationCap;
  return Sparkles;
}

/**
 * Normalizes a BSC perspective label to a key used by EmptyPerspectiveGuide's
 * PERSPECTIVE_GUIDES map. Falls back to the lowercased name (which triggers
 * DEFAULT_GUIDE in the component).
 */
export function getPerspectiveGuideKey(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("financ")) return "financiera";
  if (lower.includes("cliente")) return "cliente";
  if (lower.includes("proceso")) return "procesos";
  if (lower.includes("aprend")) return "aprendizaje";
  return lower;
}
