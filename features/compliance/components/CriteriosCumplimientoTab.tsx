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
import { complianceService, type CriterioCumplimientoDto, type ClausulaRequisitoDto } from "../services/compliance.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, CheckSquare2, Pencil, Trash2, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface CriterioForm {
  clausulaRequisitoId: string;
  codigo: string;
  descripcion: string;
  tipoEvidencia: string;
  frecuenciaVerificacion: string;
  pesoPonderacion: number;
}

export function CriteriosCumplimientoTab() {
  const [criterios, setCriterios] = useState<CriterioCumplimientoDto[]>([]);
  const [clausulas, setClausulas] = useState<ClausulaRequisitoDto[]>([]);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(true);
  const [filterClausula, setFilterClausula] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCriterio, setEditCriterio] = useState<CriterioCumplimientoDto | null>(null);
  const [form, setForm] = useState<CriterioForm>({
    clausulaRequisitoId: "",
    codigo: "",
    descripcion: "",
    tipoEvidencia: "",
    frecuenciaVerificacion: "",
    pesoPonderacion: 1,
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CriterioCumplimientoDto | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [criteriosList, clausulasList] = await Promise.all([
      complianceService.getAllCriteriosCumplimiento(true),
      complianceService.getAllClausulasRequisitos(true),
    ]);
    setCriterios(criteriosList);
    setClausulas(clausulasList);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdd = () => {
    setEditCriterio(null);
    setForm({
      clausulaRequisitoId: filterClausula !== "all" ? filterClausula : "",
      codigo: "",
      descripcion: "",
      tipoEvidencia: "",
      frecuenciaVerificacion: "",
      pesoPonderacion: 1,
    });
    setDialogOpen(true);
  };

  const openEdit = (c: CriterioCumplimientoDto) => {
    setEditCriterio(c);
    setForm({
      clausulaRequisitoId: c.clausulaRequisitoId,
      codigo: c.codigo,
      descripcion: c.descripcion,
      tipoEvidencia: c.tipoEvidencia,
      frecuenciaVerificacion: c.frecuenciaVerificacion,
      pesoPonderacion: c.pesoPonderacion,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.descripcion.trim()) {
      toast.error("Descripción requerida");
      return;
    }
    if (!form.codigo.trim() && !editCriterio) {
      toast.error("Código requerido");
      return;
    }
    if (!form.tipoEvidencia.trim()) {
      toast.error("Tipo de evidencia requerido");
      return;
    }
    if (!form.frecuenciaVerificacion.trim()) {
      toast.error("Frecuencia de verificación requerida");
      return;
    }
    if (!form.clausulaRequisitoId) {
      toast.error("Cláusula/requisito requerido");
      return;
    }
    setSaving(true);
    if (editCriterio) {
      const success = await complianceService.updateCriterioCumplimientoById(editCriterio.id, {
        descripcion: form.descripcion,
        tipoEvidencia: form.tipoEvidencia,
        frecuenciaVerificacion: form.frecuenciaVerificacion,
        pesoPonderacion: form.pesoPonderacion,
      });
      if (success) {
        setDialogOpen(false);
        fetchData();
      }
    } else {
      const created = await complianceService.createCriterioCumplimiento({
        clausulaRequisitoId: form.clausulaRequisitoId,
        codigo: form.codigo,
        descripcion: form.descripcion,
        tipoEvidencia: form.tipoEvidencia,
        frecuenciaVerificacion: form.frecuenciaVerificacion,
        pesoPonderacion: form.pesoPonderacion,
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
    const success = await complianceService.deleteCriterioCumplimiento(deleteTarget.id);
    if (success) {
      setDeleteTarget(null);
      fetchData();
    }
  };

  const getClausulaTitulo = (id: string) => {
    const clausula = clausulas.find((c) => c.id === id);
    return clausula ? `${clausula.numeroClausula} - ${clausula.titulo}` : "Desconocido";
  };

  const filtered = criterios
    .filter((c) => showInactive || (c.isActive !== false))
    .filter((c) => filterClausula === "all" || c.clausulaRequisitoId === filterClausula)
    .filter(
      (c) =>
        c.descripcion.toLowerCase().includes(search.toLowerCase()) ||
        c.codigo.toLowerCase().includes(search.toLowerCase()) ||
        c.tipoEvidencia.toLowerCase().includes(search.toLowerCase())
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
          <Skeleton className="h-9 w-48" />
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
            placeholder="Buscar por descripción, código o tipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <Select value={filterClausula} onValueChange={setFilterClausula}>
          <SelectTrigger className="w-full sm:w-64 min-w-0">
            <SelectValue placeholder="Filtrar por cláusula" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las cláusulas</SelectItem>
            {clausulas.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.numeroClausula} - {c.titulo}
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
          <Plus className="h-4 w-4 mr-1 shrink-0" /> Nuevo criterio
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <CheckSquare2 className="mx-auto mb-2 h-8 w-8 opacity-40" />
            <p>No hay criterios de cumplimiento registrados.</p>
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
                    <CheckSquare2 className="h-4 w-4 text-primary shrink-0" />
                    <h3 className="font-semibold text-sm truncate">{c.descripcion}</h3>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {c.isActive === false && (
                      <Badge variant="secondary" className="text-[10px]">
                        INACTIVO
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono text-muted-foreground">Código: {c.codigo}</p>
                  <p className="text-xs text-muted-foreground">Tipo evidencia: {c.tipoEvidencia}</p>
                  <p className="text-xs text-muted-foreground">Frecuencia: {c.frecuenciaVerificacion}</p>
                  <p className="text-xs text-muted-foreground">Peso: {c.pesoPonderacion}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ListChecks className="h-3 w-3" />
                    <span className="truncate">{getClausulaTitulo(c.clausulaRequisitoId)}</span>
                  </div>
                </div>
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
        <DialogContent className="w-[calc(100%-2rem)] max-w-md max-h-[90vh] overflow-y-auto sm:max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{editCriterio ? "Editar criterio de cumplimiento" : "Nuevo criterio de cumplimiento"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cláusula/Requisito *</Label>
              <Select
                value={form.clausulaRequisitoId}
                onValueChange={(value) => setForm({ ...form, clausulaRequisitoId: value })}
                disabled={!!editCriterio}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cláusula/requisito" />
                </SelectTrigger>
                <SelectContent>
                  {clausulas.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.numeroClausula} - {c.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!editCriterio && (
              <div className="space-y-2">
                <Label>Código *</Label>
                <Input
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                  placeholder="Ej: CRIT-001"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Descripción *</Label>
              <Input
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Descripción del criterio de cumplimiento"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Evidencia *</Label>
              <Input
                value={form.tipoEvidencia}
                onChange={(e) => setForm({ ...form, tipoEvidencia: e.target.value })}
                placeholder="Ej: Documental, Física, Testimonial"
              />
            </div>
            <div className="space-y-2">
              <Label>Frecuencia de Verificación *</Label>
              <Input
                value={form.frecuenciaVerificacion}
                onChange={(e) => setForm({ ...form, frecuenciaVerificacion: e.target.value })}
                placeholder="Ej: Mensual, Trimestral, Anual"
              />
            </div>
            <div className="space-y-2">
              <Label>Peso de Ponderación *</Label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={form.pesoPonderacion}
                onChange={(e) => setForm({ ...form, pesoPonderacion: parseFloat(e.target.value) || 0 })}
                placeholder="Ej: 1.0, 1.5, 2.0"
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
            <AlertDialogTitle>¿Eliminar criterio de cumplimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el criterio de cumplimiento "{deleteTarget?.descripcion}". Esta acción no se puede deshacer.
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
