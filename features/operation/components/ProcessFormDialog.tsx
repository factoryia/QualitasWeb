import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Process, ProcessType, useSaveProcess, useOrgMembers } from "@/features/operation/static/MOCKS";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  processTypes: ProcessType[];
  defaultTypeId?: string;
  process?: Process | null;
}

// Interfaz para los valores del formulario
interface FormValues {
  code: string;
  name: string;
  process_type_id: string;
  objective: string;
  scope: string;
  status: string;
  leader_id: string;
  is_active: boolean;
}

export function ProcessFormDialog({ open, onOpenChange, processTypes, defaultTypeId, process }: Props) {
  const save = useSaveProcess();
  const { data: members = [] } = useOrgMembers();
  
  // Inicialización de react-hook-form
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormValues>();

  // Sincronizar el formulario cuando se abre o cambia el proceso a editar
  useEffect(() => {
    if (open) {
      reset({
        code: process?.code ?? "",
        name: process?.name ?? "",
        process_type_id: process?.process_type_id ?? defaultTypeId ?? "",
        objective: process?.objective ?? "",
        scope: process?.scope ?? "",
        status: process?.status ?? "activo",
        leader_id: process?.leader_id ?? "",
        is_active: process?.is_active ?? true,
      });
    }
  }, [open, process, defaultTypeId, reset]);

  const onSubmit = (values: FormValues) => {
    save.mutate(
      {
        ...values,
        id: process?.id, // Si existe ID, el hook mock sabrá que es una edición
        leader_id: values.leader_id || null,
      },
      { 
        onSuccess: () => {
          onOpenChange(false);
          reset();
        } 
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{process ? "Editar Proceso" : "Nuevo Proceso"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Código *</Label>
              <Input 
                {...register("code", { required: true })} 
                placeholder="Ej: GE-01" 
              />
            </div>
            
            <div className="space-y-1.5">
              <Label>Tipo *</Label>
              <Select 
                value={watch("process_type_id")} 
                onValueChange={(v) => setValue("process_type_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent>
                  {processTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Nombre del Proceso *</Label>
            <Input 
              {...register("name", { required: true })} 
              placeholder="Nombre descriptivo" 
            />
          </div>

          <div className="space-y-1.5">
            <Label>Líder del Proceso</Label>
            <Select 
              value={watch("leader_id") || "__none__"} 
              onValueChange={(v) => setValue("leader_id", v === "__none__" ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Asignar un responsable" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Sin asignar</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.userId} value={m.userId}>
                    {m.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Objetivo</Label>
            <Textarea 
              {...register("objective")} 
              rows={2} 
              placeholder="¿Qué busca lograr este proceso?"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Alcance</Label>
            <Textarea 
              {...register("scope")} 
              rows={2} 
              placeholder="¿Dónde inicia y dónde termina?"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Proceso Activo</p>
              <p className="text-xs text-muted-foreground">
                Define si el proceso está disponible para operación
              </p>
            </div>
            <Switch 
              checked={watch("is_active")} 
              onCheckedChange={(v) => setValue("is_active", v)} 
            />
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Guardando..." : "Guardar Proceso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}