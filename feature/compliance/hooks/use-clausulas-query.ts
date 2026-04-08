"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllClausulasRequisitos,
  createClausulaRequisito,
  updateClausulaRequisitoById,
  type ClausulaRequisitoDto,
  type CreateClausulaRequisitoCommand,
  type UpdateClausulaRequisitoCommand,
} from "@/feature/compliance/api/clausulas-requisitos";
import {
  getAllCriteriosCumplimiento,
  createCriterioCumplimiento,
  type CriterioCumplimientoDto,
  type CreateCriterioCumplimientoCommand,
} from "@/feature/compliance/api/criterios-cumplimiento";

const clausulasKeys = {
  all: ["compliance", "clausulas"] as const,
  byMarco: (marcoId: string | null) =>
    ["compliance", "clausulas", marcoId] as const,
  detail: (frameworkId: string | null) =>
    ["compliance", "clausulas-detail", frameworkId] as const,
};

/** Cláusulas/requisitos de un marco (solo auditables para matriz de cumplimiento) */
export function useClausulasByMarcoQuery(marcoId: string | null) {
  return useQuery({
    queryKey: clausulasKeys.byMarco(marcoId),
    queryFn: async (): Promise<ClausulaRequisitoDto[]> => {
      if (!marcoId) return [];
      try {
        const list = await getAllClausulasRequisitos(true, marcoId);
        return list.filter((c) => c.isAuditable);
      } catch {
        return [];
      }
    },
    enabled: !!marcoId,
  });
}

export function useAllClausulasQuery() {
  return useQuery({
    queryKey: ["compliance", "clausulas", "all"],
    queryFn: async (): Promise<ClausulaRequisitoDto[]> => {
      return await getAllClausulasRequisitos(true);
    },
  });
}

export interface ClausulasDetailResult {
  clauses: ClausulaRequisitoDto[];
  criteria: CriterioCumplimientoDto[];
}

/** Todas las cláusulas y criterios de un marco (para detalle / árbol). Invalida al crear/editar/eliminar cláusula. */
export function useClausulasDetailQuery(frameworkId: string | null) {
  return useQuery({
    queryKey: clausulasKeys.detail(frameworkId),
    queryFn: async (): Promise<ClausulasDetailResult> => {
      if (!frameworkId) return { clauses: [], criteria: [] };
      try {
        const clauses = await getAllClausulasRequisitos(true, frameworkId);
        const criteria: CriterioCumplimientoDto[] = [];
        // Optimización: Podríamos hacer Promise.all si hay muchas cláusulas, pero cuidado con el límite de conexiones.
        // O mejor, tener un endpoint que traiga todo junto. Por ahora, loop secuencial o paralelo limitado.
        const criteriaPromises = clauses.map((c) =>
          getAllCriteriosCumplimiento(true, c.id)
        );
        const criteriaResults = await Promise.all(criteriaPromises);
        criteriaResults.forEach((crit) => criteria.push(...crit));

        return { clauses, criteria };
      } catch {
        return { clauses: [], criteria: [] };
      }
    },
    enabled: !!frameworkId,
  });
}

export function useClausulaCreateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClausulaRequisitoCommand) =>
      createClausulaRequisito(payload),
    onSuccess: (_, variables) => {
      // Invalidar query de detalle para recargar el árbol
      // Nota: Para invalidar correctamente necesitamos el frameworkId.
      if (variables.regulatoryFrameworkId) {
        queryClient.invalidateQueries({
          queryKey: clausulasKeys.detail(variables.regulatoryFrameworkId),
        });
      }
      queryClient.invalidateQueries({ queryKey: clausulasKeys.all });
    },
  });
}

export function useClausulaUpdateMutation(frameworkId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateClausulaRequisitoCommand;
    }) => updateClausulaRequisitoById(id, payload),
    onSuccess: () => {
      if (frameworkId) {
        queryClient.invalidateQueries({
          queryKey: clausulasKeys.detail(frameworkId),
        });
      }
      queryClient.invalidateQueries({ queryKey: clausulasKeys.all });
    },
  });
}

export function useCriterioCumplimientoCreateMutation(
  frameworkId: string | null
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCriterioCumplimientoCommand) =>
      createCriterioCumplimiento(payload),
    onSuccess: () => {
      if (frameworkId) {
        queryClient.invalidateQueries({
          queryKey: clausulasKeys.detail(frameworkId),
        });
      }
    },
  });
}
