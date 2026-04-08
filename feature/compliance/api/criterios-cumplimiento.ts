import { api } from "@/lib/axios";
import toast from "react-hot-toast";

const BASE = "/api/v1/qualitas/compliance/criterios-cumplimiento";

export interface CriterioCumplimientoDto {
  id: string;
  requirementClauseId: string;
  code: string;
  description: string;
  evidenceType: string;
  verificationFrequency: string;
  weightedScore: number;
  isCritical: boolean;
  isActive?: boolean;
  createdOnUtc?: string | null;
  createdBy?: string | null;
  lastModifiedOnUtc?: string | null;
  lastModifiedBy?: string | null;
}

export interface CreateCriterioCumplimientoCommand {
  requirementClauseId: string;
  code: string;
  description: string;
  evidenceType: string;
  verificationFrequency: string;
  weightedScore: number;
  isCritical: boolean;
}

export interface UpdateCriterioCumplimientoCommand {
  description: string;
  evidenceType: string;
  verificationFrequency: string;
  weightedScore: number;
  isCritical: boolean;
}

/** GET /api/v1/qualitas/compliance/criterios-cumplimiento */
export async function getAllCriteriosCumplimiento(
  includeInactive: boolean,
  clausulaRequisitoId?: string
): Promise<CriterioCumplimientoDto[]> {
  try {
    const params: Record<string, string | boolean> = { includeInactive };
    if (clausulaRequisitoId) params.clausulaRequisitoId = clausulaRequisitoId;
    const { data } = await api.get<CriterioCumplimientoDto[]>(BASE, {
      params,
    });
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    console.error("Error fetching criterios de cumplimiento:", error);
    toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al cargar criterios de cumplimiento");
    return [];
  }
}

/** POST /api/v1/qualitas/compliance/criterios-cumplimiento */
export async function createCriterioCumplimiento(payload: CreateCriterioCumplimientoCommand): Promise<CriterioCumplimientoDto | null> {
  try {
    const { data } = await api.post<CriterioCumplimientoDto>(BASE, payload);
    toast.success("Criterio de cumplimiento creado");
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error creating criterio de cumplimiento:", error);
    toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al crear criterio de cumplimiento");
    return null;
  }
}

/** GET /api/v1/qualitas/compliance/criterios-cumplimiento/{id} */
export async function getCriterioCumplimientoById(id: string): Promise<CriterioCumplimientoDto | null> {
  try {
    const { data } = await api.get<CriterioCumplimientoDto>(`${BASE}/${id}`);
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error fetching criterio de cumplimiento:", error);
    toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al cargar criterio de cumplimiento");
    return null;
  }
}

/** PUT /api/v1/qualitas/compliance/criterios-cumplimiento/{id} */
export async function updateCriterioCumplimientoById(id: string, payload: UpdateCriterioCumplimientoCommand): Promise<boolean> {
  try {
    await api.put(`${BASE}/${id}`, payload);
    toast.success("Criterio de cumplimiento actualizado");
    return true;
  } catch (error: unknown) {
    console.error("Error updating criterio de cumplimiento:", error);
    toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al actualizar criterio de cumplimiento");
    return false;
  }
}

/** DELETE /api/v1/qualitas/compliance/criterios-cumplimiento/{id} */
export async function deleteCriterioCumplimiento(id: string): Promise<boolean> {
  try {
    await api.delete(`${BASE}/${id}`);
    toast.success("Criterio de cumplimiento eliminado");
    return true;
  } catch (error: unknown) {
    console.error("Error deleting criterio de cumplimiento:", error);
    toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al eliminar criterio de cumplimiento");
    return false;
  }
}
