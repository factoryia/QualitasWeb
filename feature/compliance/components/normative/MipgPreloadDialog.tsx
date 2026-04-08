"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  useMipgDimensionCreateMutation,
  useMipgPolicyCreateMutation,
  useMipgDimensionDeleteMutation,
} from "../../hooks/use-mipg-query";
import type { MipgDimensionDto } from "../../api/mipg-dimensiones";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingDimensions: MipgDimensionDto[];
}

const STANDARD_MIPG_DIMENSIONS = [
  {
    number: 1,
    name: "Talento Humano",
    description: "Gestión del Talento Humano como el activo más importante.",
    colorHex: "#E91E63",
    policies: [
      { number: 1, name: "Gestión Estratégica del Talento Humano", rectorEntity: "Función Pública" },
      { number: 2, name: "Integridad", rectorEntity: "Función Pública" },
    ],
  },
  {
    number: 2,
    name: "Direccionamiento Estratégico y Planeación",
    description: "Define la ruta estratégica de la entidad.",
    colorHex: "#9C27B0",
    policies: [
      { number: 3, name: "Planeación Institucional", rectorEntity: "DNP" },
      { number: 4, name: "Gestión Presupuestal y Eficiencia del Gasto Público", rectorEntity: "Ministerio de Hacienda" },
    ],
  },
  {
    number: 3,
    name: "Gestión con Valores para Resultados",
    description: "Permite la operación de la entidad para el logro de resultados.",
    colorHex: "#3F51B5",
    policies: [
      { number: 5, name: "Fortalecimiento Organizacional y Simplificación de Procesos", rectorEntity: "Función Pública" },
      { number: 6, name: "Gobierno Digital", rectorEntity: "MinTIC" },
      { number: 7, name: "Seguridad Digital", rectorEntity: "MinTIC" },
      { number: 8, name: "Defensa Jurídica", rectorEntity: "ANDJE" },
      { number: 9, name: "Mejora Normativa", rectorEntity: "DNP" },
      { number: 10, name: "Servicio al Ciudadano", rectorEntity: "DNP" },
      { number: 11, name: "Racionalización de Trámites", rectorEntity: "Función Pública" },
      { number: 12, name: "Participación Ciudadana en la Gestión Pública", rectorEntity: "Función Pública" },
    ],
  },
  {
    number: 4,
    name: "Evaluación de Resultados",
    description: "Permite conocer el estado de la gestión y el avance de los resultados.",
    colorHex: "#00BCD4",
    policies: [
      { number: 13, name: "Seguimiento y Evaluación del Desempeño Institucional", rectorEntity: "DNP" },
    ],
  },
  {
    number: 5,
    name: "Información y Comunicación",
    description: "Garantiza el flujo de información y comunicación.",
    colorHex: "#4CAF50",
    policies: [
      { number: 14, name: "Gestión Documental", rectorEntity: "Archivo General de la Nación" },
      { number: 15, name: "Transparencia, Acceso a la Información y Lucha contra la Corrupción", rectorEntity: "Secretaría de Transparencia" },
    ],
  },
  {
    number: 6,
    name: "Gestión del Conocimiento y la Innovación",
    description: "Promueve el aprendizaje y la innovación.",
    colorHex: "#FF9800",
    policies: [
      { number: 16, name: "Gestión del Conocimiento y la Innovación", rectorEntity: "Función Pública" },
    ],
  },
  {
    number: 7,
    name: "Control Interno",
    description: "Garantiza que la gestión se realice conforme a las normas.",
    colorHex: "#795548",
    policies: [
      { number: 17, name: "Control Interno", rectorEntity: "Función Pública" },
    ],
  },
];

