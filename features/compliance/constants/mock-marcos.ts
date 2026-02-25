import type { MarcoNormativoDto } from "../services/compliance.service";

/** Datos quemados cuando no hay respuesta del API o la lista viene vacía */
export const MOCK_MARCOS_NORMATIVOS: MarcoNormativoDto[] = [
  {
    id: "mock-1",
    codigo: "ISO 9001:2015",
    nombre: "Sistemas de gestión de la calidad",
    tipo: "Norma internacional",
    fechaVigencia: "2020-01-01T00:00:00.000Z",
    esObligatorio: true,
    version: "2015",
    descripcion: "Requisitos para un sistema de gestión de la calidad. Incluye planificación, operación, evaluación y mejora.",
    isActive: true,
  },
  {
    id: "mock-2",
    codigo: "MIPG",
    nombre: "Modelo Integrado de Planeación y Gestión",
    tipo: "Marco nacional",
    fechaVigencia: "2022-01-01T00:00:00.000Z",
    esObligatorio: true,
    version: "2022",
    descripcion: "Marco de referencia para la planeación y gestión de las entidades del Estado colombiano.",
    isActive: true,
  },
  {
    id: "mock-3",
    codigo: "ISO 37001",
    nombre: "Sistemas de gestión antisoborno",
    tipo: "Norma internacional",
    fechaVigencia: "2021-06-01T00:00:00.000Z",
    esObligatorio: false,
    version: "2016",
    descripcion: "Requisitos y guía para implementar un sistema de gestión antisoborno.",
    isActive: true,
  },
];
