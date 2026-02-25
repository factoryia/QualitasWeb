"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";
import { Plus, Network, AlertTriangle, ChevronsDownUp, ChevronsUpDown, Loader2 } from "lucide-react";
import { OrgStructureDrawer } from "./OrgStructureDrawer";
import { OrgChartNode } from "./OrgChartNode";
import type { Area, Sede } from "../types";
import {
  useAreas,
  useSedes,
  useMembers,
  useAreaUserCounts,
  useCreateArea,
  useUpdateArea,
  type OrgMember,
} from "../hooks/use-organization-structure-query";

/** En false: áreas se manejan con useState (quemado). En true: se usan endpoints de áreas. */
const STRUCTURE_API_ENABLED = false;

interface Props {
  orgId: string;
}

interface AreaForm {
  name: string;
  code: string;
  parent_id: string | null;
  sede_id: string | null;
  manager_id: string | null;
}

function buildAreaOptions(
  areas: Area[],
  excludeId?: string,
  parentId: string | null = null,
  depth = 0
): { id: string; label: string }[] {
  const result: { id: string; label: string }[] = [];
  const children = areas.filter(
    (a) => a.parent_id === parentId && a.id !== excludeId && a.is_active !== false
  );
  for (const child of children) {
    result.push({ id: child.id, label: `${"—".repeat(depth)} ${child.name}`.trim() });
    result.push(...buildAreaOptions(areas, excludeId, child.id, depth + 1));
  }
  return result;
}

function createEmptyArea(overrides: Partial<Area> & { name: string; organization_id: string }): Area {
  return {
    id: crypto.randomUUID(),
    name: overrides.name,
    code: overrides.code ?? null,
    parent_id: overrides.parent_id ?? null,
    hierarchy_level: overrides.hierarchy_level ?? 1,
    sede_id: overrides.sede_id ?? null,
    manager_id: overrides.manager_id ?? null,
    is_active: true,
    organization_id: overrides.organization_id,
  };
}

/** Sedes de ejemplo para el formulario cuando la estructura es 100% local (sin API). */
function getLocalSedes(organizationId: string): Sede[] {
  return [
    { id: "local-sede-1", name: "Sede Principal", organization_id: organizationId, is_principal: true },
    { id: "local-sede-2", name: "Sede Norte", organization_id: organizationId },
    { id: "local-sede-3", name: "Sede Sur", organization_id: organizationId },
  ];
}

/** Responsables/usuarios de ejemplo para el formulario cuando la estructura es 100% local (sin API). */
const LOCAL_MEMBERS: OrgMember[] = [
  { user_id: "local-user-1", full_name: "Juan Pérez" },
  { user_id: "local-user-2", full_name: "María García" },
  { user_id: "local-user-3", full_name: "Carlos López" },
];

