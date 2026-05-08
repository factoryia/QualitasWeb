"use client";

import {
  MoreVertical,
  Pencil,
  Eye,
  FileEdit,
  Archive,
  ArchiveRestore,
  Layers,
  User,
  Building,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProcessTypeIcon } from "./ProcessTypeIcon";
import { ProcessStatusBadge } from "./ProcessStatusBadge";
import {
  getTypeStyles,
  resolveProcessTypeVisuals,
} from "@/feature/process/process-type-presets";
import type { ProcessDto, ProcessTypeDto } from "@/feature/process/types";

interface ProcessCardProps {
  process: ProcessDto;
  processType: ProcessTypeDto | undefined;
  onClick?: (process: ProcessDto) => void;
  onEdit?: (process: ProcessDto) => void;
  onEditCharacterization?: (process: ProcessDto) => void;
  onArchive?: (process: ProcessDto) => void;
  canDelete?: boolean;
  activityCount?: number;
}

export function ProcessCard({
  process,
  processType,
  onClick,
  onEdit,
  onEditCharacterization,
  onArchive,
  canDelete,
  activityCount,
}: ProcessCardProps) {
  const visuals = processType
    ? resolveProcessTypeVisuals(processType)
    : { color: "slate" as const, icon: "Layers" };
  const styles = getTypeStyles(visuals.color);
  const archived = !process.isActive;
  const description = process.processObjective ?? process.description ?? "";
  const hasMenu = !!(onEdit || onEditCharacterization || onArchive);

  return (
    <div
      onClick={() => onClick?.(process)}
      className={`group relative flex min-w-0 w-full flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-card ${styles.border} ${
        onClick ? "cursor-pointer" : ""
      } ${archived ? "opacity-60" : ""}`}
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
            <DropdownMenuContent
              align="end"
              className="w-56"
              onClick={(e) => e.stopPropagation()}
            >
              {onClick && (
                <DropdownMenuItem onSelect={() => onClick(process)}>
                  <Eye className="mr-2 h-3.5 w-3.5" /> Abrir espacio del proceso
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onSelect={() => onEdit(process)}>
                  <Pencil className="mr-2 h-3.5 w-3.5" /> Editar datos básicos
                </DropdownMenuItem>
              )}
              {onEditCharacterization && (
                <DropdownMenuItem onSelect={() => onEditCharacterization(process)}>
                  <FileEdit className="mr-2 h-3.5 w-3.5" /> Editar caracterización
                </DropdownMenuItem>
              )}
              {onArchive && canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => onArchive(process)}
                    className={archived ? "" : "text-destructive focus:text-destructive"}
                  >
                    {archived ? (
                      <>
                        <ArchiveRestore className="mr-2 h-3.5 w-3.5" /> Restaurar proceso
                      </>
                    ) : (
                      <>
                        <Archive className="mr-2 h-3.5 w-3.5" /> Archivar proceso
                      </>
                    )}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="flex flex-1 items-start gap-3 p-4 pb-3">
        <div className={`shrink-0 rounded-lg p-2 ${styles.iconBg}`}>
          <ProcessTypeIcon name={visuals.icon} className="size-4" />
        </div>

        <div className={`min-w-0 flex-1 ${hasMenu ? "pr-6" : ""}`}>
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              {process.code}
            </p>
            {process.processStatusName && (
              <ProcessStatusBadge
                status={process.processStatusId ? undefined : "Defined"}
                fallbackLabel={process.processStatusName}
              />
            )}
          </div>
          <h3 className="line-clamp-1 text-sm font-semibold leading-snug" title={process.name}>
            {process.name}
          </h3>

          {description && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            {process.owner && (
              <span className="inline-flex items-center gap-1">
                <User className="size-3" />
                <span className="truncate max-w-[140px]">{process.owner}</span>
              </span>
            )}
            {process.processVersion && (
              <span className="inline-flex items-center gap-1">
                <Layers className="size-3" />v{process.processVersion}
              </span>
            )}
            {typeof activityCount === "number" && (
              <span className="inline-flex items-center gap-1">
                <ListChecks className="size-3" />
                {activityCount} act.
              </span>
            )}
            {process.requiresAudit && (
              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                <Building className="size-3" /> auditable
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className={`mt-auto h-1 w-full shrink-0 ${styles.bar} opacity-80`}
        aria-hidden
      />
    </div>
  );
}
