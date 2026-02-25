"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { MarcoNormativoDto } from "../services/compliance.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, Pencil, Trash2, Calendar, Settings2, Info } from "lucide-react";
import { MarcoNormativoForm } from "@/features/compliance/components/MarcoNormativoForm";
import { MarcoNormativoList } from "./MarcosNormativosList";
import {
  useMarcosNormativosQuery,
  useMarcoNormativoCreateMutation,
  useMarcoNormativoUpdateMutation,
  useMarcoNormativoDeleteMutation,
} from "../hooks/use-marcos-normativos-query";

interface MarcoForm {
  codigo: string;
  nombre: string;
  tipo: string;
  fechaVigencia: string;
  esObligatorio: boolean;
  version: string;
  descripcion: string;
}

export function MarcosNormativosTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMarco, setEditMarco] = useState<MarcoNormativoDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MarcoNormativoDto | null>(null);

  const { data: marcos = [], isLoading } = useMarcosNormativosQuery(true);
  const createMutation = useMarcoNormativoCreateMutation();
  const updateMutation = useMarcoNormativoUpdateMutation();
  const deleteMutation = useMarcoNormativoDeleteMutation();

  useEffect(() => {
    if (marcos.length > 0 && !selectedId) {
      setSelectedId(marcos[0].id);
    }
  }, [marcos, selectedId]);

  const openAdd = () => {
    setEditMarco(null);
    setDialogOpen(true);
  };

  const openEdit = (m: MarcoNormativoDto) => {
    setEditMarco(m);
    setDialogOpen(true);
  };

  const handleSaveSubmit = async (formData: MarcoForm) => {
    const fechaVigenciaISO = new Date(formData.fechaVigencia + "T00:00:00Z").toISOString();
    try {
      if (editMarco) {
        const ok = await updateMutation.mutateAsync({
          id: editMarco.id,
          payload: {
            nombre: formData.nombre,
            tipo: formData.tipo,
            fechaVigencia: fechaVigenciaISO,
            esObligatorio: formData.esObligatorio,
            version: formData.version || null,
            descripcion: formData.descripcion || null,
          },
        });
        if (ok) setDialogOpen(false);
      } else {
        const created = await createMutation.mutateAsync({
          codigo: formData.codigo,
          nombre: formData.nombre,
          tipo: formData.tipo,
          fechaVigencia: fechaVigenciaISO,
          esObligatorio: formData.esObligatorio,
          version: formData.version || null,
          descripcion: formData.descripcion || null,
        });
        if (created) setDialogOpen(false);
      }
    } catch {
      // Toast ya lo muestra el servicio
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      if (selectedId === deleteTarget.id) setSelectedId(null);
      setDeleteTarget(null);
    } catch {
      // Toast ya lo muestra el servicio
    }
  };

  const selectedMarco = marcos.find((m) => m.id === selectedId);
  const saving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex gap-6 h-[600px] pt-4">
        <Skeleton className="w-80 h-full rounded-xl" />
        <Skeleton className="flex-1 h-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
        <MarcoNormativoList 
          marcos={marcos}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onAddClick={openAdd}
        />

        {/* REVISION PENDIENTE NO MUESTRA TODA LA INFORMACION DE LA BASE DE DATOS POR QUE NO SE SABE QUE CAMPOS SE VAN A USAR */}

        {/* CONTENIDO PRINCIPAL: DETALLE DEL MARCO //// PENDIENTEEEEEEE*/}
        <div className="flex-1 w-full min-w-0">
          {selectedMarco ? (
            <Card className="shadow-md border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
              {/* Header del detalle */}
              <div className="px-6 py-4 border-b bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Settings2 className="h-5 w-5 text-gray-500" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Requisitos y Criterios</h2>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="bg-white" onClick={() => openEdit(selectedMarco)}>
                    <Pencil className="h-4 w-4 mr-2" /> Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive bg-white hover:bg-destructive/5" onClick={() => setDeleteTarget(selectedMarco)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                  </Button>
                  <div className="h-6 w-px bg-gray-300 mx-1 hidden md:block" />
                  <Button size="sm" className="bg-white text-black border shadow-sm hover:bg-gray-50">
                    <Plus className="h-4 w-4 mr-2" /> Agregar Cláusula
                  </Button>
                </div>
              </div>

              {/* Cuerpo del detalle */}
              <div className="p-8 space-y-10 flex-1 bg-white">
                {/* Ejemplo de Seccion 8 (Operación) */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white text-sm font-bold shadow-blue-200 shadow-lg">
                      8
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Operación</h3>
                  </div>

                  <div className="ml-12 relative">
                    <div className="absolute left-[-26px] top-0 bottom-0 w-[2px] bg-gray-100" />
                    
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-4">
                          <p className="text-base font-semibold text-blue-700">
                            8.3 Diseño y desarrollo de los productos y servicios
                          </p>
                          
                          <div className="space-y-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                              Criterios de cumplimiento:
                            </span>
                            <ul className="grid gap-2">
                              {["Planificación del diseño", "Controles del diseño"].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-sm text-gray-600">
                                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 text-[10px] font-bold px-3 py-1">
                          AUDITABLE
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info adicional del Marco */}
                <div className="pt-8 border-t grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Tipo de Marco</Label>
                    <p className="text-sm font-medium">{selectedMarco.tipo}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Fecha Vigencia</Label>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      {new Date(selectedMarco.fechaVigencia).toLocaleDateString("es-ES")}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Versión Actual</Label>
                    <Badge variant="secondary">{selectedMarco.version || "Sin versión"}</Badge>
                  </div>
                  {selectedMarco.descripcion && (
                    <div className="col-span-full space-y-1 bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Info className="h-3 w-3 text-gray-400" />
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Descripción</Label>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{selectedMarco.descripcion}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-[600px] flex flex-col items-center justify-center border-dashed border-2">
              <div className="bg-gray-50 p-6 rounded-full mb-4">
                <FileText className="h-12 w-12 text-gray-300" />
              </div>
              <p className="text-muted-foreground font-medium">Selecciona un marco normativo de la lista</p>
            </Card>
          )}
        </div>
      </div>

      {/* MODALES MODULARES */}
      <MarcoNormativoForm 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSaveSubmit}
        initialData={editMarco}
        saving={saving}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              El marco normativo <span className="font-bold text-foreground">"{deleteTarget?.nombre}"</span> será borrado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg">
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}