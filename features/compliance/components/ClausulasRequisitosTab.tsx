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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { complianceService, type ClausulaRequisitoDto, type MarcoNormativoDto } from "../services/compliance.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, ListChecks, Pencil, Trash2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface ClausulaForm {
  marcoNormativoId: string;
  numeroClausula: string;
  titulo: string;
  tipoRequisito: string;
  esAuditable: boolean;
  clausulaPadreId: string;
  descripcion: string;
}

export function ClausulasRequisitosTab() {
  const [clausulas, setClausulas] = useState<ClausulaRequisitoDto[]>([]);
  const [marcos, setMarcos] = useState<MarcoNormativoDto[]>([]);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(true);
  const [filterMarco, setFilterMarco] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editClausula, setEditClausula] = useState<ClausulaRequisitoDto | null>(null);
  const [form, setForm] = useState<ClausulaForm>({
    marcoNormativoId: "",
    numeroClausula: "",
    titulo: "",
    tipoRequisito: "",
    esAuditable: true,
    clausulaPadreId: "",
    descripcion: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClausulaRequisitoDto | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [clausulasList, marcosList] = await Promise.all([
      complianceService.getAllClausulasRequisitos(true),
      complianceService.getAllMarcosNormativos(true),
    ]);
    setClausulas(clausulasList);
    setMarcos(marcosList);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdd = () => {
    setEditClausula(null);
    setForm({
      marcoNormativoId: filterMarco !== "all" ? filterMarco : "",
      numeroClausula: "",
      titulo: "",
      tipoRequisito: "",
      esAuditable: true,
      clausulaPadreId: "",
      descripcion: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (c: ClausulaRequisitoDto) => {
    setEditClausula(c);
    setForm({
      marcoNormativoId: c.marcoNormativoId,
      numeroClausula: c.numeroClausula,
      titulo: c.titulo,
      tipoRequisito: c.tipoRequisito,
      esAuditable: c.esAuditable,
      clausulaPadreId: c.clausulaPadreId ?? "",
      descripcion: c.descripcion ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.titulo.trim()) {
      toast.error("Título requerido");
      return;
    }
    if (!form.numeroClausula.trim()) {
      toast.error("Número de cláusula requerido");
      return;
    }
    if (!form.tipoRequisito.trim()) {
      toast.error("Tipo de requisito requerido");
      return;
    }
    if (!form.marcoNormativoId) {
      toast.error("Marco normativo requerido");
      return;
    }
    setSaving(true);
    if (editClausula) {
      const success = await complianceService.updateClausulaRequisitoById(editClausula.id, {
        titulo: form.titulo,
        tipoRequisito: form.tipoRequisito,
        esAuditable: form.esAuditable,
        clausulaPadreId: form.clausulaPadreId || null,
        descripcion: form.descripcion || null,
      });
      if (success) {
        setDialogOpen(false);
        fetchData();
      }
    } else {
      const created = await complianceService.createClausulaRequisito({
        marcoNormativoId: form.marcoNormativoId,
        numeroClausula: form.numeroClausula,
        titulo: form.titulo,
        tipoRequisito: form.tipoRequisito,
        esAuditable: form.esAuditable,
        clausulaPadreId: form.clausulaPadreId || null,
        descripcion: form.descripcion || null,
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
    const success = await complianceService.deleteClausulaRequisito(deleteTarget.id);
    if (success) {
      setDeleteTarget(null);
      fetchData();
    }
  };

  const getMarcoNombre = (id: string) => {
    return marcos.find((m) => m.id === id)?.nombre || "Desconocido";
  };

  const filtered = clausulas
    .filter((c) => showInactive || (c.isActive !== false))
    .filter((c) => filterMarco === "all" || c.marcoNormativoId === filterMarco)
    .filter(
      (c) =>
        c.titulo.toLowerCase().includes(search.toLowerCase()) ||
        c.numeroClausula.toLowerCase().includes(search.toLowerCase()) ||
        c.tipoRequisito.toLowerCase().includes(search.toLowerCase())
    );

  const clausulasPadres = clausulas.filter(
    (c) => c.marcoNormativoId === form.marcoNormativoId && c.id !== editClausula?.id
  );

  if (loading) {
    return (
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Skeleton className="h-10 flex-1 max-w-sm" />
          <Skeleton className="h-10 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:flex-wrap">
        <div className="relative w-full sm:flex-1 sm:min-w-0 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por título, número o tipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <Select value={filterMarco} onValueChange={setFilterMarco}>
          <SelectTrigger className="w-full sm:w-48 min-w-0">
            <SelectValue placeholder="Filtrar por marco" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los marcos</SelectItem>
            {marcos.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 shrink-0">
          <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
          <Label htmlFor="show-inactive" className="text-sm text-muted-foreground whitespace-nowrap">
            Incluir inactivos
          </Label>
        </div>
        <Button size="sm" onClick={openAdd} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-1 shrink-0" /> Nueva cláusula
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ListChecks className="mx-auto mb-2 h-8 w-8 opacity-40" />
            <p>No hay cláusulas/requisitos registrados.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
          {filtered.map((c) => (
            <Card
              key={c.id}
              className={cn("relative overflow-hidden min-w-0", c.isActive === false && "opacity-60")}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <ListChecks className="h-4 w-4 text-primary shrink-0" />
                    <h3 className="font-semibold text-sm truncate">{c.titulo}</h3>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {c.isActive === false && (
                      <Badge variant="secondary" className="text-[10px]">
                        INACTIVO
                      </Badge>
                    )}
                    {c.esAuditable && (
                      <Badge variant="default" className="text-[10px]">
                        AUDITABLE
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono text-muted-foreground">Cláusula: {c.numeroClausula}</p>
                  <p className="text-xs text-muted-foreground">Tipo: {c.tipoRequisito}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    <span className="truncate">{getMarcoNombre(c.marcoNormativoId)}</span>
                  </div>
                </div>
                {c.descripcion && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{c.descripcion}</p>
                )}
                <div className="flex gap-1 pt-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => setDeleteTarget(c)}
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
        <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-y-auto sm:max-h-[85vh] rounded-lg">
          <DialogHeader>
            <DialogTitle>{editClausula ? "Editar cláusula/requisito" : "Nueva cláusula/requisito"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Marco Normativo *</Label>
              <Select
                value={form.marcoNormativoId}
                onValueChange={(value) => setForm({ ...form, marcoNormativoId: value, clausulaPadreId: "" })}
                disabled={!!editClausula}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar marco normativo" />
                </SelectTrigger>
                <SelectContent>
                  {marcos.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!editClausula && (
              <div className="space-y-2">
                <Label>Número de Cláusula *</Label>
                <Input
                  value={form.numeroClausula}
                  onChange={(e) => setForm({ ...form, numeroClausula: e.target.value })}
                  placeholder="Ej: 4.1, 5.2.1"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Título de la cláusula/requisito"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Requisito *</Label>
              <Input
                value={form.tipoRequisito}
                onChange={(e) => setForm({ ...form, tipoRequisito: e.target.value })}
                placeholder="Ej: Requisito, Cláusula, Subcláusula"
              />
            </div>
            {form.marcoNormativoId && clausulasPadres.length > 0 && (
              <div className="space-y-2">
                <Label>Cláusula Padre (opcional)</Label>
                <Select
                  value={form.clausulaPadreId}
                  onValueChange={(value) => setForm({ ...form, clausulaPadreId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ninguna (cláusula raíz)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Ninguna (cláusula raíz)</SelectItem>
                    {clausulasPadres.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.numeroClausula} - {c.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="esAuditable"
                  checked={form.esAuditable}
                  onCheckedChange={(checked) => setForm({ ...form, esAuditable: checked })}
                />
                <Label htmlFor="esAuditable" className="text-sm">
                  Es auditable
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Descripción de la cláusula/requisito..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cláusula/requisito?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la cláusula/requisito "{deleteTarget?.titulo}". Esta acción no se puede deshacer.
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
