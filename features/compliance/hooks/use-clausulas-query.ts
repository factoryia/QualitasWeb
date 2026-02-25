"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  complianceService,
  type ClausulaRequisitoDto,
  type CriterioCumplimientoDto,
  type CreateClausulaRequisitoCommand,
  type UpdateClausulaRequisitoCommand,
  type CreateCriterioCumplimientoCommand,
} from "@/features/compliance/services/compliance.service";
import { getMockClausulasYCriterios } from "@/features/compliance/constants/mock-clausulas";

function useAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const tenant = useAuthStore((s) => s.user?.tenant ?? "root");
  return accessToken ? { accessToken, tenant } : undefined;
}

const clausulasKeys = {
  all: ["compliance", "clausulas"] as const,
  byMarco: (marcoId: string | null) =>
    ["compliance", "clausulas", marcoId] as const,
  detail: (frameworkId: string | null) =>
    ["compliance", "clausulas-detail", frameworkId] as const,
};

/** Si el marco es mock (ej. mock-1), el API puede devolver 400; usamos datos quemados */
function isMockMarcoId(marcoId: string): boolean {
  return marcoId.startsWith("mock-");
}

/** Cláusulas/requisitos de un marco (solo auditables para matriz de cumplimiento) */
export function useClausulasByMarcoQuery(marcoId: string | null) {
  const auth = useAuth();
  return useQuery({
    queryKey: clausulasKeys.byMarco(marcoId),
    queryFn: async (): Promise<ClausulaRequisitoDto[]> => {
      if (!marcoId) return [];
      if (isMockMarcoId(marcoId)) {
        const { clausulas } = getMockClausulasYCriterios(marcoId);
        return clausulas.filter((c) => c.esAuditable);
      }
      try {
        const list = await complianceService.getAllClausulasRequisitos(
          true,
          marcoId,
          auth
        );
        return list.filter((c) => c.esAuditable);
      } catch {
        const { clausulas } = getMockClausulasYCriterios(marcoId);
        return clausulas.filter((c) => c.esAuditable);
      }
    },
    enabled: !!marcoId,
  });
}

export interface ClausulasDetailResult {
  clauses: ClausulaRequisitoDto[];
  criteria: CriterioCumplimientoDto[];
}

/** Todas las cláusulas y criterios de un marco (para detalle / árbol). Invalida al crear/editar/eliminar cláusula. */
export function useClausulasDetailQuery(frameworkId: string | null) {
  const auth = useAuth();
  return useQuery({
    queryKey: clausulasKeys.detail(frameworkId),
    queryFn: async (): Promise<ClausulasDetailResult> => {
      if (!frameworkId) return { clauses: [], criteria: [] };
      if (isMockMarcoId(frameworkId)) {
        const mock = getMockClausulasYCriterios(frameworkId);
        return { clauses: mock.clausulas, criteria: mock.criterios };
      }
      try {
        const clauses = await complianceService.getAllClausulasRequisitos(
          true,
          frameworkId,
          auth
        );
        const criteria: CriterioCumplimientoDto[] = [];
        for (const c of clauses) {
          const crit = await complianceService.getAllCriteriosCumplimiento(
            true,
            c.id,
            auth
          );
          criteria.push(...crit);
        }
        return { clauses, criteria };
      } catch {
        const mock = getMockClausulasYCriterios(frameworkId);
        return { clauses: mock.clausulas, criteria: mock.criterios };
      }
    },
    enabled: !!frameworkId,
  });
}

export function useClausulaCreateMutation() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClausulaRequisitoCommand) =>
      complianceService.createClausulaRequisito(payload, auth),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clausulasKeys.all });
      queryClient.invalidateQueries({
        queryKey: clausulasKeys.detail(variables.marcoNormativoId),
      });
      queryClient.invalidateQueries({
        queryKey: clausulasKeys.byMarco(variables.marcoNormativoId),
      });
    },
  });
}

export function useClausulaUpdateMutation(frameworkId: string | null) {
  const auth = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateClausulaRequisitoCommand;
    }) =>
      complianceService.updateClausulaRequisitoById(id, payload, auth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clausulasKeys.all });
      if (frameworkId) {
        queryClient.invalidateQueries({
          queryKey: clausulasKeys.detail(frameworkId),
        });
        queryClient.invalidateQueries({
          queryKey: clausulasKeys.byMarco(frameworkId),
        });
      }
    },
  });
}

export function useCriterioCumplimientoCreateMutation(frameworkId: string | null) {
  const auth = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCriterioCumplimientoCommand) =>
      complianceService.createCriterioCumplimiento(payload, auth),
    onSuccess: () => {
      if (frameworkId) {
        queryClient.invalidateQueries({
          queryKey: clausulasKeys.detail(frameworkId),
        });
      }
    },
  });
}
