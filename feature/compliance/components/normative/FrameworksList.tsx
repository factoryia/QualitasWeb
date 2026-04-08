"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMarcosNormativosQuery } from "../../hooks/use-marcos-normativos-query";

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function FrameworksList({ selectedId, onSelect }: Props) {
  const { data: frameworks = [], isLoading } = useMarcosNormativosQuery(true);

  return (
    <div className="flex flex-col gap-3">
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
                "p-4 rounded-lg transition-colors border",
                selectedId === fw.id
                  ? "border-l-4 border-l-primary bg-primary/5 border-primary/20"
                  : "border-l-4 border-l-transparent border-border hover:border-primary/30"
              )}
            >
              <span className="font-bold text-sm text-foreground">
                {fw.code || fw.name}
              </span>
              <p className="text-xs text-muted-foreground mt-1">{fw.name}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
