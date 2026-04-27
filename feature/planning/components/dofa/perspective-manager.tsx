"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  BscPerspectiveDto,
  CreateBscPerspectiveCommand,
  UpdateBscPerspectiveCommand,
} from "@/feature/planning/api/dofa";
import {
  useBscPerspectiveCreateMutation,
  useBscPerspectiveDeleteMutation,
  useBscPerspectiveUpdateMutation,
  useBscPerspectivesQuery,
} from "@/feature/planning/hooks/use-dofa";
import {
  PerspectiveUpsertDialog,
  type PerspectiveUpsertDraft,
  EMPTY_PERSPECTIVE_DRAFT,
} from "./perspective-upsert-dialog";

export function PerspectiveManager() {
  const { data: perspectives = [], isLoading } = useBscPerspectivesQuery();
  const createMutation = useBscPerspectiveCreateMutation();
  const updateMutation = useBscPerspectiveUpdateMutation();
  const deleteMutation = useBscPerspectiveDeleteMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PerspectiveUpsertDraft>(EMPTY_PERSPECTIVE_DRAFT);
  const [deletingPerspective, setDeletingPerspective] =
    useState<BscPerspectiveDto | null>(null);

  const isBusy =
    isLoading ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const openCreate = () => {
    setDialogMode("create");
    setEditingId(null);
    setDraft(EMPTY_PERSPECTIVE_DRAFT);
    setDialogOpen(true);
  };

  const openEdit = (p: BscPerspectiveDto) => {
    setDialogMode("edit");
    setEditingId(p.id);
    setDraft({
      code: p.code,
      name: p.name,
      description: p.description ?? "",
      color: p.color ?? "",
      order: String(p.order ?? 0),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const orderNum = parseInt(draft.order, 10) || 0;
    if (dialogMode === "create") {
      const payload: CreateBscPerspectiveCommand = {
        code: draft.code.trim(),
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        color: draft.color.trim() || null,
        order: orderNum,
      };
      const created = await createMutation.mutateAsync(payload);
      if (created) setDialogOpen(false);
    } else if (editingId) {
      const payload: UpdateBscPerspectiveCommand = {
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        color: draft.color.trim() || null,
        order: orderNum,
      };
      const ok = await updateMutation.mutateAsync({ perspectiveId: editingId, payload });
      if (ok) setDialogOpen(false);
    }
  };

  const sorted = [...perspectives].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate} disabled={isBusy}>
          <Plus className="h-4 w-4 mr-1" />
          Nueva perspectiva
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="w-[70px] text-center">Orden</TableHead>
              <TableHead className="w-[90px]">Color</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="w-[90px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs">{p.code}</TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-center">{p.order}</TableCell>
                <TableCell>
                  {p.color ? (
                    <Badge
                      variant="outline"
                      style={{ borderColor: p.color, color: p.color }}
                    >
                      {p.color}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {p.description || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEdit(p)}
                      disabled={isBusy}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => setDeletingPerspective(p)}
                      disabled={isBusy}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-sm text-muted-foreground"
                >
                  Sin perspectivas BSC configuradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PerspectiveUpsertDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        draft={draft}
        onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
        onSave={handleSave}
        isBusy={isBusy}
      />

      <AlertDialog
        open={!!deletingPerspective}
        onOpenChange={(open) => {
          if (!open) setDeletingPerspective(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar perspectiva</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingPerspective
                ? `¿Eliminar "${deletingPerspective.name}"? Esta acción no se puede deshacer.`
                : "¿Eliminar esta perspectiva?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingPerspective(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={async () => {
                if (!deletingPerspective) return;
                const ok = await deleteMutation.mutateAsync(deletingPerspective.id);
                if (ok) setDeletingPerspective(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
