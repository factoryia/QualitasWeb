import type {
  ClausulaRequisitoDto,
  CriterioCumplimientoDto,
} from "../services/compliance.service";

/** Cláusulas y criterios quemados cuando no hay datos del API (por marco) */
export function getMockClausulasYCriterios(marcoNormativoId: string): {
  clausulas: ClausulaRequisitoDto[];
  criterios: CriterioCumplimientoDto[];
} {
  const id8 = `mock-sec-8-${marcoNormativoId}`;
  const id83 = `mock-sec-83-${marcoNormativoId}`;
  const clausulas: ClausulaRequisitoDto[] = [
    {
      id: id8,
      regulatoryFrameworkIds: [marcoNormativoId],
      parentRequirementId: null,
      clauseNumber: "8",
      title: "Operación",
      requirementType: "Sección",
      isAuditable: false,
      description: null,
      isActive: true,
    },
    {
      id: id83,
      regulatoryFrameworkIds: [marcoNormativoId],
      parentRequirementId: id8,
      clauseNumber: "8.3",
      title: "Diseño y desarrollo de los productos y servicios",
      requirementType: "Requisito",
      isAuditable: true,
      description: null,
      isActive: true,
    },
  ];
  const criterios: CriterioCumplimientoDto[] = [
    {
      id: `mock-crit-1-${marcoNormativoId}`,
      requirementId: id83,
      code: "C1",
      description: "Planificación del diseño.",
      evidenceType: "Documental",
      verificationFrequency: "Anual",
      weight: 10,
      isActive: true,
    },
    {
      id: `mock-crit-2-${marcoNormativoId}`,
      requirementId: id83,
      code: "C2",
      description: "Controles del diseño.",
      evidenceType: "Documental",
      verificationFrequency: "Anual",
      weight: 10,
      isActive: true,
    },
  ];
  return { clausulas, criterios };
}
