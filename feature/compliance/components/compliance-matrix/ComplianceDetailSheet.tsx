"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ComplianceStatusBadge } from "./ComplianceStatusBadge";
import {
  CheckCircle2,
  GitBranch,
  FileText,
  AlertCircle,
  Pen,
  Link2,
} from "lucide-react";
import type { ClauseRow } from "./ComplianceTable";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clause: ClauseRow | null;
  frameworkName?: string;
  onEdit: () => void;
}

export function ComplianceDetailSheet({
  open,
  onOpenChange,
  clause,
  frameworkName = "ISO 9001",
  onEdit,
}: Props) {
  if (!clause) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-3/4 flex flex-col gap-4 p-6">
        <SheetHeader className="space-y-2 text-center sm:text-left">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {frameworkName} • Cláusula {clause.number}
          </p>
          <SheetTitle className="text-lg leading-tight font-semibold text-foreground">
            {clause.title}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Detalle de cumplimiento para cláusula {clause.number}
          </SheetDescription>
          <div className="pt-1 flex justify-center sm:justify-start">
            <ComplianceStatusBadge status={clause.status} />
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-5 py-4">
          <section>
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase text-muted-foreground mb-2">
              <CheckCircle2 className="h-3.5 w-3.5" /> Criterios de Cumplimiento
            </h4>
            <div className="rounded-lg border bg-background p-3 text-sm leading-relaxed text-foreground">
              {clause.how_it_complies ? (
                clause.how_it_complies
              ) : (
                <span className="text-muted-foreground italic">
                  Sin declaración registrada.
                </span>
              )}
            </div>
          </section>

          {clause.linked_processes.length > 0 && (
            <section className="rounded-lg border bg-background p-3">
              <div className="flex items-center gap-2 text-xs font-semibold mb-3">
                <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                Procesos Responsables
              </div>
              <div className="space-y-2">
                {clause.linked_processes.map((p) => (
                  <div
                    key={p}
                    className="flex items-center gap-2 text-sm text-primary cursor-pointer hover:underline"
                  >
                    <Link2 className="h-3.5 w-3.5" /> {p}
                  </div>
                ))}
              </div>
            </section>
          )}

          {clause.linked_documents.length > 0 && (
            <section className="rounded-lg border bg-background p-3">
              <div className="flex items-center gap-2 text-xs font-semibold mb-3">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                Evidencia Documental
              </div>
              <div className="space-y-2">
                {clause.linked_documents.map((d) => (
                  <div
                    key={d}
                    className="flex items-center gap-2 text-sm text-primary cursor-pointer hover:underline"
                  >
                    <Link2 className="h-3.5 w-3.5" /> {d}
                  </div>
                ))}
              </div>
            </section>
          )}

          {clause.findings_count > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-400 mb-1">
                <AlertCircle className="h-3.5 w-3.5" /> Atención Requerida
              </div>
              <p className="text-xs text-red-600 dark:text-red-300">
                Existen <strong>{clause.findings_count} Hallazgos</strong>{" "}
                abiertos asociados a esta cláusula.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button onClick={onEdit} className="gap-1.5">
            <Pen className="h-3.5 w-3.5" /> Editar Declaración
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
