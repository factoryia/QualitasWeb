"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { StakeholderDto } from "@/feature/planning/api/stakeholders";
import { INFLUENCE_LEVELS, INTEREST_LEVELS } from "./stakeholders.constants";
import { classificationPillClass, matrixCellStyle } from "./stakeholders.ui";

interface Props {
  stakeholders: StakeholderDto[];
}

export function StakeholdersMatrix({ stakeholders }: Props) {
  const byCell = useMemo(() => {
    const map = new Map<string, StakeholderDto[]>();
    for (const s of stakeholders) {
      const key = `${s.influenceLevel}__${s.interestLevel}`;
      const arr = map.get(key) ?? [];
      arr.push(s);
      map.set(key, arr);
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => a.name.localeCompare(b.name));
      map.set(k, arr);
    }
    return map;
  }, [stakeholders]);

  const legend = useMemo(() => {
    const hasInternal = stakeholders.some((s) =>
      (s.stakeholderType?.classification ?? "").toLowerCase().includes("intern"),
    );
    const hasExternal = stakeholders.some((s) =>
      (s.stakeholderType?.classification ?? "").toLowerCase().includes("extern"),
    );
    return { hasInternal, hasExternal };
  }, [stakeholders]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex items-center justify-center w-8 shrink-0">
          <span className="text-xs font-semibold text-muted-foreground -rotate-90 whitespace-nowrap tracking-wider uppercase">
            Influencia
          </span>
        </div>
        <div className="flex-1 space-y-1">
          <div className="grid grid-cols-[80px_1fr_1fr_1fr] gap-1">
            <div />
            {INTEREST_LEVELS.map((level) => (
              <div
                key={level}
                className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-1"
              >
                {level}
              </div>
            ))}
          </div>

          {INFLUENCE_LEVELS.map((influence) => (
            <div key={influence} className="grid grid-cols-[80px_1fr_1fr_1fr] gap-1">
              <div className="flex items-center justify-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {influence}
              </div>
              {INTEREST_LEVELS.map((interest) => {
                const cell = matrixCellStyle(influence, interest);
                const items = byCell.get(`${influence}__${interest}`) ?? [];
                return (
                  <div
                    key={`${influence}-${interest}`}
                    className={cn(
                      "rounded-lg border p-3 min-h-[120px] flex flex-col gap-2",
                      cell.container,
                    )}
                  >
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider",
                        cell.labelText,
                      )}
                    >
                      {cell.label}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {items.length === 0 ? (
                        <span className="text-[10px] text-muted-foreground italic">
                          Sin partes
                        </span>
                      ) : (
                        items.map((s) => (
                          <Badge
                            key={s.id}
                            variant="outline"
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 font-semibold",
                              classificationPillClass(
                                s.stakeholderType?.classification,
                              ),
                            )}
                          >
                            {s.name}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          <div className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-1">
            Interés
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 justify-center text-xs text-muted-foreground">
        {legend.hasInternal && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-blue-500/30 border border-blue-500/50" />
            <span>Interno</span>
          </div>
        )}
        {legend.hasExternal && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-orange-500/30 border border-orange-500/50" />
            <span>Externo</span>
          </div>
        )}
        <span className="ml-2">Total: {stakeholders.length} partes interesadas</span>
      </div>
    </div>
  );
}

