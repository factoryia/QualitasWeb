"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  organizationService,
  type OrganizationUnitDto,
} from "../services/organization.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Network, AlertTriangle, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  orgId: string;
}

interface UnitForm {
  name: string;
  code: string;
  parentId: string | null;
  description: string;
  isActive: boolean;
}

function buildUnitOptions(
  units: OrganizationUnitDto[],
  excludeId?: string,
  parentId: string | null = null,
  depth = 0
): { id: string; label: string }[] {
  const result: { id: string; label: string }[] = [];
  const children = units.filter(
    (u) => u.parentId === parentId && u.id !== excludeId && u.isActive !== false
  );
  for (const child of children) {
    result.push({ id: child.id, label: `${"—".repeat(depth)} ${child.name}`.trim() });
    result.push(...buildUnitOptions(units, excludeId, child.id, depth + 1));
  }
  return result;
}

function UnitNode({
  unit,
  units,
  showInactive,
  onEdit,
  onDelete,
  depth = 0,
}: {
  unit: OrganizationUnitDto;
  units: OrganizationUnitDto[];
  showInactive: boolean;
  onEdit: (u: OrganizationUnitDto) => void;
  onDelete: (u: OrganizationUnitDto) => void;
  depth?: number;
}) {
  const children = units.filter((u) => u.parentId === unit.id && (showInactive || u.isActive !== false));
  return (
    <div className={depth > 0 ? "ml-4 mt-2 border-l-2 border-muted pl-4" : ""}>
      <div className="flex items-center justify-between gap-2 py-1.5 rounded-md hover:bg-muted/50">
        <div className="min-w-0">
          <span className="font-medium text-sm">{unit.name}</span>
          {unit.code && (
            <span className="ml-2 text-xs text-muted-foreground font-mono">{unit.code}</span>
          )}
          {unit.isActive === false && (
            <span className="ml-2 text-[10px] text-muted-foreground">(inactiva)</span>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="sm" className="h-7" onClick={() => onEdit(unit)}>
            Editar
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-destructive" onClick={() => onDelete(unit)}>
            Eliminar
          </Button>
        </div>
      </div>
      {children.map((child) => (
        <UnitNode
          key={child.id}
          unit={child}
          units={units}
          showInactive={showInactive}
          onEdit={onEdit}
          onDelete={onDelete}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export function OrgStructure({ orgId }: Props) {
  const [units, setUnits] = useState<OrganizationUnitDto[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUnit, setEditUnit] = useState<OrganizationUnitDto | null>(null);
  const [form, setForm] = useState<UnitForm>({
    name: "",
    code: "",
    parentId: null,
    description: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [showInactive, setShowInactive] = useState(true);
  const [allExpanded, setAllExpanded] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<OrganizationUnitDto | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const list = await organizationService.getAllOrganizationUnits(true);
    setUnits(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [orgId]);

  const openAdd = (parentId: string | null) => {
    setEditUnit(null);
    setForm({ name: "", code: "", parentId, description: "", isActive: true });
    setCodeError("");
    setDialogOpen(true);
  };

  const openEdit = (u: OrganizationUnitDto) => {
    setEditUnit(u);
    setForm({
      name: u.name,
      code: u.code,
      parentId: u.parentId,
      description: u.description ?? "",
      isActive: u.isActive ?? true,
    });
    setCodeError("");
    setDialogOpen(true);
  };

  const validateCode = (code: string, currentId?: string) => {
    if (!code.trim()) {
      setCodeError("");
      return true;
    }
    const existing = units.find((u) => u.code === code.trim() && u.id !== currentId);
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
    if (!form.code.trim()) {
      toast.error("Código requerido");
      return;
    }
    if (!validateCode(form.code, editUnit?.id)) return;
    setSaving(true);
    if (editUnit) {
      const success = await organizationService.updateOrganizationUnitById(editUnit.id, {
        code: form.code,
        name: form.name,
        description: form.description || null,
        isActive: form.isActive,
        parentId: form.parentId,
      });
      if (success) {
        setDialogOpen(false);
        fetchData();
      }
    } else {
      const created = await organizationService.createOrganizationUnit({
        organizationId: orgId,
        name: form.name,
        code: form.code,
        description: form.description || null,
        parentId: form.parentId,
      });
      if (created) {
        setDialogOpen(false);
        fetchData();
      }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const success = await organizationService.deleteOrganizationUnit(deleteTarget.id);
    if (success) {
      setDeleteTarget(null);
      fetchData();
    }
  };

  const displayUnits = showInactive ? units : units.filter((u) => u.isActive !== false);
  const rootUnits = displayUnits.filter((u) => !u.parentId);
  const unitOptions = buildUnitOptions(units, editUnit?.id);

  return (
    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold">Estructura organizacional</h3>
          <p className="text-xs text-muted-foreground">Unidades por jerarquía (parentId)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setAllExpanded(!allExpanded)}>
            {allExpanded ? <ChevronsDownUp className="h-4 w-4 mr-1" /> : <ChevronsUpDown className="h-4 w-4 mr-1" />}
            {allExpanded ? "Colapsar" : "Expandir"}
          </Button>
          <div className="flex items-center gap-2">
            <Switch checked={showInactive} onCheckedChange={setShowInactive} id="show-inactive" />
            <Label htmlFor="show-inactive" className="text-xs text-muted-foreground">
              Incluir inactivas
            </Label>
          </div>
          <Button size="sm" onClick={() => openAdd(null)}>
            <Plus className="h-4 w-4 mr-1" /> Nueva unidad
          </Button>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center gap-2 py-1.5">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="ml-4 border-l-2 border-muted pl-4 space-y-3">
              <div className="flex items-center gap-2 py-1.5">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-36" />
              </div>
              <div className="ml-4 border-l-2 border-muted pl-4 space-y-2">
                <div className="flex items-center gap-2 py-1.5">
                  <Skeleton className="h-3 w-28" />
                </div>
                <div className="flex items-center gap-2 py-1.5">
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="flex items-center gap-2 py-1.5">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : displayUnits.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Network className="mx-auto mb-2 h-8 w-8 opacity-40" />
            <p>No hay unidades organizativas. Crea una desde la pestaña Sedes o aquí.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4">
            {rootUnits.map((unit) => (
              <UnitNode
                key={unit.id}
                unit={unit}
                units={displayUnits}
                showInactive={showInactive}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle>{editUnit ? "Editar unidad" : "Nueva unidad"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Código *</Label>
              <Input
                value={form.code}
                onChange={(e) => {
                  setForm({ ...form, code: e.target.value });
                  setCodeError("");
                }}
                placeholder="ej. DIR-01"
              />
              {codeError && <p className="text-sm text-destructive">{codeError}</p>}
            </div>
            <div className="space-y-2">
              <Label>Depende de</Label>
              <Select
                value={form.parentId ?? "__none__"}
                onValueChange={(v) => setForm({ ...form, parentId: v === "__none__" ? null : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Raíz (sin padre)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Raíz (sin padre) —</SelectItem>
                  {unitOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Opcional"
              />
            </div>
            {editUnit && (
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active" className="text-sm">
                  Activa
                </Label>
                <Switch
                  id="is_active"
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : editUnit ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" /> Eliminar unidad
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Desea eliminar la unidad <strong>"{deleteTarget?.name}"</strong>? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
