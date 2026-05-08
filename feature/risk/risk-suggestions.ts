import type { RiskCategoryDto } from "./types";

export type RiskSuggestionDraft = {
  key: string;
  riskTitle: string;
  description: string;
  categoryCode: string;
  probabilityInherent: number;
  impactInherent: number;
};

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function categoryIdByCode(categories: RiskCategoryDto[], code: string): string | undefined {
  return categories.find((c) => c.code === code)?.id;
}

/**
 * Borradores locales (sin LLM) según tipo/código de proceso; se filtran por códigos ya usados.
 */
export function buildRiskSuggestions(
  processName: string,
  processTypeName: string,
  processTypeCode: string | undefined,
  categories: RiskCategoryDto[],
  existingRiskCodes: Set<string>,
): RiskSuggestionDraft[] {
  const typeBlob = norm(`${processTypeCode ?? ""} ${processTypeName} ${processName}`);
  const drafts: RiskSuggestionDraft[] = [];

  const push = (d: RiskSuggestionDraft) => {
    if (!categoryIdByCode(categories, d.categoryCode)) return;
    drafts.push(d);
  };

  if (/estrateg|est\b|direccion/i.test(typeBlob)) {
    push({
      key: "s1",
      riskTitle: "Desalineación con el entorno sectorial",
      description:
        "Riesgo de que la estrategia del proceso no refleje cambios del sector o de partes interesadas clave.",
      categoryCode: "RIESGO_ESTRATEGICO",
      probabilityInherent: 2,
      impactInherent: 4,
    });
    push({
      key: "s2",
      riskTitle: "Falla en el despliegue de la estrategia",
      description: "Retrasos o resistencia al cambio que impiden ejecutar planes aprobados.",
      categoryCode: "RIESGO_ESTRATEGICO",
      probabilityInherent: 3,
      impactInherent: 4,
    });
  }

  if (/mision|operac|servicio|atencion/i.test(typeBlob)) {
    push({
      key: "o1",
      riskTitle: "Interrupción del servicio o producto",
      description: "Fallos operativos que afectan la continuidad del servicio al ciudadano o cliente.",
      categoryCode: "RIESGO_OPERACIONAL",
      probabilityInherent: 3,
      impactInherent: 4,
    });
    push({
      key: "o2",
      riskTitle: "Errores humanos o de datos en la cadena de valor",
      description: "Calidad inconsistente por falta de capacitación o controles débiles.",
      categoryCode: "RIESGO_OPERACIONAL",
      probabilityInherent: 3,
      impactInherent: 3,
    });
  }

  if (/financ|presup|contrat/i.test(typeBlob)) {
    push({
      key: "f1",
      riskTitle: "Desviación presupuestal o de costos",
      description: "Ejecución fuera de lo planificado que compromete sostenibilidad financiera.",
      categoryCode: "RIESGO_FINANCIERO",
      probabilityInherent: 3,
      impactInherent: 4,
    });
  }

  push({
    key: "c1",
    riskTitle: "Incumplimiento normativo aplicable",
    description: "Desconocimiento o aplicación incompleta de requisitos legales y reglamentarios.",
    categoryCode: "RIESGO_CUMPLIMIENTO",
    probabilityInherent: 2,
    impactInherent: 5,
  });

  push({
    key: "r1",
    riskTitle: "Daño reputacional por incidentes públicos",
    description: "Comunicación deficiente o fallas visibles que afectan la confianza de las partes interesadas.",
    categoryCode: "RIESGO_REPUTACIONAL",
    probabilityInherent: 2,
    impactInherent: 4,
  });

  const unique: RiskSuggestionDraft[] = [];
  const seenTitle = new Set<string>();
  for (const d of drafts) {
    const codeGuess = `SUG-${d.key.toUpperCase()}`;
    if (existingRiskCodes.has(codeGuess)) continue;
    const t = d.riskTitle.toLowerCase();
    if (seenTitle.has(t)) continue;
    seenTitle.add(t);
    unique.push({ ...d, key: codeGuess });
  }
  return unique.slice(0, 8);
}
