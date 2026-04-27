"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreateDofaAnalysisCommand } from "@/feature/planning/api/dofa";
import { useDofaCreateAnalysisMutation } from "@/feature/planning/hooks/use-dofa";
import { useOrganizationsQuery } from "@/feature/organization/hooks/use-organizations";
import { useAuthStore } from "@/feature/auth/store/auth.store";
import { useUserSearch } from "@/feature/user/hooks/useUserSearch";
import { ENTITY_TYPES } from "./dofa-constants";

// ---------------------------------------------------------------------------
// CreateAnalysisDialog
// ---------------------------------------------------------------------------

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (id: string) => void;
};

export function CreateAnalysisDialog({ open, onOpenChange, onCreated }: Props) {
  const tenantCode = useAuthStore((s) => s.user?.tenant ?? "root");
  const { data: organizations = [] } = useOrganizationsQuery();
  const createMutation = useDofaCreateAnalysisMutation();

  const organization = useMemo(
    () =>
      organizations.find((o) => o.code === tenantCode) ?? organizations[0] ?? null,
    [organizations, tenantCode],
  );

  const { data: usersData, isLoading: usersLoading } = useUserSearch({
    page: 1,
    pageSize: 100,
    isActive: true,
  });

  const [title, setTitle] = useState("");
  const [entityType, setEntityType] = useState("Organization");
  const [period, setPeriod] = useState("");
  const [responsibleId, setResponsibleId] = useState<string>("");

  const reset = () => {
    setTitle("");
    setEntityType("Organization");
    setPeriod("");
    setResponsibleId("");
  };

  const handleCreate = async () => {
    if (!title.trim() || !organization) return;
    const payload: CreateDofaAnalysisCommand = {
      title: title.trim(),
      entityType,
      entityId: organization.id,
      period: period.trim() || null,
      ...(responsibleId ? { responsibleId } : {}),
    };
    const created = await createMutation.mutateAsync(payload);
    if (created?.id) {
      onOpenChange(false);
      reset();
      onCreated(created.id);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo análisis DOFA</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Título <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Ej: Análisis DOFA Q1-2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && title.trim()) handleCreate();
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Tipo de entidad</label>
              <Select value={entityType} onValueChange={setEntityType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Período</label>
              <Input
                placeholder="Ej: 2026"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Responsable</label>
            <Select
              value={responsibleId}
              onValueChange={setResponsibleId}
              disabled={usersLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar responsable" />
              </SelectTrigger>
              <SelectContent>
                {(usersData?.items ?? []).map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              reset();
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || createMutation.isPending || !organization}
          >
            {createMutation.isPending ? "Creando..." : "Crear análisis"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
