"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DofaItemDto } from "@/feature/planning/api/dofa";
import type { DofaCategory, GroupedItems, PerspectiveTab } from "./dofa-types";
import { QUADRANTS } from "./dofa-types";
import { AddFactorInput } from "./dofa-add-factor-input";
import { ItemCard } from "./dofa-item-card";

type Props = {
  perspective: PerspectiveTab;
  grouped: GroupedItems;
  readOnly: boolean;
  onAdd: (perspKey: string, category: DofaCategory, text: string) => Promise<void>;
  onUpdate: (item: DofaItemDto, text: string) => Promise<void>;
  onDelete: (item: DofaItemDto) => void;
};

export function DofaPerspectivePanel({ perspective, grouped, readOnly, onAdd, onUpdate, onDelete }: Props) {
  return (
    <div className="p-4 sm:p-6 space-y-4">
      <header className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0 text-lg font-bold">
          {perspective.label.charAt(0)}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-foreground">Perspectiva {perspective.label}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{perspective.description}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {QUADRANTS.map((q) => {
          const list = grouped[perspective.key]?.[q.category] ?? [];
          return (
            <section
              key={q.category}
              className={cn("rounded-lg border overflow-hidden shadow-sm", q.borderClass, "bg-card")}
            >
              <header className={cn("flex items-center gap-2 px-3 py-2 border-b bg-muted/30", q.borderClass)}>
                <span className={cn("h-2 w-2 rounded-full", q.fillClass)} />
                <h3 className={cn("text-xs font-bold uppercase tracking-wide", q.textClass)}>{q.label}</h3>
                <Badge
                  variant="outline"
                  className={cn("ml-auto text-[10px] font-bold border bg-background", q.textClass, q.borderClass)}
                >
                  {list.length}
                </Badge>
              </header>
              <div className="p-2.5 space-y-1.5">
                {list.length === 0 && !readOnly && (
                  <p className="text-xs text-muted-foreground italic px-2 py-1">Sin factores aún. Agrega el primero.</p>
                )}
                {list.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onSave={(t) => onUpdate(item, t)}
                    onDelete={() => onDelete(item)}
                    readOnly={readOnly}
                  />
                ))}
                {!readOnly && (
                  <AddFactorInput
                    category={q.category}
                    onAdd={(t) => onAdd(perspective.key, q.category, t)}
                  />
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
