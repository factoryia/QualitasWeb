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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COMPLIANCE_STATUSES } from "./ComplianceStatusBadge";
import { X, Plus } from "lucide-react";

export interface ComplianceEditData {
  status: string;
  how_it_complies: string | null;
  linked_processes: string[];
  linked_documents: string[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clauseTitle: string;
  clauseNumber: string;
  initialData: ComplianceEditData;
  onSave: (data: ComplianceEditData) => void | Promise<void>;
  saving: boolean;
}

export function ComplianceEditDialog({
  open,
  onOpenChange,
  clauseTitle,
  clauseNumber,
  initialData,
  onSave,
  saving,
}: Props) {
  const [status, setStatus] = useState(initialData.status);
  const [howItComplies, setHowItComplies] = useState(
    initialData.how_it_complies ?? ""
  );
  const [processes, setProcesses] = useState<string[]>(
    initialData.linked_processes
  );
  const [documents, setDocuments] = useState<string[]>(
    initialData.linked_documents
  );
  const [newProcess, setNewProcess] = useState("");
  const [newDocument, setNewDocument] = useState("");

  useEffect(() => {
    setStatus(initialData.status);
    setHowItComplies(initialData.how_it_complies ?? "");
    setProcesses([...initialData.linked_processes]);
    setDocuments([...initialData.linked_documents]);
  }, [initialData, open]);

  const addProcess = () => {
    if (newProcess.trim()) {
      setProcesses([...processes, newProcess.trim()]);
      setNewProcess("");
    }
  };
  const addDocument = () => {
    if (newDocument.trim()) {
      setDocuments([...documents, newDocument.trim()]);
      setNewDocument("");
    }
  };

  const handleSave = () => {
    onSave({
      status,
      how_it_complies: howItComplies.trim() || null,
      linked_processes: processes,
      linked_documents: documents,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Declaración — {clauseNumber}</DialogTitle>
          <p className="text-sm text-muted-foreground">{clauseTitle}</p>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Estado de Cumplimiento</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMPLIANCE_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Criterios de Cumplimiento</Label>
            <Textarea
              value={howItComplies}
              onChange={(e) => setHowItComplies(e.target.value)}
              placeholder="Describa cómo la organización da respuesta a este requisito..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Procesos Vinculados</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {processes.map((p, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs"
                >
                  {p}{" "}
                  <button
                    type="button"
                    onClick={() =>
                      setProcesses(processes.filter((_, j) => j !== i))
                    }
                    className="hover:opacity-70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newProcess}
                onChange={(e) => setNewProcess(e.target.value)}
                placeholder="Nombre del proceso"
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addProcess())
                }
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addProcess}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Documentos Vinculados</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {documents.map((d, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs"
                >
                  {d}{" "}
                  <button
                    type="button"
                    onClick={() =>
                      setDocuments(documents.filter((_, j) => j !== i))
                    }
                    className="hover:opacity-70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newDocument}
                onChange={(e) => setNewDocument(e.target.value)}
                placeholder="Nombre del documento"
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addDocument())
                }
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addDocument}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={saving} onClick={handleSave}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
