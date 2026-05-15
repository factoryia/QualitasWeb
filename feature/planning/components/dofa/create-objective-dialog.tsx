"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useObjectiveCreateMutation,
  useObjectiveStatusesQuery,
} from "@/feature/planning/hooks/use-dofa";

interface CreateObjectiveDialogProps {
  open: boolean;
  analysisId: string;
  onClose: () => void;
  onCreated: (objectiveId: string) => void;
}

export function CreateObjectiveDialog({
  open,
  analysisId,
  onClose,
  onCreated,
}: CreateObjectiveDialogProps) {
  const { data: statuses = [] } = useObjectiveStatusesQuery();
  const createMutation = useObjectiveCreateMutation();

  const today = new Date().toISOString().slice(0, 10);
  const nextYear = `${new Date().getFullYear() + 1}${today.slice(4)}`;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [statusId, setStatusId] = useState<string>("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextYear);

  // Resolve default statusId once the catalog loads (PM-13: prefer PascalCase "Planned" seed)
  const resolvedStatusId =
    statusId ||
    statuses.find((s) => s.code === "Planned")?.id ||
    statuses[0]?.id ||
    "";

  const isValid = name.trim() && resolvedStatusId && startDate && endDate;

  const handleClose = () => {
    setName("");
    setDescription("");
    setStatusId("");
    setStartDate(today);
    setEndDate(nextYear);
    onClose();
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    const result = await createMutation.mutateAsync({
      name: name.trim(),
      description: description.trim() || null,
      statusId: resolvedStatusId,
      startDate: new Date(startDate + "T12:00:00").toISOString(),
      endDate: new Date(endDate + "T12:00:00").toISOString(),
      responsibleId: null,
      analysisId,
    });
    if (result?.id) {
      handleClose();
      onCreated(result.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo objetivo estratégico</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="obj-name">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="obj-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Describe el objetivo en términos medibles..."
              disabled={createMutation.isPending}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="obj-desc">Descripción</Label>
            <Textarea
              id="obj-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="resize-none text-sm"
              disabled={createMutation.isPending}
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label>
              Estado <span className="text-destructive">*</span>
            </Label>
            <Select
              value={resolvedStatusId}
              onValueChange={setStatusId}
              disabled={createMutation.isPending || statuses.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="obj-start">
                Fecha inicio <span className="text-destructive">*</span>
              </Label>
              <Input
                id="obj-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={createMutation.isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="obj-end">
                Fecha fin <span className="text-destructive">*</span>
              </Label>
              <Input
                id="obj-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={createMutation.isPending}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={createMutation.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || createMutation.isPending}>
            {createMutation.isPending ? "Guardando..." : "Crear objetivo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
