"use client";

import { Lightbulb, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DofaCategory } from "./dofa-types";

// ---------------------------------------------------------------------------
// Guide data (hardcoded, Capa-1 — see README tech debt for Capa 2 roadmap)
// ---------------------------------------------------------------------------

type LowerCategory = "fortaleza" | "debilidad" | "oportunidad" | "amenaza";

const PERSPECTIVE_GUIDES: Record<string, Record<LowerCategory, string[]>> = {
  financiera: {
    fortaleza: [
      "Crecimiento sostenido de ingresos",
      "Buena estructura de costos",
      "Alto retorno sobre inversión",
    ],
    debilidad: [
      "Dependencia de una sola fuente de ingresos",
      "Alto nivel de endeudamiento",
      "Presupuesto limitado para innovación",
    ],
    oportunidad: [
      "Acceso a nuevas fuentes de financiamiento",
      "Crecimiento del mercado objetivo",
      "Posibilidad de alianzas estratégicas",
    ],
    amenaza: [
      "Fluctuaciones cambiarias",
      "Incremento en costos de insumos",
      "Competencia con precios más bajos",
    ],
  },
  cliente: {
    fortaleza: [
      "Alta satisfacción del usuario",
      "Base de clientes diversificada",
      "Canales de atención efectivos",
    ],
    debilidad: [
      "Baja retención de usuarios",
      "Poca presencia en canales digitales",
      "Tiempos de respuesta largos",
    ],
    oportunidad: [
      "Nuevos segmentos de mercado",
      "Tendencia a servicios digitales",
      "Demanda insatisfecha",
    ],
    amenaza: [
      "Cambio en preferencias del cliente",
      "Nuevos competidores en el mercado",
      "Expectativas crecientes de calidad",
    ],
  },
  procesos: {
    fortaleza: [
      "Procesos documentados y estandarizados",
      "Certificaciones de calidad vigentes",
      "Sistemas de gestión implementados",
    ],
    debilidad: [
      "Procesos manuales sin automatizar",
      "Falta de indicadores de gestión",
      "Brechas en documentación de procesos",
    ],
    oportunidad: [
      "Automatización de procesos clave",
      "Implementación de mejores prácticas",
      "Digitalización de servicios",
    ],
    amenaza: [
      "Cambios regulatorios frecuentes",
      "Obsolescencia tecnológica",
      "Riesgos de seguridad de la información",
    ],
  },
  aprendizaje: {
    fortaleza: [
      "Personal calificado y comprometido",
      "Cultura de mejora continua",
      "Programa de capacitación robusto",
    ],
    debilidad: [
      "Alta rotación de personal clave",
      "Brecha de competencias digitales",
      "Falta de gestión del conocimiento",
    ],
    oportunidad: [
      "Alianzas con instituciones educativas",
      "Plataformas de e-learning accesibles",
      "Programas de pasantías y semilleros",
    ],
    amenaza: [
      "Fuga de talento al sector privado",
      "Cambios tecnológicos acelerados",
      "Recortes presupuestales en formación",
    ],
  },
};

const DEFAULT_GUIDE: Record<LowerCategory, string[]> = {
  fortaleza: [
    "Ventaja competitiva interna clave",
    "Recurso o capacidad diferenciadora",
    "Logro o reconocimiento reciente",
  ],
  debilidad: [
    "Área de mejora identificada",
    "Recurso insuficiente",
    "Brecha de competencias",
  ],
  oportunidad: [
    "Tendencia favorable del entorno",
    "Posibilidad de crecimiento",
    "Cambio regulatorio favorable",
  ],
  amenaza: [
    "Riesgo externo identificado",
    "Cambio desfavorable del entorno",
    "Presión de la competencia",
  ],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = {
  /** Normalized guide key from getPerspectiveGuideKey() — e.g. "financiera" */
  perspectiveKey: string;
  /** PascalCase from dofa-types — converted internally to lowercase for lookup */
  category: DofaCategory;
  onAddExample: (text: string) => void;
  readOnly?: boolean;
  accentClass?: string;
};

export function EmptyPerspectiveGuide({
  perspectiveKey,
  category,
  onAddExample,
  readOnly = false,
  accentClass,
}: Props) {
  const lowerCat = category.toLowerCase() as LowerCategory;
  const examples =
    PERSPECTIVE_GUIDES[perspectiveKey]?.[lowerCat] ?? DEFAULT_GUIDE[lowerCat];

  return (
    <div className="rounded-md border border-dashed border-border bg-muted/30 p-3 space-y-2">
      <div className="flex items-center gap-1.5">
        <Lightbulb className={cn("h-3.5 w-3.5", accentClass ?? "text-muted-foreground")} />
        <span
          className={cn(
            "text-[11px] font-semibold uppercase tracking-wide",
            accentClass ?? "text-muted-foreground",
          )}
        >
          Ideas para empezar
        </span>
      </div>
      <ul className="space-y-1">
        {examples.map((example, i) => (
          <li key={i}>
            {readOnly ? (
              <span className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/50 shrink-0" />
                {example}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onAddExample(example)}
                className="group w-full flex items-start gap-1.5 text-left text-xs text-muted-foreground hover:text-foreground rounded px-1.5 py-1 hover:bg-background transition-colors"
              >
                <Plus className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground/60 group-hover:text-primary" />
                <span>{example}</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
