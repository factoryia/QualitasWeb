"use client";

import { Plus, FileX, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

/** Datos quemados cuando no hay API de exclusiones */
const MOCK_EXCLUSIONES = [
  {
    id: "ex-1",
    clause_number: "8.3",
    clause_title: "Diseño y desarrollo de los productos y servicios",
    framework_name: "ISO 9001:2015",
    justification: "No aplica; la organización no diseña productos.",
    status: "excluido" as const,
  },
  {
    id: "ex-2",
    clause_number: "7.1.5",
    clause_title: "Recursos de seguimiento y medición",
    framework_name: "ISO 9001:2015",
    justification: null,
    status: "aplica" as const,
  },
];

export function ExclusionsPanel() {
  const exclusions = MOCK_EXCLUSIONES;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold">
              Declaración de Aplicabilidad (Exclusiones)
            </h3>
            <p className="text-sm text-muted-foreground">
              Justifique los requisitos normativos que no aplican a la
              organización.
            </p>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5 shrink-0">
            <Plus className="h-4 w-4" /> Registrar Exclusión
          </Button>
        </div>

        {exclusions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay exclusiones registradas. Todos los requisitos aplican.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cláusula / Requisito</TableHead>
                <TableHead>Marco</TableHead>
                <TableHead>Justificación de Exclusión</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exclusions.map((ex) => (
                <TableRow key={ex.id}>
                  <TableCell>
                    <span className="font-bold font-mono text-xs">
                      {ex.clause_number}
                    </span>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {ex.clause_title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[11px]">
                      {ex.framework_name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[300px]">
                    {ex.justification ??
                      (ex.status === "aplica" ? (
                        <span className="italic">
                          Aplica para toda la organización.
                        </span>
                      ) : (
                        "—"
                      ))}
                  </TableCell>
                  <TableCell>
                    {ex.status === "excluido" ? (
                      <Badge
                        variant="destructive"
                        className="gap-1 text-[11px]"
                      >
                        <FileX className="h-3 w-3" /> EXCLUIDO
                      </Badge>
                    ) : (
                      <Badge className="gap-1 text-[11px] bg-green-50 text-green-600 border-green-200 hover:bg-green-100">
                        <CheckCircle2 className="h-3 w-3" /> APLICA
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
