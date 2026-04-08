"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CargoDto } from "../types";

export interface CargoDetailDrawerProps {
  cargo: CargoDto | null;
  onClose: () => void;
}

export function CargoDetailDrawer({ cargo, onClose }: CargoDetailDrawerProps) {
  const colorHex =
    cargo?.identificationColor?.trim() &&
    (cargo.identificationColor.startsWith("#")
      ? cargo.identificationColor
      : `#${cargo.identificationColor}`);

  return (
    <Sheet open={!!cargo} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex flex-col sm:max-w-md">
        <SheetHeader className="space-y-1.5 text-left">
          <SheetTitle className="text-xl font-semibold tracking-tight">
            {cargo?.name}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            Detalle del cargo / puesto organizacional
          </SheetDescription>
        </SheetHeader>
        {cargo && (
          <div className="mt-6 flex flex-1 flex-col gap-5 overflow-y-auto">
            {cargo.code && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Código
                </p>
                <Badge
                  variant="secondary"
                  className="font-mono font-medium bg-muted text-foreground"
                >
                  {cargo.code}
                </Badge>
              </div>
            )}
            {cargo.hierarchyLevel != null && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Nivel jerárquico
                </p>
                <p className="text-base font-semibold tabular-nums">
                  {cargo.hierarchyLevel}
                </p>
              </div>
            )}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Estado
              </p>
              {cargo.isActive ? (
                <Badge
                  className={cn(
                    "font-medium",
                    "bg-green-500/15 text-green-700 dark:bg-green-500/20 dark:text-green-400",
                    "border-0"
                  )}
                >
                  Activo
                </Badge>
              ) : (
                <Badge variant="outline" className="font-medium text-muted-foreground">
                  Inactivo
                </Badge>
              )}
            </div>
            {cargo.parentPositionName && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Cargo superior
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="size-4 shrink-0 text-muted-foreground" />
                  <span>{cargo.parentPositionName}</span>
                </div>
              </div>
            )}
            {colorHex && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Color
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className="size-6 shrink-0 rounded-full border border-border"
                    style={{ backgroundColor: colorHex }}
                  />
                  <span className="font-mono text-sm text-muted-foreground">
                    {cargo.identificationColor}
                  </span>
                </div>
              </div>
            )}
            <div className="space-y-1.5 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Descripción
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {cargo.description?.trim() || "—"}
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
