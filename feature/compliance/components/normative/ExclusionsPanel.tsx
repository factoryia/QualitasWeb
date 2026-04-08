"use client";

import { useState, useMemo } from "react";
import { Plus, FileX, CheckCircle2, Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ExclusionAddDialog } from "./ExclusionAddDialog";
import { useMarcosNormativosQuery } from "@/feature/compliance/hooks/use-marcos-normativos-query";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRequirementsByFramework } from "@/feature/compliance/api/marcos-normativos";
import { 
  disassociateRequirementFromFramework,
  associateRequirementToFrameworks
} from "@/feature/compliance/api/clausulas-requisitos";

export function ExclusionsPanel() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "excluded" | "active">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const queryClient = useQueryClient();

  // 1. Obtener todos los marcos
  const { data: frameworks = [], isLoading: isLoadingFrameworks } = useMarcosNormativosQuery(true);

  // 2. Obtener requisitos de todos los marcos para tener una vista global
  const { data: allRequirements = [], isLoading: isLoadingRequirements } = useQuery({
    queryKey: ["compliance", "all-framework-requirements", frameworks.map(f => f.id).join(",")],
    queryFn: async () => {
      if (frameworks.length === 0) return [];
      
      const results: any[] = [];
      // Procesar en lotes para evitar sobrecargar el servidor (429 Too Many Requests)
      const batchSize = 3;
      
      for (let i = 0; i < frameworks.length; i += batchSize) {
        const batch = frameworks.slice(i, i + batchSize);
        const batchPromises = batch.map(async (fw) => {
          try {
            const [reqsAll, reqsActive] = await Promise.all([
              getRequirementsByFramework(fw.id, true),
              getRequirementsByFramework(fw.id, false)
            ]);

            const activeIds = new Set(reqsActive.map(r => r.id));

            return reqsAll.map(r => ({
              id: `${r.id}-${fw.id}`,
              requirementId: r.id,
              clauseNumber: r.clauseNumber,
              clauseTitle: r.title,
              frameworkId: fw.id,
              frameworkName: fw.name,
              isActive: activeIds.has(r.id),
            }));
          } catch (e) {
            console.error(`Error loading requirements for framework ${fw.id}`, e);
            return [];
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      return results.flat();
    },
    enabled: frameworks.length > 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const isLoading = isLoadingFrameworks || isLoadingRequirements;

  // Filtrado
  const filteredItems = useMemo(() => {
    return allRequirements.filter(item => {
      if (filter === "all") return true;
      if (filter === "excluded") return !item.isActive;
      if (filter === "active") return item.isActive;
      return true;
    });
  }, [allRequirements, filter]);

  // Paginación
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Mutación para gestionar estado (excluir o activar)
  const manageStatusMutation = useMutation({
    mutationFn: async (data: {
      frameworkId: string;
      clauseId: string;
      justification: string;
      status: "Aplica" | "No aplica";
    }) => {
      if (data.status === "No aplica") {
        return await disassociateRequirementFromFramework(
          data.clauseId,
          data.frameworkId,
          {
            deactivationReason: data.justification,
            deactivatedBy: "Usuario Actual", // TODO: Obtener del contexto de auth
            approvedBy: null
          }
        );
      } else {
        // Para "Aplica", usamos el endpoint de asociar (que reactiva si ya existe)
        return await associateRequirementToFrameworks(
          data.clauseId,
          {
             regulatoryFrameworkIds: [data.frameworkId]
          }
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance", "all-framework-requirements"] });
      queryClient.invalidateQueries({ queryKey: ["compliance", "marcos-normativos"] });
      setIsDialogOpen(false);
    }
  });

  const handleManageStatus = async (data: any) => {
    await manageStatusMutation.mutateAsync({
      frameworkId: data.frameworkId,
      clauseId: data.clauseId,
      justification: data.justification,
      status: data.status
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold">
              Declaración de Aplicabilidad
            </h3>
            <p className="text-sm text-muted-foreground">
              Gestione la aplicabilidad de los requisitos normativos.
            </p>
          </div>
          
          <div className="flex gap-2">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  {filter === "all" ? "Todos" : filter === "excluded" ? "No Aplica" : "Aplica"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar por estado</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilter("all")}>Todos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("active")}>Aplica</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("excluded")}>No Aplica</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 shrink-0"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4" /> Gestionar Aplicabilidad
            </Button>
          </div>
        </div>

        {isLoading ? (
           <div className="flex justify-center p-8">
             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
           </div>
        ) : filteredItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No se encontraron registros.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cláusula / Requisito</TableHead>
                  <TableHead>Marco</TableHead>
                  <TableHead>Justificación</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((item) => (
                  <TableRow key={item.id} className={!item.isActive ? "bg-muted/30" : ""}>
                    <TableCell>
                      <span className="font-bold font-mono text-xs block">
                        {item.clauseNumber}
                      </span>
                      <div className="text-xs text-muted-foreground truncate max-w-[300px]" title={item.clauseTitle}>
                        {item.clauseTitle}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[11px]">
                        {item.frameworkName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[300px]">
                       {!item.isActive ? (
                        <span className="text-muted-foreground italic">
                           Ver justificación en auditoría
                        </span>
                      ) : (
                        <span className="italic text-green-600/70">
                          Aplica para toda la organización.
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {!item.isActive ? (
                        <Badge
                          variant="secondary"
                          className="gap-1 text-[11px] bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                        >
                          <FileX className="h-3 w-3" /> NO APLICA
                        </Badge>
                      ) : (
                        <Badge className="gap-1 text-[11px] bg-green-50 text-green-600 border-green-200 hover:bg-green-100">
                          <CheckCircle2 className="h-3 w-3" /> APLICA
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
            
            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm flex items-center">
                  Página {currentPage} de {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}
          </div>
        )}

        <ExclusionAddDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleManageStatus}
          saving={manageStatusMutation.isPending}
        />
      </CardContent>
    </Card>
  );
}
