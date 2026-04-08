import type { DofaCategory, DofaPerspective } from "@/feature/planning/api/dofa";

export type DofaPerspectiveTab = {
  value: string;
  perspective: DofaPerspective;
  label: string;
  helper: string;
};

export type DofaCategoryCard = {
  category: DofaCategory;
  title: string;
  headerClassName: string;
};

export const DOFA_PERSPECTIVE_TABS: DofaPerspectiveTab[] = [
  {
    value: "financiera",
    perspective: "Financiero",
    label: "Financiera",
    helper:
      "Identifique fortalezas y debilidades financieras: liquidez, cartera, ingresos, costos, rentabilidad.",
  },
  {
    value: "cliente",
    perspective: "Cliente",
    label: "Cliente",
    helper:
      "Identifique fortalezas y debilidades desde el cliente/usuario: satisfacción, cobertura, percepción, fidelización.",
  },
  {
    value: "procesos",
    perspective: "ProcesosInternos",
    label: "Procesos",
    helper:
      "Identifique fortalezas y debilidades de procesos internos: eficiencia, calidad, tiempos, cumplimiento, controles.",
  },
  {
    value: "aprendizaje",
    perspective: "AprendizajeYCrecimiento",
    label: "Aprendizaje",
    helper:
      "Identifique fortalezas y debilidades de capacidades: talento, cultura, tecnología, innovación, formación.",
  },
  {
    value: "cruce",
    perspective: "CruceEstrategico",
    label: "Cruce Estratégico",
    helper: "Cruce F-O, F-A, D-O, D-A para proponer estrategias y líneas de acción.",
  },
];

export const DOFA_CATEGORY_CARDS: DofaCategoryCard[] = [
  {
    category: "Fortaleza",
    title: "Fortalezas",
    headerClassName:
      "bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-300",
  },
  {
    category: "Debilidad",
    title: "Debilidades",
    headerClassName:
      "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-300",
  },
  {
    category: "Oportunidad",
    title: "Oportunidades",
    headerClassName:
      "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-300",
  },
  {
    category: "Amenaza",
    title: "Amenazas",
    headerClassName:
      "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300",
  },
];
