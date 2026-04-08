"use client";

import { useState } from "react";
import { Plus, Download, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  useMipgDimensionsQuery, 
  useMipgPolicyCreateMutation,
  useMipgPoliciesQuery 
} from "../../hooks/use-mipg-query";
import { Skeleton } from "@/components/ui/skeleton";
import { MipgPolicyAddDialog } from "./MipgPolicyAddDialog";
import { MipgPolicyDetailSheet } from "./MipgPolicyDetailSheet";
import { MipgPreloadDialog } from "./MipgPreloadDialog";
import type { MipgPolicyDto } from "../../api/mipg-politicas";

export function MipgPanel() {
  const { data: dimensions = [], isLoading } = useMipgDimensionsQuery();
  const { data: allPolicies = [] } = useMipgPoliciesQuery();
  const { mutateAsync: createPolicy, isPending: isCreating } = useMipgPolicyCreateMutation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreloadDialogOpen, setIsPreloadDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<MipgPolicyDto | null>(null);

  const handleCreatePolicy = async (data: {
    dimensionId: string;
    number: number;
    name: string;
    description: string;
    rectorEntity: string;
  }) => {
    try {
      await createPolicy(data);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating policy", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-muted-foreground max-w-xl">
          El Modelo Integrado de Planeación y Gestión agrupa las políticas en
          dimensiones. Úselo para preparar el autodiagnóstico y FURAG.
        </p>
        <Button 
          className="gap-1.5 shrink-0"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="h-4 w-4" /> Nueva Política
        </Button>
      </div>

      <div className="flex flex-col gap-5">
        {dimensions.length === 0 ? (
           <div className="text-center py-10 text-muted-foreground">
             <p>No hay dimensiones registradas.</p>
           </div>
        ) : (
          dimensions.map((dim) => {
            // Usamos el colorHex si viene, sino un fallback
            const colorStyle = dim.colorHex ? { backgroundColor: dim.colorHex + "20", color: dim.colorHex, borderColor: dim.colorHex + "40" } : {};
            const circleStyle = dim.colorHex ? { backgroundColor: dim.colorHex } : {};
            
            const policies = allPolicies.filter((p) => p.dimensionId === dim.id);

            return (
              <Card key={dim.id} className="overflow-hidden p-0">
                <div
                  className="px-5 py-4 border-b flex items-center gap-4"
                  style={colorStyle}
                >
                  <div
                    className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold text-sm shrink-0"
                    style={circleStyle}
                  >
                    D{dim.number}
                  </div>
                  <div>
                    <h4 className="text-base font-bold" style={{ color: dim.colorHex }}>
                      {dim.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {dim.isTransversal ? "Transversal" : "Específica"}
                    </p>
                  </div>
                </div>
                <div className="p-5">
                  {policies.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      Sin políticas registradas en esta dimensión.
                    </p>
                  ) : (
                    <div className="grid gap-3">
                      {policies.map((policy) => (
                        <div
                          key={policy.id}
                          className="border rounded-md p-3 flex items-start gap-3 bg-card hover:bg-accent/5 transition-colors cursor-pointer"
                          onClick={() => setSelectedPolicy(policy)}
                        >
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 border">
                            <span className="font-medium text-xs text-muted-foreground">
                              {policy.number}
                            </span>
                          </div>
                          <div>
                            <h5 className="font-medium text-sm">{policy.name}</h5>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Entidad Rectora: {policy.rectorEntity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      <div className="flex justify-center">
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => setIsPreloadDialogOpen(true)}
        >
          <Download className="h-4 w-4" />
          Precargar 7 dimensiones MIPG
        </Button>
      </div>

      <MipgPolicyAddDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        dimensions={dimensions}
        onSubmit={handleCreatePolicy}
        saving={isCreating}
      />

      <MipgPreloadDialog
        open={isPreloadDialogOpen}
        onOpenChange={setIsPreloadDialogOpen}
        existingDimensions={dimensions}
      />

      <MipgPolicyDetailSheet
        open={!!selectedPolicy}
        onOpenChange={(open) => !open && setSelectedPolicy(null)}
        policy={selectedPolicy}
      />
    </div>
  );
}
