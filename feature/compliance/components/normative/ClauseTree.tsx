"use client";

import { FileCheck, Pencil, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ClausulaRequisitoDto } from "../../api/clausulas-requisitos";
import type { CriterioCumplimientoDto } from "../../api/criterios-cumplimiento";

interface Props {
  clause: ClausulaRequisitoDto;
  allClauses: ClausulaRequisitoDto[];
  criteria: CriterioCumplimientoDto[];
  depth: number;
  onEditClause?: (clause: ClausulaRequisitoDto) => void;
  onAddCriterio?: (clause: ClausulaRequisitoDto) => void;
}

export function ClauseTree({
  clause,
  allClauses,
  criteria,
  depth,
  onEditClause,
  onAddCriterio,
}: Props) {
  const children = allClauses.filter((c) => c.parentRequirementId === clause.id);
  const hasChildren = children.length > 0;
  const clauseCriteria = criteria.filter(
    (c) => c.requirementClauseId === clause.id
  );

  return (
    <div className={cn(depth === 0 && "mb-2", "min-w-0")}>
      <div
        className={cn(
          "rounded-md px-3 py-2.5 transition-colors min-w-0",
          depth === 0
            ? "bg-muted/50 border border-border"
            : "bg-background border border-border/40 mb-0.5"
        )}
        style={{ marginLeft: `${depth * 1.5}rem` }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={cn(
              "text-xs font-mono shrink-0",
              depth === 0 ? "text-primary font-bold" : "text-muted-foreground"
            )}
          >
            {clause.clauseNumber}
          </span>
          <span
            className={cn(
              "flex-1 truncate text-sm",
              depth === 0 && "font-semibold"
            )}
          >
            {clause.title}
          </span>

          {clause.isAuditable && (
            <Badge className="text-[10px] uppercase shrink-0 bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 gap-1">
              <FileCheck className="h-3 w-3" />
              Auditable
            </Badge>
          )}

          {onEditClause && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onEditClause(clause);
              }}
              title="Editar cláusula"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {(clauseCriteria.length > 0 || onAddCriterio) && (
          <div className="mt-2.5 pt-2.5 border-t border-dashed border-border/60">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Criterios de Cumplimiento:
              </span>
              {onAddCriterio && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddCriterio(clause);
                  }}
                  title="Agregar criterio de cumplimiento"
                >
                  <PlusCircle className="h-3 w-3" /> Agregar
                </Button>
              )}
            </div>
            {clauseCriteria.length > 0 ? (
              <ul className="pl-5 space-y-0.5">
                {clauseCriteria.map((crit) => (
                  <li
                    key={crit.id}
                    className="text-xs text-muted-foreground list-disc"
                  >
                    <span className="font-mono font-semibold text-foreground">
                      [{crit.code}]{" "}
                    </span>
                    {crit.description}
                    {crit.isCritical && (
                      <span className="ml-1.5 text-destructive font-semibold text-[10px]">
                        ● CRÍTICO
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              onAddCriterio && (
                <p className="text-xs text-muted-foreground italic pl-1">
                  Sin criterios.{" "}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddCriterio(clause);
                    }}
                  >
                    Agregar criterio
                  </button>
                </p>
              )
            )}
          </div>
        )}
      </div>

      {hasChildren && (
        <div>
          {children.map((child) => (
            <ClauseTree
              key={child.id}
              clause={child}
              allClauses={allClauses}
              criteria={criteria}
              depth={depth + 1}
              onEditClause={onEditClause}
              onAddCriterio={onAddCriterio}
            />
          ))}
        </div>
      )}
    </div>
  );
}
