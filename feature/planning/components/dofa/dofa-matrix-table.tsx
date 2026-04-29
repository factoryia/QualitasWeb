"use client";

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

export function MatrixTable({ perspectives, grouped, onAdd, onUpdate, onDelete, readOnly }: Props) {
  return (
    <div className="relative border rounded-lg overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 bg-muted/80 backdrop-blur text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground px-3 py-2 border-b border-r min-w-[150px] w-[170px]">
                Perspectiva
              </th>
              {QUADRANTS.map((q) => (
                <th
                  key={q.category}
                  className={cn(
                    "text-left text-[11px] font-bold uppercase tracking-wide px-3 py-2 border-b border-r last:border-r-0 min-w-[180px]",
                    q.headerBgClass,
                  )}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span className={cn("h-1.5 w-1.5 rounded-full", q.fillClass)} />
                    {q.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {perspectives.map((p) => (
              <tr key={p.key} className="border-b last:border-b-0 align-top">
                <td className="sticky left-0 z-10 bg-muted/30 backdrop-blur px-3 py-2.5 border-r">
                  <span className="text-sm font-medium text-foreground leading-tight">{p.label}</span>
                </td>
                {QUADRANTS.map((q) => {
                  const list = grouped[p.key]?.[q.category] ?? [];
                  return (
                    <td key={q.category} className={cn("p-1.5 border-r last:border-r-0 align-top", q.cellBgClass)}>
                      <div className="flex flex-col gap-1">
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
                            compact
                          />
                        )}
                        {list.length === 0 && readOnly && (
                          <span className="text-[11px] text-muted-foreground/60 italic px-2 py-1">
                            Sin factores
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
