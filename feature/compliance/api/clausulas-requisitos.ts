import { api } from "@/lib/axios";
import toast from "react-hot-toast";

const BASE = "/api/v1/qualitas/compliance/clausulas-requisitos";

export interface ClausulaRequisitoDto {
  id: string;
  regulatoryFrameworkIds: string[]; // when returned by API
  parentRequirementId: string | null;
  clauseNumber: string;
  title: string;
  description: string | null;
  level?: number;
  requirementType: string;
  isAuditable: boolean;
  isActive?: boolean;
  createdOnUtc?: string | null;
  createdBy?: string | null;
  lastModifiedOnUtc?: string | null;
  lastModifiedBy?: string | null;
}

export interface CreateClausulaRequisitoCommand {
  regulatoryFrameworkId: string;
  parentRequirementId?: string | null;
  clauseNumber: string;
  title: string;
  requirementType: string;
  isAuditable: boolean;
  description?: string | null;
}

export interface UpdateClausulaRequisitoCommand {
  parentRequirementId?: string | null;
  title: string;
  requirementType: string;
  isAuditable: boolean;
  description?: string | null;
}

/** GET /api/v1/qualitas/compliance/clausulas-requisitos */
export async function getAllClausulasRequisitos(
  includeInactive: boolean,
  marcoNormativoId?: string
): Promise<ClausulaRequisitoDto[]> {
  try {
    const params: Record<string, string | boolean> = {
      IncludeInactive: includeInactive,
      ...(marcoNormativoId && { MarcoNormativoId: marcoNormativoId }),
    };
    const { data } = await api.get<ClausulaRequisitoDto[]>(BASE, {
      params,
    });
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    console.error("Error fetching cláusulas/requisitos:", error);
    toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al cargar cláusulas/requisitos");
    return [];
  }
}

/** POST /api/v1/qualitas/compliance/clausulas-requisitos */
export async function createClausulaRequisito(payload: CreateClausulaRequisitoCommand): Promise<ClausulaRequisitoDto | null> {
  try {
    const { data } = await api.post<ClausulaRequisitoDto>(BASE, payload);
    toast.success("Cláusula/requisito creado");
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error creating cláusula/requisito:", error);
    toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al crear cláusula/requisito");
    return null;
  }
}

/** GET /api/v1/qualitas/compliance/clausulas-requisitos/{id} */
export async function getClausulaRequisitoById(id: string): Promise<ClausulaRequisitoDto | null> {
  try {
    const { data } = await api.get<ClausulaRequisitoDto>(`${BASE}/${id}`);
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error fetching cláusula/requisito:", error);
    toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al cargar cláusula/requisito");
    return null;
  }
}

/** PUT /api/v1/qualitas/compliance/clausulas-requisitos/{id} */
export async function updateClausulaRequisitoById(id: string, payload: UpdateClausulaRequisitoCommand): Promise<boolean> {
  try {
    await api.put(`${BASE}/${id}`, payload);
    toast.success("Cláusula/requisito actualizado");
    return true;
  } catch (error: unknown) {
    console.error("Error updating cláusula/requisito:", error);
    toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al actualizar cláusula/requisito");
    return false;
  }
}

/** DELETE /api/v1/qualitas/compliance/clausulas-requisitos/{id} */
export async function deleteClausulaRequisito(id: string): Promise<boolean> {
  try {
    await api.delete(`${BASE}/${id}`);
    toast.success("Cláusula/requisito eliminado");
    return true;
  } catch (error: unknown) {
    console.error("Error deleting cláusula/requisito:", error);
    toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al eliminar cláusula/requisito");
    return false;
  }
}

/** POST /api/v1/qualitas/compliance/clausulas-requisitos/{requirementId}/frameworks */
export async function associateRequirementToFrameworks(
  requirementId: string,
  payload: { regulatoryFrameworkIds: string[] }
): Promise<boolean> {
  try {
    await api.post(`${BASE}/${requirementId}/frameworks`, payload);
    toast.success("Marcos normativos asociados exitosamente");
    return true;
  } catch (error: unknown) {
    console.error("Error associating requirement:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Error al asociar el requisito"
    );
    return false;
  }
}

/** DELETE /api/v1/qualitas/compliance/clausulas-requisitos/{requirementId}/frameworks/{frameworkId} */
export async function disassociateRequirementFromFramework(
  requirementId: string,
  frameworkId: string,
  payload: { deactivationReason: string; deactivatedBy: string; approvedBy?: string | null }
): Promise<boolean> {
  try {
    await api.delete(`${BASE}/${requirementId}/frameworks/${frameworkId}`, {
      data: payload,
    });
    toast.success("Requisito excluido correctamente");
    return true;
  } catch (error: unknown) {
    console.error("Error disassociating requirement:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Error al excluir el requisito"
    );
    return false;
  }
}
