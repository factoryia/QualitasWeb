"use client";

import { useMemo } from "react";
import {
  ArrowDown,
  MoreVertical,
  Eye,
  Pencil,
  FileEdit,
  Archive,
  ArchiveRestore,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ProcessTypeIcon } from "./ProcessTypeIcon";
import {
  getTypeStyles,
  resolveProcessTypeVisuals,
  type ProcessTypeStyles,
} from "@/feature/process/process-type-presets";
import type { ProcessDto, ProcessTypeDto } from "@/feature/process/types";

interface Props {
  types: ProcessTypeDto[];
  processes: ProcessDto[];
  onSelect: (p: ProcessDto) => void;
  onEdit?: (p: ProcessDto) => void;
  onEditCharacterization?: (p: ProcessDto) => void;
  onArchive?: (p: ProcessDto) => void;
  onCreateInType?: (typeId: string) => void;
  canDelete?: boolean;
  showEmptyCategories?: boolean;
}

function ProcessCardInline({
  process,
  styles,
  iconName,
  onClick,
  onEdit,
  onEditCharacterization,
  onArchive,
  canDelete,
}: {
  process: ProcessDto;
  styles: ProcessTypeStyles;
  iconName: string | null;
  onClick: () => void;
  onEdit?: () => void;
  onEditCharacterization?: () => void;
  onArchive?: () => void;
  canDelete?: boolean;
}) {
  const archived = !process.isActive;
  const hasMenu = !!(onEdit || onEditCharacterization || onArchive);
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <Card
          onClick={onClick}
          className={`relative min-w-0 cursor-pointer overflow-hidden py-0 transition-shadow hover:shadow-md border ${styles.border} ${archived ? "opacity-60" : ""
            }`}
        >
          {hasMenu && (
            <div className="absolute top-1 right-1 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    aria-label="Más acciones"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onSelect={onClick}>
                    <Eye className="h-3.5 w-3.5 mr-2" /> Abrir espacio del proceso
                  </DropdownMenuItem>
                  {onEdit && (
                    <DropdownMenuItem onSelect={onEdit}>
                      <Pencil className="h-3.5 w-3.5 mr-2" /> Editar datos básicos
                    </DropdownMenuItem>
                  )}
                  {onEditCharacterization && (
                    <DropdownMenuItem onSelect={onEditCharacterization}>
                      <FileEdit className="h-3.5 w-3.5 mr-2" /> Editar caracterización
                    </DropdownMenuItem>
                  )}
                  {onArchive && canDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={onArchive}
                        className={archived ? "" : "text-destructive focus:text-destructive"}
                      >
                        {archived ? (
                          <>
                            <ArchiveRestore className="h-3.5 w-3.5 mr-2" /> Restaurar proceso
                          </>
                        ) : (
                          <>
                            <Archive className="h-3.5 w-3.5 mr-2" /> Archivar proceso
                          </>
                        )}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          <CardContent className="p-4 space-y-2">
            <div className="flex items-start gap-3">
              <div className={`rounded-lg p-2 shrink-0 ${styles.iconBg}`}>
                <ProcessTypeIcon name={iconName} className="h-5 w-5" />
              </div>
              <div className={`min-w-0 flex-1 ${hasMenu ? "pr-6" : ""}`}>
                <p className="text-[10px] font-mono text-muted-foreground">
                  {process.code}
                </p>
                <p className="text-sm font-semibold leading-tight truncate">
                  {process.name}
                </p>
                {process.processObjective && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {process.processObjective}
                  </p>
                )}
              </div>
            </div>
            <div className={`h-1.5 w-full rounded-full bg-muted overflow-hidden`}>
              <div className={`h-full w-0 ${styles.bar}`} />
            </div>
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs px-3 py-2 text-left">
        <p className="text-sm font-semibold leading-snug text-foreground">{process.name}</p>
        {(process.processObjective || process.description) && (
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {process.processObjective ?? process.description}
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

interface ResolvedSection {
  type: ProcessTypeDto;
  styles: ProcessTypeStyles;
  sectionIcon: string;
  procs: ProcessDto[];
  hint: "full_width" | "half_width" | "third_width" | "auto";
}

function buildRows(sections: ResolvedSection[]): ResolvedSection[][] {
  const n = sections.length;
  if (n === 0) return [];
  const allAuto = sections.every((s) => s.hint === "auto");
  if (allAuto) {
    if (n === 1) return [[sections[0]]];
    if (n === 2) return [[sections[0]], [sections[1]]];
    if (n === 3) return [[sections[0]], [sections[1]], [sections[2]]];
    if (n === 4) return [[sections[0]], [sections[1]], [sections[2], sections[3]]];
  }
  const rows: ResolvedSection[][] = [];
  let buffer: ResolvedSection[] = [];
  let bufferKind: "half_width" | "third_width" | null = null;
  const flushBuffer = () => {
    if (buffer.length > 0) {
      rows.push(buffer);
      buffer = [];
      bufferKind = null;
    }
  };
  for (const s of sections) {
    const hint = s.hint === "auto" ? "full_width" : s.hint;
    if (hint === "full_width") {
      flushBuffer();
      rows.push([s]);
    } else {
      const cap = hint === "third_width" ? 3 : 2;
      if (bufferKind && bufferKind !== hint) flushBuffer();
      bufferKind = hint;
      buffer.push(s);
      if (buffer.length >= cap) flushBuffer();
    }
  }
  flushBuffer();
  return rows;
}

function rowGridClass(row: ResolvedSection[]): string {
  if (row.length === 1) return "grid grid-cols-1 gap-3";
  if (row.length === 2) return "grid grid-cols-1 md:grid-cols-2 gap-3";
  return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3";
}

function Section({
  section,
  onSelect,
  onEdit,
  onEditCharacterization,
  onArchive,
  onCreateInType,
  canDelete,
}: {
  section: ResolvedSection;
  onSelect: (p: ProcessDto) => void;
  onEdit?: (p: ProcessDto) => void;
  onEditCharacterization?: (p: ProcessDto) => void;
  onArchive?: (p: ProcessDto) => void;
  onCreateInType?: (typeId: string) => void;
  canDelete?: boolean;
}) {
  const { type, styles, procs, sectionIcon } = section;
  return (
    <div
      className={`${styles.bg} rounded-xl border-2 ${styles.border} p-5 shadow-sm ring-1 ring-black/5 dark:ring-white/10`}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className={`rounded-lg p-2 shadow-sm ${styles.iconBg}`}>
          <ProcessTypeIcon name={sectionIcon} className="size-5" strokeWidth={2} />
        </div>
        <h3 className={`text-sm font-bold uppercase tracking-wider ${styles.text}`}>
          {type.name}
        </h3>
        <span className="text-xs text-muted-foreground ml-auto">
          {procs.length} {procs.length === 1 ? "proceso" : "procesos"}
        </span>
        {onCreateInType && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7"
            onClick={() => onCreateInType(type.id)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Agregar
          </Button>
        )}
      </div>

      {procs.length === 0 ? (
        <div className="flex items-center justify-center py-6 border border-dashed rounded-lg border-muted-foreground/30">
          <div className="text-center">
            <p className="text-xs text-muted-foreground italic mb-2">
              Sin procesos registrados
            </p>
            {onCreateInType && (
              <Button size="sm" variant="outline" onClick={() => onCreateInType(type.id)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Agregar el primero
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {procs.map((p) => (
            <ProcessCardInline
              key={p.id}
              process={p}
              styles={styles}
              iconName={sectionIcon}
              onClick={() => onSelect(p)}
              onEdit={onEdit ? () => onEdit(p) : undefined}
              onEditCharacterization={
                onEditCharacterization ? () => onEditCharacterization(p) : undefined
              }
              onArchive={onArchive ? () => onArchive(p) : undefined}
              canDelete={canDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ProcessValueChain({
  types,
  processes,
  onSelect,
  onEdit,
  onEditCharacterization,
  onArchive,
  onCreateInType,
  canDelete,
  showEmptyCategories = false,
}: Props) {
  const sections = useMemo<ResolvedSection[]>(() => {
    const activeTypes = types
      .filter((t) => t.isActive !== false)
      .sort((a, b) => a.order - b.order);
    const all: ResolvedSection[] = activeTypes.map((t) => {
      const procs = processes.filter((p) => p.processTypeId === t.id);
      const hint = (t.layoutHint as ResolvedSection["hint"]) || "auto";
      const visuals = resolveProcessTypeVisuals(t);
      return {
        type: t,
        styles: getTypeStyles(visuals.color),
        sectionIcon: visuals.icon,
        procs,
        hint,
      };
    });
    return showEmptyCategories ? all : all.filter((s) => s.procs.length > 0);
  }, [types, processes, showEmptyCategories]);

  const rows = useMemo(() => buildRows(sections), [sections]);

  if (sections.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-muted-foreground border border-dashed rounded-xl">
        No hay categorías activas con procesos registrados.
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-2">


        {rows.map((row, idx) => (
          <div key={idx}>
            {idx > 0 && row.length === 1 && rows[idx - 1].length === 1 && (
              <div className="flex justify-center py-1">
                <ArrowDown className="h-6 w-6 text-muted-foreground/50" />
              </div>
            )}
            <div className={rowGridClass(row)}>
              {row.map((s) => (
                <Section
                  key={s.type.id}
                  section={s}
                  onSelect={onSelect}
                  onEdit={onEdit}
                  onEditCharacterization={onEditCharacterization}
                  onArchive={onArchive}
                  onCreateInType={onCreateInType}
                  canDelete={canDelete}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
