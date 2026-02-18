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
import { complianceService, type MarcoNormativoDto } from "../services/compliance.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, FileText, Pencil, Trash2, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

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
  const [marcos, setMarcos] = useState<MarcoNormativoDto[]>([]);
  const [search, setSearch] = useState("");
  const [showInactive, setShowInactive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMarco, setEditMarco] = useState<MarcoNormativoDto | null>(null);
  const [form, setForm] = useState<MarcoForm>({
    codigo: "",
    nombre: "",
    tipo: "",
    fechaVigencia: "",
    esObligatorio: true,
    version: "",
    descripcion: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MarcoNormativoDto | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const list = await complianceService.getAllMarcosNormativos(true);
    setMarcos(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAdd = () => {
    setEditMarco(null);
    setForm({
      codigo: "",
      nombre: "",
      tipo: "",
      fechaVigencia: "",
      esObligatorio: true,
      version: "",
      descripcion: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (m: MarcoNormativoDto) => {
    setEditMarco(m);
    setForm({
      codigo: m.codigo,
      nombre: m.nombre,
      tipo: m.tipo,
      fechaVigencia: m.fechaVigencia.split("T")[0],
      esObligatorio: m.esObligatorio,
      version: m.version ?? "",
      descripcion: m.descripcion ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) {
      toast.error("Nombre requerido");
      return;
    }
    if (!form.codigo.trim()) {
      toast.error("Código requerido");
      return;
    }
    if (!form.tipo.trim()) {
      toast.error("Tipo requerido");
      return;
    }
    if (!form.fechaVigencia) {
      toast.error("Fecha de vigencia requerida");
      return;
    }
    setSaving(true);
    if (editMarco) {
      const fechaVigenciaISO = new Date(form.fechaVigencia + "T00:00:00Z").toISOString();
      const success = await complianceService.updateMarcoNormativoById(editMarco.id, {
        nombre: form.nombre,
        tipo: form.tipo,
        fechaVigencia: fechaVigenciaISO,
        esObligatorio: form.esObligatorio,
        version: form.version || null,
        descripcion: form.descripcion || null,
      });
      if (success) {
        setDialogOpen(false);
        fetchData();
      }
    } else {
      const fechaVigenciaISO = new Date(form.fechaVigencia + "T00:00:00Z").toISOString();
      const created = await complianceService.createMarcoNormativo({
        codigo: form.codigo,
        nombre: form.nombre,
        tipo: form.tipo,
        fechaVigencia: fechaVigenciaISO,
        esObligatorio: form.esObligatorio,
        version: form.version || null,
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
    const success = await complianceService.deleteMarcoNormativo(deleteTarget.id);
    if (success) {
      setDeleteTarget(null);
      fetchData();
    }
  };

  const filtered = marcos
    .filter((m) => showInactive || (m.isActive !== false))
    .filter(
      (m) =>
        m.nombre.toLowerCase().includes(search.toLowerCase()) ||
        (m.codigo && m.codigo.toLowerCase().includes(search.toLowerCase())) ||
        (m.tipo && m.tipo.toLowerCase().includes(search.toLowerCase()))
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
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
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
    <div className="space-y-4 pt-4 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:flex-wrap">
        <div className="relative w-full sm:flex-1 sm:min-w-0 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por nombre, código o tipo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
          <Label htmlFor="show-inactive" className="text-sm text-muted-foreground whitespace-nowrap">
            Incluir inactivos
          </Label>
        </div>
        <Button size="sm" onClick={openAdd} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-1 shrink-0" /> Nuevo marco
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="mx-auto mb-2 h-8 w-8 opacity-40" />
            <p>No hay marcos normativos registrados.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
          {filtered.map((m) => (
            <Card
              key={m.id}
              className={cn("relative overflow-hidden", m.isActive === false && "opacity-60")}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <h3 className="font-semibold text-sm truncate">{m.nombre}</h3>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {m.isActive === false && (
                      <Badge variant="secondary" className="text-[10px]">
                        INACTIVO
                      </Badge>
                    )}
                    {m.esObligatorio ? (
                      <Badge variant="default" className="text-[10px]">
                        OBLIGATORIO
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        OPCIONAL
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono text-muted-foreground">{m.codigo}</p>
                  <p className="text-xs text-muted-foreground">Tipo: {m.tipo}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Vigencia: {new Date(m.fechaVigencia).toLocaleDateString("es-ES")}</span>
                  </div>
                  {m.version && (
                    <p className="text-xs text-muted-foreground">Versión: {m.version}</p>
                  )}
                </div>
                {m.descripcion && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{m.descripcion}</p>
                )}
                <div className="flex gap-1 pt-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(m)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => setDeleteTarget(m)}
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
            <DialogTitle>{editMarco ? "Editar marco normativo" : "Nuevo marco normativo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!editMarco && (
              <div className="space-y-2">
                <Label>Código *</Label>
                <Input
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                  placeholder="Ej: ISO-9001"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: ISO 9001:2015"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Input
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                placeholder="Ej: Norma Internacional"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de Vigencia *</Label>
                <Input
                  type="date"
                  value={form.fechaVigencia}
                  onChange={(e) => setForm({ ...form, fechaVigencia: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Versión</Label>
                <Input
                  value={form.version}
                  onChange={(e) => setForm({ ...form, version: e.target.value })}
                  placeholder="Ej: 1.0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="esObligatorio"
                  checked={form.esObligatorio}
                  onCheckedChange={(checked) => setForm({ ...form, esObligatorio: checked })}
                />
                <Label htmlFor="esObligatorio" className="text-sm">
                  Es obligatorio
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Descripción del marco normativo..."
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
            <AlertDialogTitle>¿Eliminar marco normativo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el marco normativo "{deleteTarget?.nombre}". Esta acción no se puede deshacer.
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