export function OrgStructure({ orgId }: Props) {
  const [localAreas, setLocalAreas] = useState<Area[]>([]);
  const [localSedes] = useState<Sede[]>(() => getLocalSedes(orgId));
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editArea, setEditArea] = useState<Area | null>(null);
  const [form, setForm] = useState<AreaForm>({
    name: "",
    code: "",
    parent_id: null,
    sede_id: null,
    manager_id: null,
  });
  const [codeError, setCodeError] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [allExpanded, setAllExpanded] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Area | null>(null);
  const [deleteInfo, setDeleteInfo] = useState<{ subAreas: number; users: number } | null>(null);

  const orgIdForAreas = STRUCTURE_API_ENABLED ? orgId : null;
  const { data: apiAreas = [], isLoading: areasLoading } = useAreas(orgIdForAreas);
  const { data: sedesFromApi = [] } = useSedes(STRUCTURE_API_ENABLED ? orgId : null);
  const { data: membersFromApi = [] } = useMembers(STRUCTURE_API_ENABLED ? orgId : null);
  const areas = STRUCTURE_API_ENABLED ? apiAreas : localAreas;
  const sedes = STRUCTURE_API_ENABLED ? sedesFromApi : localSedes;
  const members = STRUCTURE_API_ENABLED ? membersFromApi : LOCAL_MEMBERS;
  const areaIds = areas.map((a) => a.id);
  const { userCounts } = useAreaUserCounts(STRUCTURE_API_ENABLED ? areaIds : []);

  const createAreaMutation = useCreateArea(orgIdForAreas);
  const updateAreaMutation = useUpdateArea(orgIdForAreas);

  const saving = STRUCTURE_API_ENABLED && (createAreaMutation.isPending || updateAreaMutation.isPending);
  const loading = STRUCTURE_API_ENABLED && areasLoading;

  const openAdd = (pId: string | null) => {
    setEditArea(null);
    setForm({ name: "", code: "", parent_id: pId, sede_id: null, manager_id: null });
    setCodeError("");
    setDialogOpen(true);
  };

  const openEdit = (a: Area) => {
    setEditArea(a);
    setForm({
      name: a.name,
      code: a.code ?? "",
      parent_id: a.parent_id ?? null,
      sede_id: a.sede_id ?? null,
      manager_id: a.manager_id ?? null,
    });
    setCodeError("");
    setDialogOpen(true);
  };

  const validateCode = (code: string, currentId?: string) => {
    if (!code.trim()) {
      setCodeError("");
      return true;
    }
    const existing = areas.find((a) => a.code === code.trim() && a.id !== currentId);
    if (existing) {
      setCodeError("Este código ya está en uso");
      return false;
    }
    setCodeError("");
    return true;
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Nombre requerido");
      return;
    }
    const codeValid = validateCode(form.code, editArea?.id);
    if (!codeValid) return;

    if (STRUCTURE_API_ENABLED) {
      if (editArea) {
        const success = await updateAreaMutation.mutateAsync({
          areaId: editArea.id,
          data: {
            name: form.name,
            code: form.code || undefined,
            parent_id: form.parent_id ?? undefined,
            sede_id: form.sede_id ?? undefined,
            manager_id: form.manager_id ?? undefined,
          },
        });
        if (success) setDialogOpen(false);
      } else {
        const parentArea = form.parent_id ? areas.find((a) => a.id === form.parent_id) : null;
        const hierarchy_level = parentArea ? (parentArea.hierarchy_level ?? 1) + 1 : 1;
        const created = await createAreaMutation.mutateAsync({
          name: form.name,
          code: form.code || undefined,
          parent_id: form.parent_id ?? undefined,
          hierarchy_level,
          sede_id: form.sede_id ?? undefined,
          manager_id: form.manager_id ?? undefined,
          organization_id: orgId,
        });
        if (created) setDialogOpen(false);
      }
      return;
    }

    if (editArea) {
      setLocalAreas((prev) =>
        prev.map((a) =>
          a.id === editArea.id
            ? {
                ...a,
                name: form.name,
                code: form.code || null,
                parent_id: form.parent_id,
                sede_id: form.sede_id,
                manager_id: form.manager_id,
              }
            : a
        )
      );
      toast.success("Área actualizada");
    } else {
      const parentArea = form.parent_id ? areas.find((a) => a.id === form.parent_id) : null;
      const hierarchy_level = parentArea ? (parentArea.hierarchy_level ?? 1) + 1 : 1;
      const newArea = createEmptyArea({
        name: form.name,
        code: form.code || null,
        parent_id: form.parent_id,
        hierarchy_level,
        sede_id: form.sede_id,
        manager_id: form.manager_id,
        organization_id: orgId,
      });
      setLocalAreas((prev) => [...prev, newArea]);
      toast.success("Área creada");
    }
    setDialogOpen(false);
  };

  const confirmDelete = (area: Area) => {
    const subAreas = areas.filter(
      (a) => a.parent_id === area.id && a.is_active !== false
    ).length;
    const users = userCounts[area.id] ?? 0;
    setDeleteInfo({ subAreas, users });
    setDeleteTarget(area);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (STRUCTURE_API_ENABLED) {
      const success = await updateAreaMutation.mutateAsync({
        areaId: deleteTarget.id,
        data: { is_active: false },
      });
      if (success) {
        setDeleteTarget(null);
        setDeleteInfo(null);
      }
    } else {
      setLocalAreas((prev) =>
        prev.map((a) => (a.id === deleteTarget.id ? { ...a, is_active: false } : a))
      );
      toast.success("Área desactivada");
      setDeleteTarget(null);
      setDeleteInfo(null);
    }
  };

  const displayAreas = showInactive ? areas : areas.filter((a) => a.is_active !== false);
  const rootAreas = displayAreas.filter((a) => !a.parent_id);
  const areaOptions = buildAreaOptions(areas, editArea?.id);

  return (
    <div className="space-y-6 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold">Organigrama Institucional</h3>
          <p className="text-xs text-muted-foreground">Visualización jerárquica de dependencias</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setAllExpanded(!allExpanded)}>
            {allExpanded ? <ChevronsDownUp className="h-4 w-4 mr-1" /> : <ChevronsUpDown className="h-4 w-4 mr-1" />}
            {allExpanded ? "Colapsar" : "Expandir"}
          </Button>
          <div className="flex items-center gap-2">
            <Switch checked={showInactive} onCheckedChange={setShowInactive} id="show-inactive" />
            <Label htmlFor="show-inactive" className="text-xs text-muted-foreground">Inactivas</Label>
          </div>
          <Button size="sm" onClick={() => openAdd(null)}>
            <Plus className="h-4 w-4 mr-1" /> Agregar Dependencia
          </Button>
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin opacity-40" />
            <p>Cargando organigrama...</p>
          </CardContent>
        </Card>
      ) : displayAreas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Network className="mx-auto mb-2 h-8 w-8 opacity-40" />
            <p>No hay áreas creadas aún.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto pb-8">
          <div className="flex justify-center gap-8 min-w-max px-4">
            {rootAreas.map((area) => (
              <OrgChartNode
                key={area.id}
                area={area}
                allAreas={displayAreas}
                members={members}
                userCounts={userCounts}
                isRoot
                allExpanded={allExpanded}
                onSelect={setSelectedArea}
                onAddChild={openAdd}
                onEdit={openEdit}
                onDelete={confirmDelete}
              />
            ))}
          </div>
        </div>
      )}

      <OrgStructureDrawer area={selectedArea} orgId={orgId} sedes={sedes} members={members} onClose={() => setSelectedArea(null)} />

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editArea ? "Editar Área" : "Nueva Área"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Código</Label>
              <Input
                value={form.code}
                onChange={(e) => {
                  setForm({ ...form, code: e.target.value });
                  setCodeError("");
                }}
                placeholder="DIR-01"
              />
              {codeError && <p className="text-sm text-destructive">{codeError}</p>}
            </div>
            <div className="space-y-2">
              <Label>Depende de</Label>
              <Select
                value={form.parent_id ?? "__none__"}
                onValueChange={(v) =>
                  setForm({ ...form, parent_id: v === "__none__" ? null : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Área raíz (sin padre)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Área raíz (sin padre) —</SelectItem>
                  {areaOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sede</Label>
              <Select
                value={form.sede_id ?? "__none__"}
                onValueChange={(v) =>
                  setForm({ ...form, sede_id: v === "__none__" ? null : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin sede asignada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Sin sede —</SelectItem>
                  {sedes.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                      {s.is_principal ? " (Principal)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Responsable</Label>
              <Select
                value={form.manager_id ?? "__none__"}
                onValueChange={(v) =>
                  setForm({ ...form, manager_id: v === "__none__" ? null : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin responsable" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Sin responsable —</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.user_id} value={m.user_id}>
                      {m.full_name || "Sin nombre"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : editArea ? "Guardar" : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setDeleteInfo(null); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Desactivar área
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span>¿Deseas desactivar el área <strong>"{deleteTarget?.name}"</strong>?</span>
              {deleteInfo && (deleteInfo.subAreas > 0 || deleteInfo.users > 0) && (
                <span className="block mt-2 text-destructive">
                  ⚠️ Esta área tiene {deleteInfo.subAreas > 0 ? `${deleteInfo.subAreas} sub-área(s) activa(s)` : ""}
                  {deleteInfo.subAreas > 0 && deleteInfo.users > 0 ? " y " : ""}
                  {deleteInfo.users > 0 ? `${deleteInfo.users} usuario(s) vinculado(s)` : ""}.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
