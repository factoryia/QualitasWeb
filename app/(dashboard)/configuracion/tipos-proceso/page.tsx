"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Switch } from "@/components/ui/switch";
import {
  useProcessTypes,
  useSaveProcessType,
  useDeleteProcessType,
  useProcesses,
} from "@/feature/process/hooks/use-processes";
import { ProcessTypeFormDialog } from "@/components/processes/ProcessTypeFormDialog";
import { ProcessTypePresetPicker } from "@/components/processes/ProcessTypePresetPicker";
import { ProcessTypeIcon } from "@/components/processes/ProcessTypeIcon";
import { ProcessValueChain } from "@/components/processes/ProcessValueChain";
import { getTypeStyles } from "@/feature/process/process-type-presets";
import { useAuthStore } from "@/feature/auth/store/auth.store";
import type { ProcessTypeDto } from "@/feature/process/types";

export default function ProcessTypesConfigPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === "Admin" || role === "admin" || role === "Administrator";

  const { data: types = [], isLoading } = useProcessTypes(true);
  const { data: processes = [] } = useProcesses(false);
  const saveType = useSaveProcessType();
  const deleteType = useDeleteProcessType();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProcessTypeDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProcessTypeDto | null>(null);

  if (!isAdmin) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Esta página requiere permisos de administrador.
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Volver
        </Button>
      </div>
    );
  }

  const sorted = [...types].sort((a, b) => a.order - b.order);
  const nextOrder = sorted.length > 0 ? Math.max(...sorted.map((t) => t.order)) + 1 : 0;

  const handleSave = async (values: Parameters<typeof saveType.mutateAsync>[0]) => {
    await saveType.mutateAsync(values);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteType.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-2">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Volver
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Tipos de Proceso</h1>
          <p className="text-sm text-muted-foreground">
            Configura los macroprocesos de tu organización (ISO 9001 / MIPG / personalizado).
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> Nuevo tipo
        </Button>
      </div>

      <div className="rounded-md border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40 p-3 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          ISO 9001:2015 (4.4) <strong>no prescribe</strong> cantidad ni nombres de macroprocesos —
          solo el enfoque basado en procesos. Los presets son sugerencias: ISO clásico (3),
          MIPG (4) o personalizado.
        </p>
      </div>

      <ProcessTypePresetPicker />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tipos configurados</CardTitle>
            <CardDescription>
              Edita, ordena y activa/desactiva los macroprocesos de la organización.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : sorted.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Aún no hay tipos. Aplica un preset o crea uno manual.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead className="text-center">Color</TableHead>
                    <TableHead className="text-center">Procesos</TableHead>
                    <TableHead className="text-center">Activo</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((type) => {
                    const styles = getTypeStyles(type.color);
                    const linked = processes.filter((p) => p.processTypeId === type.id).length;
                    return (
                      <TableRow key={type.id}>
                        <TableCell className="text-muted-foreground text-xs">
                          {type.order}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{type.code}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`rounded p-1 ${styles.iconBg}`}>
                              <ProcessTypeIcon name={type.icon} className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-sm">{type.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`inline-block h-4 w-4 rounded ${styles.bar}`}
                            title={type.color ?? "—"}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs">
                            {linked}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={type.isActive}
                            onCheckedChange={(v) =>
                              saveType.mutate({
                                id: type.id,
                                code: type.code,
                                name: type.name,
                                order: type.order,
                                description: type.description,
                                color: type.color,
                                icon: type.icon,
                                layoutHint: type.layoutHint,
                                isActive: v,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => {
                                setEditing(type);
                                setFormOpen(true);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(type)}
                              disabled={linked > 0}
                              title={
                                linked > 0
                                  ? "No se puede eliminar: tiene procesos asignados"
                                  : "Eliminar"
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vista previa</CardTitle>
            <CardDescription>
              Cómo se verán los tipos activos en el mapa de procesos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="origin-top-left scale-[0.85] -mb-12">
              <ProcessValueChain
                types={types.filter((t) => t.isActive)}
                processes={processes}
                onSelect={() => {}}
                showEmptyCategories
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <ProcessTypeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        defaultOrder={nextOrder}
        onSave={handleSave}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && !deleteType.isPending && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tipo de proceso?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar <strong>{deleteTarget?.name}</strong>. Esto fallará si hay procesos
              activos asignados a este tipo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteType.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteType.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteType.isPending ? "Eliminando…" : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
