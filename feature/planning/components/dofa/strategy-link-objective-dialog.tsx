"use client";

import { useMemo, useState } from "react";
import { Link2, Search, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useObjectivesQuery,
  useLinkObjectiveToStrategyMutation,
} from "@/feature/planning/hooks/use-dofa";

interface StrategyLinkObjectiveDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  strategyId: string;
  excludeIds: Set<string>;
}

export function StrategyLinkObjectiveDialog({
  open,
  onOpenChange,
  strategyId,
  excludeIds,
}: StrategyLinkObjectiveDialogProps) {
  const { data: allObjectives = [] } = useObjectivesQuery();
  const linkMutation = useLinkObjectiveToStrategyMutation();
  const [search, setSearch] = useState("");

  const available = useMemo(
    () =>
      allObjectives.filter((o) => {
        if (excludeIds.has(o.id)) return false;
        if (!search.trim()) return true;
        return o.name.toLowerCase().includes(search.toLowerCase());
      }),
    [allObjectives, excludeIds, search],
  );

  const handlePick = async (objectiveId: string) => {
    await linkMutation.mutateAsync({
      strategyId,
      objectiveId,
      payload: { objectiveId, description: null },
    });
    onOpenChange(false);
    setSearch("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setSearch("");
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Link2 className="h-4 w-4 text-primary" />
            Vincular objetivo existente
          </DialogTitle>
          <DialogDescription>
            Selecciona un objetivo del catálogo para vincularlo a esta estrategia.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Buscar objetivo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
        <ScrollArea className="max-h-60 -mx-1 px-1">
          {available.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No hay objetivos disponibles para vincular.
            </p>
          ) : (
            <ul className="space-y-1">
              {available.map((o) => (
                <li key={o.id}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 h-auto py-2 font-normal text-left"
                    onClick={() => handlePick(o.id)}
                    disabled={linkMutation.isPending}
                  >
                    <Target className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="flex-1 leading-snug text-sm text-foreground">{o.name}</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
