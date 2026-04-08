"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Link } from "lucide-react";
import type { MipgPolicyDto } from "../../api/mipg-politicas";
import { useMipgGuidelinesQuery, useMipgGuidelineCreateMutation } from "../../hooks/use-mipg-query";
import { MipgGuidelineAddDialog } from "./MipgGuidelineAddDialog";
import { MipgGuidelineAlignmentDialog } from "./MipgGuidelineAlignmentDialog";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: MipgPolicyDto | null;
}

export function MipgPolicyDetailSheet({
  open,
  onOpenChange,
  policy,
}: Props) {
  const { data: guidelines = [], isLoading } = useMipgGuidelinesQuery(policy?.id);
  const { mutateAsync: createGuideline, isPending: isCreating } = useMipgGuidelineCreateMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGuidelineForAlignment, setSelectedGuidelineForAlignment] = useState<{id: string, description: string} | null>(null);

  if (!policy) return null;

  const handleCreateGuideline = async (data: {
    code: string;
    description: string;
    guidelineType: string;
  }) => {
    try {
      await createGuideline({
        policyId: policy.id,
        ...data
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating guideline", error);
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "Mandatory": return "destructive"; // Rojo para obligatorio
      case "Gradual": return "default";       // Azul/Negro para gradual
      case "Differential": return "secondary"; // Gris para diferencial
      default: return "outline";
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "Mandatory": return "Obligatorio";
      case "Gradual": return "Gradual";
      case "Differential": return "Diferencial";
      default: return type;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-3/4 flex flex-col gap-4 p-6">
        <SheetHeader className="space-y-2 text-center sm:text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Política {policy.number}
          </p>
          <SheetTitle className="text-lg leading-tight font-semibold text-foreground">
            {policy.name}
          </SheetTitle>
          <SheetDescription>
            {policy.description && <span className="block mb-2 italic">{policy.description}</span>}
            Entidad Rectora: {policy.rectorEntity}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-5 py-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase text-muted-foreground">
              Lineamientos ({guidelines.length})
            </h4>
            <Button size="sm" variant="ghost" onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Nuevo
            </Button>
          </div>

          {isLoading ? (
             <div className="space-y-3">
               <Skeleton className="h-16 w-full" />
               <Skeleton className="h-16 w-full" />
             </div>
          ) : guidelines.length === 0 ? (
            <div className="text-center py-8 border rounded-lg border-dashed text-muted-foreground text-sm">
              No hay lineamientos registrados.
            </div>
          ) : (
            <div className="space-y-3">
              {guidelines.map((g) => (
                <div key={g.id} className="p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-muted px-1.5 py-0.5 rounded">
                          {g.code}
                        </span>
                        <Badge variant={getBadgeVariant(g.guidelineType) as any} className="text-[10px] h-5 px-1.5">
                          {getTypeName(g.guidelineType)}
                        </Badge>
                      </div>
                      <p className="text-sm leading-snug">{g.description}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                      onClick={() => setSelectedGuidelineForAlignment({ id: g.id, description: g.description })}
                      title="Alinear con requisitos"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>

        <MipgGuidelineAddDialog 
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleCreateGuideline}
          saving={isCreating}
        />
        
        <MipgGuidelineAlignmentDialog
          open={!!selectedGuidelineForAlignment}
          onOpenChange={(open) => !open && setSelectedGuidelineForAlignment(null)}
          guidelineId={selectedGuidelineForAlignment?.id ?? ""}
          guidelineDescription={selectedGuidelineForAlignment?.description ?? ""}
        />
      </SheetContent>
    </Sheet>
  );
}
