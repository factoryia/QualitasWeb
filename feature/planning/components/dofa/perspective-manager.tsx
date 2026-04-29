"use client";

import { useState } from "react";
import { Lock, Pencil, Plus, Trash2 } from "lucide-react";
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
import toast from "react-hot-toast";
import type {
  BscPerspectiveDto,
  CreateBscPerspectiveCommand,
  DofaItemDto,
  UpdateBscPerspectiveCommand,
} from "@/feature/planning/api/dofa";
import {
  useBscPerspectiveCreateMutation,
  useBscPerspectiveDeleteMutation,
  useBscPerspectiveUpdateMutation,
  useBscPerspectivesQuery,
} from "@/feature/planning/hooks/use-dofa";
import {
  COLOR_PRESETS,
  isStandardPerspective,
  resolveIcon,
} from "./perspective-icons";
import {
  EMPTY_PERSPECTIVE_DRAFT,
  PerspectiveUpsertDialog,
  type PerspectiveUpsertDraft,
} from "./perspective-upsert-dialog";

// ---------------------------------------------------------------------------
// PerspectiveManager
// ---------------------------------------------------------------------------

type Props = {
  /** Active items from the current analysis, used to guard delete. Optional. */
  items?: Pick<DofaItemDto, "bscPerspectiveId" | "perspective">[];
};

function abbreviateCode(code: string): string {
  return code.length > 5 ? code.substring(0, 4) : code;
}

export function PerspectiveManager({ items }: Props) {
  const { data: perspectives = [], isLoading } = useBscPerspectivesQuery();
  const createMutation = useBscPerspectiveCreateMutation();
  const updateMutation = useBscPerspectiveUpdateMutation();
  const deleteMutation = useBscPerspectiveDeleteMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingIsStandard, setEditingIsStandard] = useState(false);
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
    setEditingIsStandard(false);
    setDraft(EMPTY_PERSPECTIVE_DRAFT);
    setDialogOpen(true);
  };

  const openEdit = (p: BscPerspectiveDto) => {
    setDialogMode("edit");
    setEditingId(p.id);
    setEditingIsStandard(isStandardPerspective(p));
    setDraft({
      code: p.code ?? "",
      name: p.name,
      description: p.description ?? "",
      color: p.color ?? COLOR_PRESETS[1],
      icon: p.icon ?? "compass",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (dialogMode === "create") {
      const nextOrder =
        perspectives.length > 0
          ? Math.max(...perspectives.map((p) => p.order ?? 0)) + 1
          : 1;
      const payload: CreateBscPerspectiveCommand = {
        code: draft.code.trim(),
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        color: draft.color.trim() || null,
        icon: draft.icon || null,
        order: nextOrder,
      };
      const created = await createMutation.mutateAsync(payload);
      if (created) setDialogOpen(false);
    } else if (editingId) {
      const editing = perspectives.find((p) => p.id === editingId);
      const payload: UpdateBscPerspectiveCommand = {
        name: draft.name.trim(),
        description: draft.description.trim() || null,
        color: draft.color.trim() || null,
        icon: draft.icon || null,
        order: editing?.order ?? 0,
      };
      const ok = await updateMutation.mutateAsync({ perspectiveId: editingId, payload });
      if (ok) setDialogOpen(false);
    }
  };

  const handleDeleteClick = (p: BscPerspectiveDto) => {
    if (isStandardPerspective(p)) return; // button should be hidden, but guard anyway
    const hasItems = (items ?? []).some(
      (i) => (i.bscPerspectiveId ?? i.perspective) === p.id,
    );
    if (hasItems) {
      toast.error("Elimine primero los elementos de esta perspectiva");
      return;
    }
    setDeletingPerspective(p);
  };

  const sorted = [...perspectives].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="space-y-4">
      {/* Header info */}
      <p className="text-xs text-muted-foreground">
        Las perspectivas estándar (Financiera, Cliente, Procesos, Aprendizaje) están
        bloqueadas. Puedes editar su apariencia o crear perspectivas personalizadas.
      </p>

      {/* Perspective list */}
      <div className="space-y-2">
        {sorted.map((p) => {
          const Icon = resolveIcon(p);
          const isStd = isStandardPerspective(p);
          const accentColor = p.color ?? COLOR_PRESETS[1];
          return (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-lg border px-3 py-2 hover:bg-muted/30 transition-colors"
            >
              {/* Colored icon */}
              <div
                className="flex h-8 w-8 items-center justify-center rounded-md shrink-0"
                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Name + badges */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium truncate">{p.name}</span>
                  {p.code && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 font-mono shrink-0">
                      {abbreviateCode(p.code)}
                    </Badge>
                  )}
                  {isStd && <Lock className="h-3 w-3 text-muted-foreground shrink-0" />}
                </div>
                {p.description && (
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {p.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => openEdit(p)}
                  disabled={isBusy}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                {!isStd && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteClick(p)}
                    disabled={isBusy}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {sorted.length === 0 && !isLoading && (
          <p className="text-center text-sm text-muted-foreground py-6">
            Sin perspectivas BSC configuradas.
          </p>
        )}
      </div>

      {/* Create button */}
      <Button variant="outline" size="sm" className="gap-1.5 w-full" onClick={openCreate} disabled={isBusy}>
        <Plus className="h-3.5 w-3.5" /> Nueva perspectiva
      </Button>

      {/* Upsert dialog */}
      <PerspectiveUpsertDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        isStandard={editingIsStandard}
        draft={draft}
        onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
        onSave={handleSave}
        isBusy={isBusy}
      />

      {/* Delete confirm */}
      <AlertDialog
        open={!!deletingPerspective}
        onOpenChange={(open) => { if (!open) setDeletingPerspective(null); }}
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
