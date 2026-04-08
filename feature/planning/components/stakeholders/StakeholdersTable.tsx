"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StakeholderDto } from "@/feature/planning/api/stakeholders";
import {
  classificationPillClass,
  levelPillClass,
  matrixCellStyle,
  statusPillClass,
} from "./stakeholders.ui";

interface Props {
  stakeholders: StakeholderDto[];
  onEdit: (stakeholder: StakeholderDto) => void;
  onDelete: (stakeholder: StakeholderDto) => void;
}

export function StakeholdersTable({ stakeholders, onEdit, onDelete }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    return [...stakeholders].sort((a, b) => a.name.localeCompare(b.name));
  }, [stakeholders]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>Nombre</TableHead>
            <TableHead className="w-[130px]">Tipo</TableHead>
            <TableHead className="w-[100px]">Influencia</TableHead>
            <TableHead className="w-[100px]">Interés</TableHead>
            <TableHead className="w-[150px]">Estrategia</TableHead>
            <TableHead className="w-[90px]">Estado</TableHead>
            <TableHead className="w-[90px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((s) => {
            const isOpen = openId === s.id;
            const type = s.stakeholderType;
            const typeLabel = type?.name ?? "—";

            return (
              <Fragment key={s.id}>
                <TableRow
                  className="cursor-pointer"
                  onClick={() => setOpenId(isOpen ? null : s.id)}
                >
                  <TableCell>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {type ? (
                      <Badge
                        variant="outline"
                        className={classificationPillClass(type.classification)}
                      >
                        {typeLabel}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={levelPillClass(s.influenceLevel)}>
                      {s.influenceLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={levelPillClass(s.interestLevel)}>
                      {s.interestLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">
                      {matrixCellStyle(s.influenceLevel, s.interestLevel).label}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusPillClass(s.status)}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(s);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(s);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {isOpen && (
                  <TableRow key={`${s.id}-details`}>
                    <TableCell colSpan={8} className="bg-muted/30">
                      <div className="grid grid-cols-1 gap-3 py-2 text-sm sm:grid-cols-2">
                        <div>
                          <div className="text-xs font-semibold text-muted-foreground">
                            Contacto
                          </div>
                          <div className="mt-1 space-y-1">
                            <div>
                              <span className="text-muted-foreground">Email:</span>{" "}
                              {s.email || "—"}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Teléfono:</span>{" "}
                              {s.phone || "—"}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-muted-foreground">
                            Comunicación
                          </div>
                          <div className="mt-1 space-y-1">
                            <div>
                              <span className="text-muted-foreground">Frecuencia:</span>{" "}
                              {s.communicationFrequency || "—"}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Canal:</span>{" "}
                              {s.preferredChannel || "—"}
                            </div>
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <div className="text-xs font-semibold text-muted-foreground">
                            Organización
                          </div>
                          <div className="mt-1">{s.organization || "—"}</div>
                        </div>
                        <div className="sm:col-span-2">
                          <div className="text-xs font-semibold text-muted-foreground">
                            Notas
                          </div>
                          <div className="mt-1 whitespace-pre-wrap">
                            {s.notes || "—"}
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <div className="text-xs font-semibold text-muted-foreground">
                            Evaluación de riesgo
                          </div>
                          <div className="mt-1 whitespace-pre-wrap">
                            {s.riskAssessment || "—"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}

          {sorted.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                Sin partes interesadas
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
