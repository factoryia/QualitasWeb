"use client";

import { Plus, Download, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/** Dimensiones MIPG quemadas (igual que qualitas-tree) */
const DEFAULT_DIMENSIONS = [
  {
    dimension_number: 1,
    name: "Talento Humano",
    description: "Gestión estratégica del talento humano.",
    leading_entity: "Función Pública",
  },
  {
    dimension_number: 2,
    name: "Direccionamiento Estratégico y Planeación",
    description: "Definición de la ruta estratégica institucional.",
    leading_entity: "DNP",
  },
  {
    dimension_number: 3,
    name: "Gestión con Valores para Resultados",
    description: "Operación eficiente orientada a resultados.",
    leading_entity: "Función Pública",
  },
  {
    dimension_number: 4,
    name: "Evaluación de Resultados",
    description: "Seguimiento y evaluación del desempeño institucional.",
    leading_entity: "DNP",
  },
  {
    dimension_number: 5,
    name: "Información y Comunicación",
    description: "Gestión de la información y comunicación institucional.",
    leading_entity: "MinTIC",
  },
  {
    dimension_number: 6,
    name: "Gestión del Conocimiento y la Innovación",
    description: "Generación, captura y transferencia de conocimiento.",
    leading_entity: "Función Pública",
  },
  {
    dimension_number: 7,
    name: "Control Interno",
    description: "Aseguramiento y evaluación independiente de la gestión.",
    leading_entity: "Función Pública",
  },
];

const DIMENSION_COLORS: Record<
  number,
  { bg: string; text: string; circle: string; border: string }
> = {
  1: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    circle: "bg-blue-600",
    border: "border-blue-200",
  },
  2: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    circle: "bg-indigo-600",
    border: "border-indigo-200",
  },
  3: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    circle: "bg-emerald-600",
    border: "border-emerald-200",
  },
  4: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    circle: "bg-amber-600",
    border: "border-amber-200",
  },
  5: {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    circle: "bg-cyan-600",
    border: "border-cyan-200",
  },
  6: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    circle: "bg-purple-600",
    border: "border-purple-200",
  },
  7: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    circle: "bg-rose-600",
    border: "border-rose-200",
  },
};

export function MipgPanel() {
  const dimensions = DEFAULT_DIMENSIONS;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground max-w-xl">
          El Modelo Integrado de Planeación y Gestión agrupa las políticas en
          dimensiones. Úselo para preparar el autodiagnóstico y FURAG.
        </p>
        <Button className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" /> Nueva Política
        </Button>
      </div>

      <div className="flex flex-col gap-5">
        {dimensions.map((dim) => {
          const colors =
            DIMENSION_COLORS[dim.dimension_number] ?? DIMENSION_COLORS[1];
          return (
            <Card key={dim.dimension_number} className="overflow-hidden p-0">
              <div
                className={`px-5 py-4 ${colors.bg} border-b ${colors.border} flex items-center gap-4`}
              >
                <div
                  className={`w-8 h-8 rounded-lg ${colors.circle} text-white flex items-center justify-center font-bold text-sm shrink-0`}
                >
                  D{dim.dimension_number}
                </div>
                <div>
                  <h4 className={`text-base font-bold ${colors.text}`}>
                    {dim.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    0 Políticas asociadas
                  </p>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-muted-foreground mb-2">
                  {dim.description}
                </p>
                {dim.leading_entity && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Building className="h-3 w-3" /> Entidad Líder:{" "}
                    {dim.leading_entity}
                  </div>
                )}
                <p className="text-sm text-muted-foreground italic mt-4">
                  Sin políticas registradas en esta dimensión.
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Precargar 7 dimensiones MIPG
        </Button>
      </div>
    </div>
  );
}
