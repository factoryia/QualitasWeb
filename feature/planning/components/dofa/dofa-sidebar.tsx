"use client";

import { AlertTriangle, LayoutGrid, Settings2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PerspectiveTab } from "./dofa-types";

type Props = {
  perspectives: PerspectiveTab[];
  activePerspective: string | null;
  view: "perspective" | "matrix";
  countFor: (key: string) => number;
  readOnly: boolean;
  onSelectPerspective: (key: string) => void;
  onViewMatrix: () => void;
  onOpenManager: () => void;
};

export function DofaSidebar({
  perspectives,
  activePerspective,
  view,
  countFor,
  readOnly,
  onSelectPerspective,
  onViewMatrix,
  onOpenManager,
}: Props) {
  return (
    <aside className="w-full md:w-[240px] md:shrink-0 md:self-start border rounded-lg bg-card flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Perspectivas BSC
        </h3>
        {!readOnly && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={onOpenManager}
            title="Gestionar perspectivas"
          >
            <Settings2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-2 space-y-1 max-h-[40vh] md:max-h-none">
        {perspectives.map((p) => {
          const count = countFor(p.key);
          const isActive = view === "perspective" && p.key === activePerspective;
          const badgeClass =
            count === 0
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
              : count >= 4
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : "bg-muted text-muted-foreground";
          return (
            <button
              key={p.key}
              onClick={() => onSelectPerspective(p.key)}
              type="button"
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors border-l-[3px]",
                isActive
                  ? "bg-primary/10 border-l-primary text-foreground font-medium"
                  : "border-l-transparent hover:bg-muted/60 text-foreground",
              )}
            >
              <span className="flex-1 truncate">{p.label}</span>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums shrink-0",
                  badgeClass,
                )}
              >
                {count === 0 && <AlertTriangle className="h-2.5 w-2.5" />}
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="p-2 border-t space-y-1.5">
        <Button variant="outline" size="sm" className="w-full" onClick={onViewMatrix}>
          <LayoutGrid className="h-4 w-4 mr-1.5" />
          Ver Matriz
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full opacity-50 cursor-not-allowed"
          disabled
          title="Próximamente disponible"
        >
          <Sparkles className="h-4 w-4 mr-1.5" />
          Clasificar con IA
        </Button>
      </div>
    </aside>
  );
}
