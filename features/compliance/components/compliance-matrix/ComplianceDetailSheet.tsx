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
  Edit2,
  Link2,
} from "lucide-react";
import type { ClauseRow } from "./ComplianceTable";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ClauseRow | null;
  frameworkName: string;
  onEdit: () => void;
}

export function ComplianceDetailSheet({
  open,
  onOpenChange,
  data,
  frameworkName,
  onEdit,
}: Props) {
  if (!data) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md flex flex-col">
        <SheetHeader>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {frameworkName} • Cláusula {data.number}
          </p>
          <SheetTitle className="text-lg leading-tight">{data.title}</SheetTitle>
          <SheetDescription className="sr-only">
            Detalle de cumplimiento para cláusula {data.number}
          </SheetDescription>
          <div className="pt-1">
            <ComplianceStatusBadge status={data.status} />
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-5 py-4">
          <section>
            <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase text-muted-foreground mb-2">
              <CheckCircle2 className="h-3.5 w-3.5" /> ¿Cómo se cumple?
            </h4>
            <div className="rounded-lg border bg-background p-3 text-sm leading-relaxed text-foreground">
              {data.how_it_complies ?? (
                <span className="text-muted-foreground italic">
                  Sin declaración registrada.
                </span>
              )}
            </div>
          </section>

          {data.linked_processes.length > 0 && (
            <section className="rounded-lg border bg-background p-3">
              <div className="flex items-center gap-2 text-xs font-semibold mb-3">
                <GitBranch className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                Procesos Responsables
              </div>
              <div className="space-y-2">
                {data.linked_processes.map((p) => (
                  <div
                    key={p}
                    className="flex items-center gap-2 text-sm text-primary cursor-pointer"
                  >
                    <Link2 className="h-3.5 w-3.5" />{" "}
                    <span className="underline">{p}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.linked_documents.length > 0 && (
            <section className="rounded-lg border bg-background p-3">
              <div className="flex items-center gap-2 text-xs font-semibold mb-3">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                Evidencia Documental
              </div>
              <div className="space-y-2">
                {data.linked_documents.map((d) => (
                  <div
                    key={d}
                    className="flex items-center gap-2 text-sm text-primary cursor-pointer"
                  >
                    <Link2 className="h-3.5 w-3.5" />{" "}
                    <span className="underline">{d}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data.findings_count > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 dark:text-red-400 mb-1">
                <AlertCircle className="h-3.5 w-3.5" /> Atención Requerida
              </div>
              <p className="text-xs text-red-600 dark:text-red-300">
                Existen <strong>{data.findings_count} Hallazgos</strong>{" "}
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
            <Edit2 className="h-3.5 w-3.5" /> Editar Declaración
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
