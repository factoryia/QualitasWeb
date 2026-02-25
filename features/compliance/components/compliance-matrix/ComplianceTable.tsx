"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ComplianceStatusBadge } from "./ComplianceStatusBadge";
import { GitBranch, FileText, AlertCircle, ChevronRight } from "lucide-react";

export interface ClauseRow {
  id: string;
  number: string;
  title: string;
  status: string;
  how_it_complies: string | null;
  linked_processes: string[];
  linked_documents: string[];
  findings_count: number;
  declaration_id: string | null;
}

interface Props {
  rows: ClauseRow[];
  onRowClick: (row: ClauseRow) => void;
}

export function ComplianceTable({ rows, onRowClick }: Props) {
  if (rows.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm rounded-lg border bg-card">
        No hay cláusulas auditables para este marco normativo.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-6 w-[35%]">Cláusula</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Procesos Vinculados</TableHead>
            <TableHead>Evidencia Documental</TableHead>
            <TableHead>Alertas / Hallazgos</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onRowClick(row)}
            >
              <TableCell className="pl-6">
                <div className="flex gap-2">
                  <span className="font-bold text-foreground font-mono text-xs mt-0.5">
                    {row.number}
                  </span>
                  <span className="text-sm text-muted-foreground font-medium leading-snug">
                    {row.title}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <ComplianceStatusBadge status={row.status} />
              </TableCell>
              <TableCell>
                {row.linked_processes.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {row.linked_processes.map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        <GitBranch className="h-2.5 w-2.5" /> {p}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {row.linked_documents.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium">
                    <FileText className="h-3.5 w-3.5" />{" "}
                    {row.linked_documents.length} Docs
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Sin evidencia
                  </span>
                )}
              </TableCell>
              <TableCell>
                {row.findings_count > 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs text-red-600 font-semibold dark:text-red-400">
                    <AlertCircle className="h-3.5 w-3.5" /> {row.findings_count}{" "}
                    Abiertos
                  </span>
                ) : (
                  <span className="text-xs text-green-600 dark:text-green-400">
                    OK
                  </span>
                )}
              </TableCell>
              <TableCell>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