export function MipgPreloadDialog({ open, onOpenChange, existingDimensions }: Props) {
  const [step, setStep] = useState<"manage" | "create">("manage");
  const [selectedDimensions, setSelectedDimensions] = useState<number[]>(
    STANDARD_MIPG_DIMENSIONS.map((d) => d.number)
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const { mutateAsync: deleteDimension } = useMipgDimensionDeleteMutation();
  const { mutateAsync: createDimension } = useMipgDimensionCreateMutation();
  const { mutateAsync: createPolicy } = useMipgPolicyCreateMutation();

  useEffect(() => {
    if (open) {
      setStep("manage");
      setSelectedDimensions(STANDARD_MIPG_DIMENSIONS.map((d) => d.number));
    }
  }, [open]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDimension(id);
      toast.success("Dimensión eliminada correctamente");
    } catch (error) {
      console.error("Error deleting dimension", error);
      toast.error("Error al eliminar la dimensión");
    }
  };

  const handleCreate = async () => {
    setIsProcessing(true);
    try {
      const dimensionsToCreate = STANDARD_MIPG_DIMENSIONS.filter((d) =>
        selectedDimensions.includes(d.number)
      );

      for (const dimData of dimensionsToCreate) {
        // 1. Create Dimension
        const createdDim = await createDimension({
          number: dimData.number,
          name: dimData.name,
          description: dimData.description,
          colorHex: dimData.colorHex,
          isTransversal: false, // Defaulting to specific for now, adjust if needed
        });

        if (createdDim && createdDim.id) {
            // 2. Create Policies for this dimension
            for (const policyData of dimData.policies) {
                await createPolicy({
                    dimensionId: createdDim.id,
                    number: policyData.number,
                    name: policyData.name,
                    rectorEntity: policyData.rectorEntity,
                });
            }
        }
      }

      toast.success("Dimensiones y políticas creadas correctamente");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating dimensions", error);
      toast.error("Error al crear las dimensiones. Puede que algunas ya existan.");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleSelection = (num: number) => {
    setSelectedDimensions((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === "manage" ? "Gestión de Dimensiones Existentes" : "Precargar Dimensiones MIPG"}
          </DialogTitle>
          <DialogDescription>
            {step === "manage"
              ? "Revise las dimensiones actuales. Puede eliminarlas antes de cargar nuevas."
              : "Seleccione las dimensiones estándar del MIPG que desea crear."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 max-h-[60vh] overflow-y-auto">
          {step === "manage" ? (
            <div className="space-y-4">
              {existingDimensions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No hay dimensiones registradas actualmente.</p>
                  <p className="text-sm mt-1">Puede continuar para crear las dimensiones estándar.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {existingDimensions.map((dim) => (
                    <div
                      key={dim.id}
                      className="flex items-center justify-between p-3 border rounded-md bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: dim.colorHex || "#ccc" }}
                        >
                          D{dim.number}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{dim.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {dim.description || "Sin descripción"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(dim.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <p className="text-sm font-medium">Dimensiones Disponibles</p>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedDimensions(STANDARD_MIPG_DIMENSIONS.map(d => d.number))}>Todas</Button>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedDimensions([])}>Ninguna</Button>
                </div>
              </div>
              <div className="grid gap-2">
                {STANDARD_MIPG_DIMENSIONS.map((dim) => (
                  <div
                    key={dim.number}
                    className="flex items-start gap-3 p-3 border rounded-md hover:bg-accent/5 transition-colors"
                  >
                    <Checkbox
                      checked={selectedDimensions.includes(dim.number)}
                      onCheckedChange={() => toggleSelection(dim.number)}
                      id={`dim-${dim.number}`}
                      className="mt-1"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={`dim-${dim.number}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        D{dim.number} - {dim.name}
                      </label>
                      <p className="text-xs text-muted-foreground">
                        {dim.description}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1 bg-muted/50 p-1.5 rounded">
                        <strong>Políticas:</strong> {dim.policies.map(p => p.name).join(", ")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {step === "manage" ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setStep("create")}>
                Continuar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep("manage")}>
                Atrás
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isProcessing || selectedDimensions.length === 0}
              >
                {isProcessing ? "Creando..." : `Crear ${selectedDimensions.length} Dimensiones`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
