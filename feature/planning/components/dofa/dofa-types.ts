import type { DofaItemDto } from "@/feature/planning/api/dofa";

export type DofaCategory = "Fortaleza" | "Debilidad" | "Oportunidad" | "Amenaza";

export type PerspectiveTab = {
  key: string;
  label: string;
  description: string;
};

export type QuadrantConfig = {
  category: DofaCategory;
  label: string;
  textClass: string;
  borderClass: string;
  fillClass: string;
};

export type GroupedItems = Record<string, Record<DofaCategory, DofaItemDto[]>>;

export const QUADRANTS: QuadrantConfig[] = [
  {
    category: "Fortaleza",
    label: "Fortalezas",
    textClass: "text-green-700 dark:text-green-400",
    borderClass: "border-green-400/40",
    fillClass: "bg-green-500",
  },
  {
    category: "Debilidad",
    label: "Debilidades",
    textClass: "text-red-700 dark:text-red-400",
    borderClass: "border-red-400/40",
    fillClass: "bg-red-500",
  },
  {
    category: "Oportunidad",
    label: "Oportunidades",
    textClass: "text-blue-700 dark:text-blue-400",
    borderClass: "border-blue-400/40",
    fillClass: "bg-blue-500",
  },
  {
    category: "Amenaza",
    label: "Amenazas",
    textClass: "text-amber-700 dark:text-amber-400",
    borderClass: "border-amber-400/40",
    fillClass: "bg-amber-500",
  },
];
