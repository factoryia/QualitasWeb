import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Process,
  ProcessType,
  useProcedures,
  useProcessRequirements,
  useDeleteProcedure,
  useSaveProcess,
  useOrgMembers,
  Procedure,
} from "@/features/operation/static/MOCKS";
import { ProcessStatusBadge } from "./ProcessStatusBadge";
import { Plus, Pencil, Trash2, FileText, Link, FolderOpen, Save } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  process: Process | null;
  processTypes: ProcessType[];
}

export function ProcessDetailSheet({ open, onOpenChange, process, processTypes }: Props) {
  // Queries de datos relacionados (Mocked)
  const { data: procedures = [] } = useProcedures(process?.id ?? null);
  const { data: requirements = [] } = useProcessRequirements(process?.id ?? null);
  const { data: members = [] } = useOrgMembers();
  
  // Mutaciones
  const deleteProcedure = useDeleteProcedure();
  const saveProcess = useSaveProcess();

  // Estados locales para edición inline
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [typeId, setTypeId] = useState("");
  const [objective, setObjective] = useState("");
  const [scope, setScope] = useState("");
  const [leaderId, setLeaderId] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Sincronizar estados cuando el proceso cambia
  useEffect(() => {
    if (process && open) {
      setCode(process.code);
      setName(process.name);
      setTypeId(process.process_type_id);
      setObjective(process.objective ?? "");
      setScope(process.scope ?? "");
      setLeaderId(process.leader_id ?? "");
      setIsActive(process.is_active);
    }
  }, [process, open]);

  if (!process) return null;

  const handleSave = () => {
    saveProcess.mutate({
      id: process.id,
      code,
      name,
      process_type_id: typeId,
      objective: objective || null,
      scope: scope || null,
      leader_id: leaderId || null,
      is_active: isActive,
    });
  };

  // Verificar si hay cambios sin guardar
  const isDirty =
    code !== process.code ||
    name !== process.name ||
    typeId !== process.process_type_id ||
    objective !== (process.objective ?? "") ||
    scope !== (process.scope ?? "") ||
    leaderId !== (process.leader_id ?? "") ||
    isActive !== process.is_active;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {process.code}
            </span>
            <ProcessStatusBadge status={process.status} />
          </div>
          <SheetTitle className="text-left text-xl">{process.name}</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="general" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
            <TabsTrigger value="procedures" className="text-xs">Procesos ({procedures.length})</TabsTrigger>
            <TabsTrigger value="requirements" className="text-xs">Req.</TabsTrigger>
            <TabsTrigger value="docs" className="text-xs">Docs</TabsTrigger>
          </TabsList>

          {/* TAB: Datos Generales */}
          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Código</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value)} className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tipo de Proceso</Label>
                <Select value={typeId} onValueChange={setTypeId}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {processTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-sm" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Líder responsable</Label>
              <Select value={leaderId || "__none__"} onValueChange={(v) => setLeaderId(v === "__none__" ? "" : v)}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Seleccionar líder" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin asignar</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>{m.fullName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Objetivo</Label>
              <Textarea value={objective} onChange={(e) => setObjective(e.target.value)} rows={3} className="text-sm resize-none" />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Estado de operación</p>
                <p className="text-xs text-muted-foreground">¿El proceso está activo actualmente?</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            {isDirty && (
              <Button className="w-full" size="sm" onClick={handleSave} disabled={saveProcess.isPending}>
                <Save className="h-3.5 w-3.5 mr-2" />
                {saveProcess.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            )}
          </TabsContent>

          {/* TAB: Procedimientos */}
          <TabsContent value="procedures" className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold">Listado de Procedimientos</h4>
              <Button size="sm" variant="outline" className="h-8">
                <Plus className="h-3.5 w-3.5 mr-1" /> Nuevo
              </Button>
            </div>
            
            <div className="space-y-2">
              {procedures.length === 0 ? (
                <div className="text-center py-8 border rounded-lg border-dashed">
                  <p className="text-xs text-muted-foreground">No hay procedimientos vinculados</p>
                </div>
              ) : (
                procedures.map((pr) => (
                  <div key={pr.id} className="flex items-center justify-between rounded-md border p-3 bg-card hover:bg-accent/50 transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-muted-foreground">{pr.code}</span>
                        <span className="text-xs font-medium truncate">{pr.name}</span>
                      </div>
                      {pr.version && <p className="text-[10px] text-muted-foreground">Versión: {pr.version}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7"><Pencil className="h-3 w-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteProcedure.mutate({ id: pr.id, processId: process.id })}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* TAB: Requisitos */}
          <TabsContent value="requirements" className="pt-4">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <Link className="h-4 w-4" />
              <h4 className="text-sm font-semibold">Normatividad y Cláusulas</h4>
            </div>
            <p className="text-xs text-muted-foreground italic mb-4">
              Aquí se listan las cláusulas de normas (ISO 9001, etc.) asociadas a este proceso.
            </p>
            {/* Mock de requisitos vacío por ahora */}
            <div className="text-center py-10 border rounded-lg border-dashed bg-muted/10">
              <FolderOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">Próximamente: Integración con Marco Normativo</p>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}