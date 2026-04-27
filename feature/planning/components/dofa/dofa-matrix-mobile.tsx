"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { DofaItemDto } from "@/feature/planning/api/dofa";
import type { DofaCategory, GroupedItems, PerspectiveTab } from "./dofa-types";
import { QUADRANTS } from "./dofa-types";
import { ItemCard } from "./dofa-item-card";
import { AddFactorInput } from "./dofa-add-factor-input";

type Props = {
  perspectives: PerspectiveTab[];
  grouped: GroupedItems;
  onAdd: (perspKey: string, category: DofaCategory, text: string) => Promise<void>;
  onUpdate: (item: DofaItemDto, text: string) => Promise<void>;
  onDelete: (item: DofaItemDto) => void;
  readOnly: boolean;
};

export function MatrixMobileCards({ perspectives, grouped, onAdd, onUpdate, onDelete, readOnly }: Props) {
  const [openKey, setOpenKey] = useState<string | null>(perspectives[0]?.key ?? null);

  return (
    <div className="space-y-2">
      {perspectives.map((p) => {
        const isOpen = openKey === p.key;
        const total = QUADRANTS.reduce(
          (acc, q) => acc + (grouped[p.key]?.[q.category]?.length ?? 0),
          0,
        );
        return (
          <Collapsible
            key={p.key}
            open={isOpen}
            onOpenChange={(o) => setOpenKey(o ? p.key : null)}
          >
            <div className="rounded-lg border bg-card overflow-hidden">
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-2 px-3 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">{p.label}</span>
                    <Badge variant="secondary" className="text-[10px] h-5 shrink-0">{total}</Badge>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-3 pb-3 space-y-3 border-t">
                  {QUADRANTS.map((q) => {
                    const list = grouped[p.key]?.[q.category] ?? [];
                    return (
                      <div key={q.category} className="space-y-1.5">
                        <div className={cn("flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide pt-2", q.textClass)}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", q.fillClass)} />
                          {q.label}
                          <span className="text-muted-foreground font-normal normal-case">({list.length})</span>
                        </div>
                        <div className="space-y-1">
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
                              onAdd={(t) => onAdd(p.key, q.category, t)}
                            />
                          )}
                          {list.length === 0 && readOnly && (
                            <span className="text-[11px] text-muted-foreground/60 italic px-2">Sin factores</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        );
      })}
    </div>
  );
}
