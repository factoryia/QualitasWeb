"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllMarcosNormativos, MarcoNormativoDto } from "../../api/marcos-normativos";
import { getAllClausulasRequisitos, ClausulaRequisitoDto } from "../../api/clausulas-requisitos";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    frameworkId: string;
    clauseId: string;
    justification: string;
    frameworkName: string;
    clauseNumber: string;
    clauseTitle: string;
    status: "Aplica" | "No aplica";
  }) => void | Promise<void>;
  saving?: boolean;
}

export function ExclusionAddDialog({
  open,
  onOpenChange,
  onSubmit,
  saving = false,
}: Props) {
  const [frameworks, setFrameworks] = useState<MarcoNormativoDto[]>([]);
  const [clauses, setClauses] = useState<ClausulaRequisitoDto[]>([]);
  const [loadingFrameworks, setLoadingFrameworks] = useState(false);
  const [loadingClauses, setLoadingClauses] = useState(false);

  const [frameworkId, setFrameworkId] = useState("");
  const [clauseId, setClauseId] = useState("");
  const [justification, setJustification] = useState("");
  const [status, setStatus] = useState<"Aplica" | "No aplica">("No aplica");

  useEffect(() => {
    if (open) {
      loadFrameworks();
      setFrameworkId("");
      setClauseId("");
      setJustification("");
      setStatus("No aplica");
      setClauses([]);
    }
  }, [open]);

  useEffect(() => {
    if (frameworkId) {
      // Cargar todas las cláusulas (incluso inactivas/excluidas) para poder reactivarlas si se selecciona "Aplica"
      // O para excluirlas si se selecciona "Excluido"
      loadClauses(frameworkId);
      setClauseId("");
    } else {
      setClauses([]);
    }
  }, [frameworkId]);

  const loadFrameworks = async () => {
    setLoadingFrameworks(true);
    try {
      const data = await getAllMarcosNormativos(false);
      setFrameworks(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar marcos normativos");
    } finally {
      setLoadingFrameworks(false);
    }
  };

  const loadClauses = async (fwId: string) => {
    setLoadingClauses(true);
    try {
      // Cargamos includeInactive=true para ver todo lo que pertenece al marco
      // Esto permite seleccionar algo que ya está excluido para volverlo a "Aplica"
      // O seleccionar algo activo para pasarlo a "Excluido"
      const data = await getAllClausulasRequisitos(true, fwId);
      setClauses(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar cláusulas");
    } finally {
      setLoadingClauses(false);
    }
  };

  const handleSubmit = () => {
    if (!frameworkId || !clauseId) return;
    
    // Si es excluido, la justificación es obligatoria
    if (status === "No aplica" && !justification.trim()) {
        toast.error("La justificación es obligatoria cuando no aplica");
        return;
    }

    const selectedFramework = frameworks.find((f) => f.id === frameworkId);
    const selectedClause = clauses.find((c) => c.id === clauseId);

    if (!selectedFramework || !selectedClause) return;

    onSubmit({
      frameworkId,
      clauseId,
      justification,
      frameworkName: selectedFramework.name,
      clauseNumber: selectedClause.clauseNumber,
      clauseTitle: selectedClause.title,
      status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Declaración de Aplicabilidad</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Marco Normativo</Label>
            <Select
              value={frameworkId}
              onValueChange={setFrameworkId}
              disabled={loadingFrameworks || saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un marco..." />
              </SelectTrigger>
              <SelectContent>
                {frameworks.map((fw) => (
                  <SelectItem key={fw.id} value={fw.id}>
                    {fw.code} - {fw.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cláusula / Requisito</Label>
            <Select
              value={clauseId}
              onValueChange={setClauseId}
              disabled={!frameworkId || loadingClauses || saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione un requisito..." />
              </SelectTrigger>
              <SelectContent>
                {clauses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.clauseNumber} - {c.title}
                    {!c.isActive && " (Excluido)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val as "Aplica" | "No aplica")}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Aplica">Aplica</SelectItem>
                <SelectItem value="No aplica">No aplica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {status === "No aplica" && (
            <div className="space-y-2">
              <Label>Justificación de No Aplicabilidad</Label>
              <Textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Explique por qué este requisito no aplica a la organización..."
                rows={4}
                disabled={saving}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              saving || !frameworkId || !clauseId || (status === "No aplica" && !justification.trim())
            }
          >
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
