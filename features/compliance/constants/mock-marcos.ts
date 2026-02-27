import type { MarcoNormativoDto } from "../services/compliance.service";

/** Datos quemados cuando no hay respuesta del API o la lista viene vacía */
export const MOCK_MARCOS_NORMATIVOS: MarcoNormativoDto[] = [
  {
    id: "mock-1",
    code: "ISO 9001:2015",
    name: "Sistemas de gestión de la calidad",
    type: "Norma internacional",
    effectiveDate: "2020-01-01T00:00:00.000Z",
    isObligatory: true,
    version: "2015",
    description: "Requisitos para un sistema de gestión de la calidad. Incluye planificación, operación, evaluación y mejora.",
    isActive: true,
  },
  {
    id: "mock-2",
    code: "MIPG",
    name: "Modelo Integrado de Planeación y Gestión",
    type: "Marco nacional",
    effectiveDate: "2022-01-01T00:00:00.000Z",
    isObligatory: true,
    version: "2022",
    description: "Marco de referencia para la planeación y gestión de las entidades del Estado colombiano.",
    isActive: true,
  },
  {
    id: "mock-3",
    code: "ISO 37001",
    name: "Sistemas de gestión antisoborno",
    type: "Norma internacional",
    effectiveDate: "2021-06-01T00:00:00.000Z",
    isObligatory: false,
    version: "2016",
    description: "Requisitos y guía para implementar un sistema de gestión antisoborno.",
    isActive: true,
  },
];
