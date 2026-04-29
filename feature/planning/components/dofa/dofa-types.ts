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
  headerBgClass: string;
  cellBgClass: string;
};

export type GroupedItems = Record<string, Record<DofaCategory, DofaItemDto[]>>;

export const QUADRANTS: QuadrantConfig[] = [
  {
    category: "Fortaleza",
    label: "Fortalezas",
    textClass: "text-green-700 dark:text-green-400",
    borderClass: "border-green-400/40",
    fillClass: "bg-green-500",
    headerBgClass: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    cellBgClass: "bg-green-50/30 dark:bg-green-950/10",
  },
  {
    category: "Debilidad",
    label: "Debilidades",
    textClass: "text-red-700 dark:text-red-400",
    borderClass: "border-red-400/40",
    fillClass: "bg-red-500",
    headerBgClass: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    cellBgClass: "bg-red-50/30 dark:bg-red-950/10",
  },
  {
    category: "Oportunidad",
    label: "Oportunidades",
    textClass: "text-blue-700 dark:text-blue-400",
    borderClass: "border-blue-400/40",
    fillClass: "bg-blue-500",
    headerBgClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    cellBgClass: "bg-blue-50/30 dark:bg-blue-950/10",
  },
  {
    category: "Amenaza",
    label: "Amenazas",
    textClass: "text-amber-700 dark:text-amber-400",
    borderClass: "border-amber-400/40",
    fillClass: "bg-amber-500",
    headerBgClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    cellBgClass: "bg-amber-50/30 dark:bg-amber-950/10",
  },
];
