"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ListTree, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ClauseTree } from "./ClauseTree";
import { MarcoNormativoForm } from "../MarcoNormativoForm";
import { ClausulaAddDialog } from "./ClausulaAddDialog";
import { ClausulaEditDialog } from "./ClausulaEditDialog";
import { CriterioCumplimientoAddDialog } from "./CriterioCumplimientoAddDialog";
import { FrameworkDetailSkeleton } from "./FrameworkDetailSkeleton";
import type { MarcoNormativoDto } from "../../api/marcos-normativos";
import type { ClausulaRequisitoDto } from "../../api/clausulas-requisitos";
import {
  useClausulasDetailQuery,
  useClausulaCreateMutation,
  useClausulaUpdateMutation,
  useCriterioCumplimientoCreateMutation,
} from "../../hooks/use-clausulas-query";
import { useMarcoNormativoUpdateMutation, useMarcoNormativoDeleteMutation } from "../../hooks/use-marcos-normativos-query";

interface MarcoForm {
  code: string;
  name: string;
  type: string;
  effectiveDate: string;
  isObligatory: boolean;
  version: string;
  description: string;
}

interface Props {
  frameworkId: string | null;
  marco: MarcoNormativoDto | null;
  onDeleted?: () => void;
}

export function FrameworkDetail({ frameworkId, marco, onDeleted }: Props) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addClauseOpen, setAddClauseOpen] = useState(false);
  const [editingClause, setEditingClause] = useState<ClausulaRequisitoDto | null>(null);
  const [clauseForCriterio, setClauseForCriterio] = useState<ClausulaRequisitoDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MarcoNormativoDto | null>(
    null
  );

  const { data, isLoading } = useClausulasDetailQuery(frameworkId);
  const clauses = data?.clauses ?? [];
  const criteria = data?.criteria ?? [];

  const createClauseMutation = useClausulaCreateMutation();
  const updateClauseMutation = useClausulaUpdateMutation(frameworkId);
  const createCriterioMutation = useCriterioCumplimientoCreateMutation(frameworkId);
  const updateMutation = useMarcoNormativoUpdateMutation();
  const deleteMutation = useMarcoNormativoDeleteMutation();

  const handleSaveEdit = async (formData: MarcoForm) => {
    if (!marco) return;
    const effectiveDateISO = new Date(
      formData.effectiveDate + "T00:00:00Z"
    ).toISOString();
    try {
      const ok = await updateMutation.mutateAsync({
        id: marco.id,
        payload: {
          name: formData.name,
          type: formData.type,
          effectiveDate: effectiveDateISO,
          isObligatory: formData.isObligatory,
          version: formData.version || null,
          description: formData.description || null,
        },
      });
      if (ok) setEditDialogOpen(false);
    } catch {
      // toast en servicio
    }
  };

  const handleAddClause = async (formData: {
    clauseNumber: string;
    title: string;
    requirementType: string;
    isAuditable: boolean;
    parentRequirementId: string | null;
    description: string | null;
  }) => {
    if (!marco) return;
    try {
      const created = await createClauseMutation.mutateAsync({
        regulatoryFrameworkId: marco.id,
        clauseNumber: formData.clauseNumber,
        title: formData.title,
        requirementType: formData.requirementType,
        isAuditable: formData.isAuditable,
        parentRequirementId: formData.parentRequirementId,
        description: formData.description,
      });
      if (created) setAddClauseOpen(false);
    } catch {
      // toast en servicio
    }
  };
  const handleEditClause = async (formData: {
    title: string;
    requirementType: string;
    isAuditable: boolean;
    parentRequirementId: string | null;
    description: string | null;
  }) => {
    if (!editingClause) return;
    try {
      const ok = await updateClauseMutation.mutateAsync({
        id: editingClause.id,
        payload: formData,
      });
      if (ok) setEditingClause(null);
    } catch {
      // toast en servicio
    }
  };
  const handleAddCriterio = async (formData: {
    code: string;
    description: string;
    evidenceType: string;
    verificationFrequency: string;
    weightedScore: number;
    isCritical: boolean;
  }) => {
    if (!clauseForCriterio) return;
    try {
      const created = await createCriterioMutation.mutateAsync({
        requirementClauseId: clauseForCriterio.id,
        code: formData.code,
        description: formData.description,
        evidenceType: formData.evidenceType,
        verificationFrequency: formData.verificationFrequency,
        weightedScore: formData.weightedScore,
        isCritical: formData.isCritical,
      });
      if (created) setClauseForCriterio(null);
    } catch {
      // toast en servicio
    }
  };
  const handleDeleteFramework = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
      onDeleted?.();
    } catch {
      // toast en servicio
    }
  };

  if (!frameworkId) {
    return (
      <Card className="flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">
          Seleccione un marco normativo para ver su detalle.
        </p>
      </Card>
    );
  }

  if (!marco) return null;

  if (isLoading) {
    return <FrameworkDetailSkeleton />;
  }

  const rootClauses = clauses.filter((c) => !c.parentRequirementId);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <ListTree className="h-5 w-5 text-muted-foreground shrink-0" />
            <h3 className="text-lg font-bold">Requisitos y Criterios</h3>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => setAddClauseOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" /> 
              <span className="hidden sm:block"> Agregar Cláusula</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setEditDialogOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => setDeleteTarget(marco)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {rootClauses.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No hay cláusulas registradas para este marco.
            </p>
          ) : (
            <div className="space-y-1">
              {rootClauses.map((clause) => (
                <ClauseTree
                  key={clause.id}
                  clause={clause}
                  allClauses={clauses}
                  criteria={criteria}
                  depth={0}
                  onEditClause={setEditingClause}
                  onAddCriterio={setClauseForCriterio}
                />
              ))}
            </div>
          )}

          {/* Metadatos del marco */}
          <div className="pt-8 border-t grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                Tipo de Marco
              </Label>
              <p className="text-sm font-medium">{marco.type}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                Fecha Vigencia
              </Label>
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="h-4 w-4 text-primary" />
                {new Date(marco.effectiveDate).toLocaleDateString("es-ES")}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                Versión Actual
              </Label>
              <Badge variant="secondary">
                {marco.version || "Sin versión"}
              </Badge>
            </div>
            {marco.description && (
              <div className="col-span-full space-y-1 bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="h-3 w-3 text-muted-foreground" />
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    Descripción
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {marco.description}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ClausulaAddDialog
        open={addClauseOpen}
        onOpenChange={setAddClauseOpen}
        marcoNormativoId={marco.id}
        existingClauses={clauses}
        onSubmit={handleAddClause}
        saving={createClauseMutation.isPending}
      />

      <ClausulaEditDialog
        open={!!editingClause}
        onOpenChange={(open) => !open && setEditingClause(null)}
        clause={editingClause}
        existingClauses={clauses}
        onSubmit={handleEditClause}
        saving={updateClauseMutation.isPending}
      />

      <CriterioCumplimientoAddDialog
        open={!!clauseForCriterio}
        onOpenChange={(open) => !open && setClauseForCriterio(null)}
        clause={clauseForCriterio}
        onSubmit={handleAddCriterio}
        saving={createCriterioMutation.isPending}
      />

      <MarcoNormativoForm
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleSaveEdit}
        initialData={marco}
        saving={updateMutation.isPending}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar el marco?</AlertDialogTitle>
            <AlertDialogDescription>
              El marco normativo{" "}
              <span className="font-bold text-foreground">
                &quot;{deleteTarget?.name}&quot;
              </span>{" "}
              será eliminado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFramework}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
