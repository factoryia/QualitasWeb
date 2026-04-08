"use client";

import { Bot, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  DofaCategory,
  DofaItemDto,
  DofaPerspective,
} from "@/feature/planning/api/dofa";
import type { DofaCategoryCard, DofaPerspectiveTab } from "./dofa-constants";

type Props = {
  analysisId: string;
  perspectiveTabs: DofaPerspectiveTab[];
  categoryCards: DofaCategoryCard[];
  itemsByCell: Map<string, DofaItemDto[]>;
  draftByCell: Record<string, string>;
  onDraftChange: (cellKey: string, value: string) => void;
  onAddItem: (params: {
    analysisId: string;
    perspective: DofaPerspective;
    category: DofaCategory;
  }) => void | Promise<void>;
  onImproveDraft: (cellKey: string) => void;
  onDeactivateItem: (params: {
    analysisId: string;
    itemId: string;
  }) => void | Promise<unknown>;
  busyItems: boolean;
};

export function DofaPerspectiveTabs({
  analysisId,
  perspectiveTabs,
  categoryCards,
  itemsByCell,
  draftByCell,
  onDraftChange,
  onAddItem,
  onImproveDraft,
  onDeactivateItem,
  busyItems,
}: Props) {
  return (
    <Tabs defaultValue={perspectiveTabs[0]?.value ?? "financiera"}>
      <TabsList className="flex w-full justify-start overflow-x-auto flex-nowrap">
        {perspectiveTabs.map((t) => (
          <TabsTrigger
            key={t.value}
            value={t.value}
            className="shrink-0 px-2.5 text-xs sm:px-3 sm:text-sm"
          >
            {t.value === "cruce" ? (
              <>
                <span className="sm:hidden">Cruce</span>
                <span className="hidden sm:inline">{t.label}</span>
              </>
            ) : (
              t.label
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {perspectiveTabs.map((t) => (
        <TabsContent key={t.value} value={t.value} className="mt-2">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t.helper}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryCards.map((cat) => {
                const cellKey = `${t.perspective}__${cat.category}`;
                const items = itemsByCell.get(cellKey) ?? [];
                const draftValue = draftByCell[cellKey] ?? "";

                return (
                  <div
                    key={cellKey}
                    className="rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col h-full"
                  >
                    <div
                      className={`flex flex-col space-y-1.5 p-6 py-3 px-4 rounded-t-lg ${cat.headerClassName}`}
                    >
                      <h3 className="tracking-tight text-sm font-semibold">
                        {cat.title}
                      </h3>
                    </div>

                    <div className="flex-1 p-3 space-y-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-2 group text-sm"
                        >
                          <span className="flex-1 cursor-pointer hover:underline leading-tight pt-0.5 break-words">
                            • {item.description}
                          </span>
                          <button
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-7 w-7 opacity-100 md:opacity-0 md:group-hover:opacity-100 shrink-0 text-destructive"
                            onClick={async () => {
                              await onDeactivateItem({ analysisId, itemId: item.id });
                            }}
                            disabled={busyItems}
                            type="button"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}

                      <div className="flex gap-1 pt-1">
                        <Input
                          className="h-7 text-xs"
                          placeholder="Agregar..."
                          value={draftValue}
                          onChange={(e) => onDraftChange(cellKey, e.target.value)}
                          disabled={busyItems}
                        />
                        <Button
                          variant="outline"
                          className="h-7 w-7 shrink-0"
                          size="icon"
                          onClick={() =>
                            onAddItem({
                              analysisId,
                              perspective: t.perspective,
                              category: cat.category,
                            })
                          }
                          disabled={busyItems || !draftValue.trim()}
                          type="button"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        className="rounded-md px-3 w-full h-7 text-xs gap-1 text-muted-foreground"
                        onClick={() => onImproveDraft(cellKey)}
                        disabled={busyItems || !draftValue.trim()}
                        type="button"
                      >
                        <Bot className="h-3.5 w-3.5" />
                        Mejorar con IA
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
