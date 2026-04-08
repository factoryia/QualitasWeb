"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useMipgAlignmentQuery, useMipgAlignmentCreateMutation, useMipgAlignmentDeleteMutation } from "../../hooks/use-mipg-query";
import { useAllClausulasQuery } from "../../hooks/use-clausulas-query";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guidelineId: string;
  guidelineDescription: string;
}

export function MipgGuidelineAlignmentDialog({
  open,
  onOpenChange,
  guidelineId,
  guidelineDescription,
}: Props) {
  const { data: alignments = [], isLoading: isLoadingAlignments } = useMipgAlignmentQuery(guidelineId);
  const { data: clauses = [], isLoading: isLoadingClauses } = useAllClausulasQuery();
  const { mutateAsync: createAlignment, isPending: isCreating } = useMipgAlignmentCreateMutation();
  const { mutateAsync: deleteAlignment, isPending: isDeleting } = useMipgAlignmentDeleteMutation();

  const [selectedClauseId, setSelectedClauseId] = useState("");
  const [coveragePercentage, setCoveragePercentage] = useState("100");
  const [relationType, setRelationType] = useState("Fulfills");
  const [integrationNotes, setIntegrationNotes] = useState("");
  const [openCombobox, setOpenCombobox] = useState(false);

  const handleAddAlignment = async () => {
    if (!selectedClauseId) return;

    try {
      await createAlignment({
        mipgGuidelineId: guidelineId,
        requirementClauseId: selectedClauseId,
        relationType,
        coveragePercentage: Number(coveragePercentage),
        integrationNotes: integrationNotes.trim() || null,
      });
      setSelectedClauseId("");
      setCoveragePercentage("100");
      setRelationType("Fulfills");
      setIntegrationNotes("");
      setOpenCombobox(false);
    } catch (error) {
      console.error("Error adding alignment", error);
    }
  };

  const handleDeleteAlignment = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta alineación?")) {
      try {
        await deleteAlignment(id);
      } catch (error) {
        console.error("Error deleting alignment", error);
      }
    }
  };

  const getClauseLabel = (id: string) => {
    const clause = clauses.find((c) => c.id === id);
    return clause ? `${clause.clauseNumber} - ${clause.title}` : id;
  };

  const getRelationTypeLabel = (type: string) => {
    switch (type) {
      case "Fulfills": return "Cumple Totalmente";
      case "Partial": return "Cumple Parcialmente";
      case "Supports": return "Soporta";
      case "Extends": return "Extiende";
      default: return type;
    }
  };

  const getRelationTypeColor = (type: string) => {
    switch (type) {
      case "Fulfills": return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      case "Partial": return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800";
      case "Supports": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
      case "Extends": return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Alineación de Lineamiento</DialogTitle>
          <DialogDescription>
            Relacione este lineamiento con requisitos de otros marcos normativos.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4 flex-1 overflow-y-auto pr-2">
          <div className="bg-muted/50 p-3 rounded-md text-sm border">
            <span className="font-semibold block mb-1 text-primary">Lineamiento:</span>
            {guidelineDescription}
          </div>

          <div className="space-y-4 border rounded-md p-4 bg-card shadow-sm">
            <h4 className="text-sm font-medium leading-none flex items-center gap-2">
              <Plus className="h-4 w-4" /> Nueva Alineación
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col space-y-1.5 sm:col-span-2">
                <Label>Requisito / Cláusula</Label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="justify-between w-full font-normal"
                    >
                      {selectedClauseId
                        ? getClauseLabel(selectedClauseId)
                        : "Seleccione un requisito..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar requisito..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron requisitos.</CommandEmpty>
                        <CommandGroup>
                          {clauses.map((clause) => (
                            <CommandItem
                              key={clause.id}
                              value={`${clause.clauseNumber} ${clause.title}`}
                              onSelect={() => {
                                setSelectedClauseId(clause.id);
                                setOpenCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedClauseId === clause.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{clause.clauseNumber}</span>
                                <span className="text-xs text-muted-foreground line-clamp-1">{clause.title}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label>Tipo de Relación</Label>
                <Select value={relationType} onValueChange={setRelationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fulfills">Cumple Totalmente</SelectItem>
                    <SelectItem value="Partial">Cumple Parcialmente</SelectItem>
                    <SelectItem value="Supports">Soporta</SelectItem>
                    <SelectItem value="Extends">Extiende</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label>Cobertura (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={coveragePercentage}
                  onChange={(e) => setCoveragePercentage(e.target.value)}
                />
              </div>

              <div className="flex flex-col space-y-1.5 sm:col-span-2">
                <Label>Notas de Integración</Label>
                <Textarea
                  value={integrationNotes}
                  onChange={(e) => setIntegrationNotes(e.target.value)}
                  placeholder="Explique cómo se cumple el requisito..."
                  className="h-20 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button 
                onClick={handleAddAlignment} 
                disabled={!selectedClauseId || isCreating}
                size="sm"
              >
                {isCreating ? "Guardando..." : "Agregar Alineación"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium leading-none">Alineaciones Existentes</h4>
            {isLoadingAlignments ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : alignments.length === 0 ? (
              <div className="text-center py-8 border rounded-lg border-dashed text-muted-foreground text-sm bg-muted/20">
                No hay alineaciones registradas para este lineamiento.
              </div>
            ) : (
              <div className="border rounded-md divide-y bg-card">
                {alignments.map((alignment) => (
                  <div
                    key={alignment.id}
                    className="p-3 flex items-center justify-between text-sm hover:bg-muted/50 transition-colors group"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">
                        {getClauseLabel(alignment.requirementClauseId)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-sm border",
                          getRelationTypeColor(alignment.relationType)
                        )}>
                          {getRelationTypeLabel(alignment.relationType)}
                        </span>
                        <span>•</span>
                        <span>Cobertura: {alignment.coveragePercentage}%</span>
                        {alignment.integrationNotes && (
                          <span className="text-muted-foreground/80 italic">
                            — {alignment.integrationNotes}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteAlignment(alignment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
