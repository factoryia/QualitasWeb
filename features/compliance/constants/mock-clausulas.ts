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
      marcoNormativoId,
      numeroClausula: "8",
      titulo: "Operación",
      tipoRequisito: "Sección",
      esAuditable: false,
      clausulaPadreId: null,
      descripcion: null,
      isActive: true,
    },
    {
      id: id83,
      marcoNormativoId,
      numeroClausula: "8.3",
      titulo: "Diseño y desarrollo de los productos y servicios",
      tipoRequisito: "Requisito",
      esAuditable: true,
      clausulaPadreId: id8,
      descripcion: null,
      isActive: true,
    },
  ];
  const criterios: CriterioCumplimientoDto[] = [
    {
      id: `mock-crit-1-${marcoNormativoId}`,
      clausulaRequisitoId: id83,
      codigo: "C1",
      descripcion: "Planificación del diseño.",
      tipoEvidencia: "Documental",
      frecuenciaVerificacion: "Anual",
      pesoPonderacion: 10,
      isActive: true,
    },
    {
      id: `mock-crit-2-${marcoNormativoId}`,
      clausulaRequisitoId: id83,
      codigo: "C2",
      descripcion: "Controles del diseño.",
      tipoEvidencia: "Documental",
      frecuenciaVerificacion: "Anual",
      pesoPonderacion: 10,
      isActive: true,
    },
  ];
  return { clausulas, criterios };
}
