import { TrendingUp, ShieldCheck, ArrowUpRight, ShieldAlert, type LucideIcon } from "lucide-react";
import type { StrategyType } from "@/feature/planning/api/dofa";

export const STRATEGY_CODES = ["FO", "DO", "FA", "DA"] as const;
export type StrategyCode = (typeof STRATEGY_CODES)[number];

export const STRATEGY_TYPE_CONFIG: Record<
  StrategyCode,
  {
    tagline: string;
    tone: "low" | "medium" | "high" | "primary";
    Icon: LucideIcon;
    filterCategories: readonly string[];
  }
> = {
  FO: {
    tagline: "Potenciar",
    tone: "low",
    Icon: TrendingUp,
    filterCategories: ["Fortaleza", "Oportunidad"],
  },
  FA: {
    tagline: "Defender",
    tone: "medium",
    Icon: ShieldCheck,
    filterCategories: ["Fortaleza", "Amenaza"],
  },
  DO: {
    tagline: "Mejorar",
    tone: "primary",
    Icon: ArrowUpRight,
    filterCategories: ["Debilidad", "Oportunidad"],
  },
  DA: {
    tagline: "Sobrevivir",
    tone: "high",
    Icon: ShieldAlert,
    filterCategories: ["Debilidad", "Amenaza"],
  },
};

/**
 * Given a strategicTypeId UUID and the catalog of StrategyTypeDto,
 * returns the matching DOFA code ("FO" | "DO" | "FA" | "DA") or null.
 */
export function mapStrategicTypeIdToCode(
  typeId: string,
  catalog: StrategyType[],
): StrategyCode | null {
  const found = catalog.find((t) => t.id === typeId);
  if (!found) return null;
  const code = found.code as StrategyCode;
  return STRATEGY_CODES.includes(code) ? code : null;
}

/**
 * Given a DOFA code and the catalog of StrategyTypeDto,
 * returns the matching strategicTypeId UUID or null.
 */
export function mapCodeToStrategicTypeId(
  code: StrategyCode,
  catalog: StrategyType[],
): string | null {
  const found = catalog.find((t) => t.code === code);
  return found?.id ?? null;
}
