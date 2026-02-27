"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMarcosNormativosQuery } from "../../hooks/use-marcos-normativos-query";
import { MarcoNormativoForm } from "../MarcoNormativoForm";
import { useState } from "react";
import { useMarcoNormativoCreateMutation } from "../../hooks/use-marcos-normativos-query";

interface MarcoForm {
  code: string;
  name: string;
  type: string;
  effectiveDate: string;
  isObligatory: boolean;
  version: string;
  description: string;
}

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function FrameworksList({ selectedId, onSelect }: Props) {
  const { data: frameworks = [], isLoading } = useMarcosNormativosQuery(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const createMutation = useMarcoNormativoCreateMutation();

  const handleSave = async (formData: MarcoForm) => {
    const effectiveDateISO = new Date(formData.effectiveDate + "T00:00:00Z").toISOString();
    try {
      const created = await createMutation.mutateAsync({
        code: formData.code,
        name: formData.name,
        type: formData.type,
        effectiveDate: effectiveDateISO,
        isObligatory: formData.isObligatory,
        version: formData.version || null,
        description: formData.description || null,
      });
      if (created) setDialogOpen(false);
    } catch {
      // toast en servicio
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Button onClick={() => setDialogOpen(true)} className="w-full gap-2">
        <Plus className="h-4 w-4" /> Nuevo Marco
      </Button>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="flex flex-col gap-3 pr-2">
          {isLoading && (
            <p className="text-sm text-muted-foreground p-2">Cargando...</p>
          )}
          {!isLoading && frameworks.length === 0 && (
            <p className="text-sm text-muted-foreground p-2">
              No hay marcos registrados.
            </p>
          )}
          {frameworks.map((fw) => (
            <div
              key={fw.id}
              className={cn(
                "p-4 rounded-lg cursor-pointer transition-colors border",
                selectedId === fw.id
                  ? "border-l-4 border-l-primary bg-primary/5 border-primary/20"
                  : "border-l-4 border-l-transparent border-border hover:border-primary/30"
              )}
              onClick={() => onSelect(fw.id)}
            >
              <span className="font-bold text-sm text-foreground">
                {fw.code || fw.name}
              </span>
              <p className="text-xs text-muted-foreground mt-1">{fw.name}</p>
            </div>
          ))}
        </div>
      </ScrollArea>

      <MarcoNormativoForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSave}
        initialData={null}
        saving={createMutation.isPending}
      />
    </div>
  );
}
