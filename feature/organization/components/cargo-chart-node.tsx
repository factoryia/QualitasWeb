"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Briefcase, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CargoDto } from "../types";

const LEVEL_CONFIG: Record<number, { label: string; badgeClass: string }> = {
  1: { label: "NIV. 1", badgeClass: "bg-primary/15 text-primary" },
  2: { label: "NIV. 2", badgeClass: "bg-purple-500/15 text-purple-600 dark:text-purple-400" },
  3: { label: "NIV. 3", badgeClass: "bg-teal-500/15 text-teal-600 dark:text-teal-400" },
  4: { label: "NIV. 4", badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  5: { label: "NIV. 5", badgeClass: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
};

function getLevelConfig(level: number | null | undefined) {
  return (
    LEVEL_CONFIG[level ?? 1] ?? {
      label: "CARGO",
      badgeClass: "bg-muted text-muted-foreground",
    }
  );
}

export interface CargoChartNodeProps {
  cargo: CargoDto;
  allCargos: CargoDto[];
  isRoot: boolean;
  allExpanded: boolean;
  onSelect: (c: CargoDto) => void;
  onAddChild: (parentId: string | null) => void;
  onEdit: (c: CargoDto) => void;
  onDelete: (c: CargoDto) => void;
}

export function CargoChartNode({
  cargo,
  allCargos,
  isRoot,
  allExpanded,
  onSelect,
  onAddChild,
  onEdit,
  onDelete,
}: CargoChartNodeProps) {
  const children = allCargos.filter(
    (c) => c.parentPositionId === cargo.id
  );
  const hasChildren = children.length > 0;
  const [expanded, setExpanded] = useState(isRoot || allExpanded);
  const config = getLevelConfig(cargo.hierarchyLevel ?? undefined);
  const isInactive = cargo.isActive === false;

  useEffect(() => {
    setExpanded(isRoot || allExpanded);
  }, [allExpanded, isRoot]);

  const colorHex =
    cargo.identificationColor?.trim() &&
    (cargo.identificationColor.startsWith("#")
      ? cargo.identificationColor
      : `#${cargo.identificationColor}`);

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "relative rounded-xl border shadow-sm w-56 cursor-pointer transition-all hover:shadow-md",
          isRoot
            ? "bg-slate-900 text-white border-slate-700"
            : "bg-card text-card-foreground border-border",
          isInactive && "opacity-60"
        )}
        onClick={() => onSelect(cargo)}
      >
        <div className="absolute top-1.5 right-1.5 flex gap-0.5">
          <button
            title="Agregar subordinado"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(cargo.id);
            }}
            className={cn(
              "h-6 w-6 flex items-center justify-center rounded hover:bg-accent/20",
              isRoot
                ? "text-white/70 hover:text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            title="Editar cargo"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(cargo);
            }}
            className={cn(
              "h-6 w-6 flex items-center justify-center rounded hover:bg-accent/20",
              isRoot
                ? "text-white/70 hover:text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            title="Eliminar cargo"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(cargo);
            }}
            className={cn(
              "h-6 w-6 flex items-center justify-center rounded hover:bg-destructive/20",
              isRoot
                ? "text-white/70 hover:text-red-400"
                : "text-muted-foreground hover:text-destructive"
            )}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>

        <div className="p-3 pt-2">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-semibold px-1.5 py-0 border-0",
                isRoot ? "bg-white/15 text-white/90" : config.badgeClass
              )}
            >
              {config.label}
            </Badge>
            {colorHex && (
              <span
                className="size-3 rounded-full border border-border shrink-0"
                style={{ backgroundColor: colorHex }}
                title={cargo.identificationColor ?? undefined}
              />
            )}
          </div>

          <p
            className={cn(
              "font-semibold text-sm leading-tight mb-1",
              isRoot && "text-white"
            )}
          >
            {cargo.name}
          </p>
          <p
            className={cn(
              "text-xs font-mono mb-2",
              isRoot ? "text-white/70" : "text-muted-foreground"
            )}
          >
            {cargo.code}
          </p>

          <div
            className={cn(
              "flex items-center gap-1 text-xs",
              isRoot ? "text-white/80" : "text-muted-foreground"
            )}
          >
            <Briefcase className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {cargo.parentPositionName ?? (isRoot ? "Raíz" : "—")}
            </span>
          </div>
        </div>

        {hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className={cn(
              "absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 h-6 w-6 rounded-full border flex items-center justify-center shadow-sm",
              isRoot
                ? "bg-slate-800 border-slate-600 text-white/80 hover:bg-slate-700"
                : "bg-card border-border text-muted-foreground hover:bg-accent"
            )}
          >
            {expanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        )}
      </div>

      {expanded && hasChildren && (
        <div className="flex flex-col items-center">
          <div className="w-px h-8 bg-border" />
          <div className="relative">
            {children.length > 1 && (
              <div
                className="absolute top-0 h-px bg-border"
                style={{
                  left: `calc(50% / ${children.length})`,
                  right: `calc(50% / ${children.length})`,
                }}
              />
            )}
            <div className="flex gap-2">
              {children.map((child) => (
                <div key={child.id} className="flex flex-col items-center">
                  <div className="w-px h-4 bg-border" />
                  <CargoChartNode
                    cargo={child}
                    allCargos={allCargos}
                    isRoot={false}
                    allExpanded={allExpanded}
                    onSelect={onSelect}
                    onAddChild={onAddChild}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
