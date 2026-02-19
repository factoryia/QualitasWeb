"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { organizationService, type OrganizationUnitDto } from "../services/organization.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Building2, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Props { orgId: string; }

interface UnitForm {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

export function OrgSedes({ orgId }: Props) {
  const [units, setUnits] = useState<OrganizationUnitDto[]>([]);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUnit, setEditUnit] = useState<OrganizationUnitDto | null>(null);
  const [form, setForm] = useState<UnitForm>({ name: "", code: "", description: "", isActive: true });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OrganizationUnitDto | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const list = await organizationService.getAllOrganizationUnits(true);
    setUnits(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [orgId]);

  const openAdd = () => {
    setEditUnit(null);
    setForm({ name: "", code: "", description: "", isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (u: OrganizationUnitDto) => {
    setEditUnit(u);
    setForm({
      name: u.name,
      code: u.code,
      description: u.description ?? "",
      isActive: u.isActive ?? true,
    });
    setDialogOpen(true);
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
    setSaving(true);
    if (editUnit) {
      const success = await organizationService.updateOrganizationUnitById(
        editUnit.id,
        { code: form.code, name: form.name, description: form.description || null, isActive: form.isActive }
      );
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
        parentId: null,
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

  const filtered = units
    .filter((u) => showInactive || (u.isActive !== false))
    .filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        (u.code && u.code.toLowerCase().includes(search.toLowerCase()))
    );

  if (loading) {
    return (
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Skeleton className="h-10 flex-1 max-w-sm" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex gap-1 pt-1">
                  <Skeleton className="h-7 w-7 rounded" />
                  <Skeleton className="h-7 w-7 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
          <Label htmlFor="show-inactive" className="text-sm text-muted-foreground whitespace-nowrap">
            Incluir inactivas
          </Label>
        </div>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" /> Nueva unidad
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Building2 className="mx-auto mb-2 h-8 w-8 opacity-40" />
            <p>No hay unidades organizativas para esta organización.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((u) => (
            <Card
              key={u.id}
              className={cn("relative overflow-hidden", u.isActive === false && "opacity-60")}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary shrink-0" />
                    <h3 className="font-semibold text-sm">{u.name}</h3>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {u.isActive === false && (
                      <Badge variant="secondary" className="text-[10px]">
                        INACTIVA
                      </Badge>
                    )}
                  </div>
                </div>
                {u.code && (
                  <p className="text-xs font-mono text-muted-foreground">{u.code}</p>
                )}
                {u.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{u.description}</p>
                )}
                <div className="flex gap-1 pt-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(u)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => setDeleteTarget(u)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle>{editUnit ? "Editar unidad" : "Nueva unidad organizativa"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Código *</Label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="ej. SED-001" />
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
                <Switch id="is_active" checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
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
            <AlertDialogTitle>Eliminar unidad</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Desea eliminar la unidad <strong>"{deleteTarget?.name}"</strong>? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
