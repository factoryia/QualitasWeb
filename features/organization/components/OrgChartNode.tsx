"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Users, User, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Area } from "../types";
import type { OrgMember } from "../hooks/use-organization-structure-query";

const LEVEL_CONFIG: Record<number, { label: string; badgeClass: string }> = {
  1: { label: "DESPACHO", badgeClass: "bg-primary/15 text-primary" },
  2: { label: "SECRETARÍA", badgeClass: "bg-purple-500/15 text-purple-600" },
  3: { label: "DIRECCIÓN", badgeClass: "bg-teal-500/15 text-teal-600" },
  4: { label: "OFICINA ASESORA", badgeClass: "bg-amber-500/15 text-amber-700" },
};

function getLevelConfig(level: number | null | undefined) {
  return LEVEL_CONFIG[level ?? 1] ?? { label: "DPTO", badgeClass: "bg-muted text-muted-foreground" };
}

export interface OrgChartNodeProps {
  area: Area;
  allAreas: Area[];
  members: OrgMember[];
  userCounts: Record<string, number>;
  isRoot: boolean;
  allExpanded: boolean;
  onSelect: (a: Area) => void;
  onAddChild: (pId: string | null) => void;
  onEdit: (a: Area) => void;
  onDelete: (a: Area) => void;
}

export function OrgChartNode({
  area,
  allAreas,
  members,
  userCounts,
  isRoot,
  allExpanded,
  onSelect,
  onAddChild,
  onEdit,
  onDelete,
}: OrgChartNodeProps) {
  const children = allAreas.filter((a) => a.parent_id === area.id);
  const hasChildren = children.length > 0;
  const [expanded, setExpanded] = useState(isRoot || allExpanded);
  const config = getLevelConfig(area.hierarchy_level);
  const manager = area.manager_id ? members.find((m) => m.user_id === area.manager_id) : null;
  const isInactive = area.is_active === false;
  const count = userCounts[area.id] ?? 0;

  useEffect(() => {
    setExpanded(isRoot || allExpanded);
  }, [allExpanded, isRoot]);

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "relative rounded-xl border shadow-sm w-56 cursor-pointer transition-all hover:shadow-md",
          isRoot
            ? "bg-slate-900 text-white border-slate-700"
            : "bg-card text-card-foreground border-border",
          isInactive && "opacity-50"
        )}
        onClick={() => onSelect(area)}
      >
        <div className="absolute top-1.5 right-1.5 flex gap-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(area);
            }}
            className={cn(
              "h-6 w-6 flex items-center justify-center rounded hover:bg-accent/20",
              isRoot ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Pencil className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(area);
            }}
            className={cn(
              "h-6 w-6 flex items-center justify-center rounded hover:bg-destructive/20",
              isRoot ? "text-white/70 hover:text-red-400" : "text-muted-foreground hover:text-destructive"
            )}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>

        <div className="p-3 pt-2">
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-semibold px-1.5 py-0 mb-1.5 border-0",
              isRoot ? "bg-white/15 text-white/90" : config.badgeClass
            )}
          >
            {config.label}
          </Badge>

          <p className={cn("font-semibold text-sm leading-tight mb-1.5", isRoot && "text-white")}>
            {area.name}
          </p>

          <div
            className={cn(
              "flex items-center gap-1 text-xs mb-2",
              isRoot ? "text-white/70" : "text-muted-foreground"
            )}
          >
            <Users className="h-3 w-3" />
            <span>{count} Funcionario{count !== 1 ? "s" : ""}</span>
          </div>

          <div className={cn("border-t border-dashed mb-2", isRoot ? "border-white/20" : "border-border")} />

          <div
            className={cn(
              "flex items-center gap-1.5 text-xs",
              isRoot ? "text-white/80" : "text-muted-foreground"
            )}
          >
            <User className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {manager ? manager.full_name || "Sin nombre" : <span className="italic">Vacante</span>}
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
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
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
                  <OrgChartNode
                    area={child}
                    allAreas={allAreas}
                    members={members}
                    userCounts={userCounts}
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
