import { api } from "@/lib/axios";
import toast from "react-hot-toast";

const BASE = "/api/v1/qualitas/compliance/lineamientos-requisitos";

export interface MipgGuidelineRequirementClauseDto {
  id: string;
  mipgGuidelineId: string;
  requirementClauseId: string;
  relationType: string;
  coveragePercentage: number;
  integrationNotes?: string | null;
  isActive?: boolean;
  createdOnUtc?: string | null;
  createdBy?: string | null;
}

export interface CreateMipgGuidelineRequirementClauseCommand {
  mipgGuidelineId: string;
  requirementClauseId: string;
  relationType: string;
  coveragePercentage: number;
  integrationNotes?: string | null;
}

export interface UpdateMipgGuidelineRequirementClauseCommand {
  relationType: string;
  coveragePercentage: number;
  integrationNotes?: string | null;
}

/** GET /api/v1/qualitas/compliance/lineamientos-requisitos */
export async function getMipgGuidelineRequirements(
  mipgGuidelineId?: string,
  requirementClauseId?: string,
  includeInactive: boolean = false
): Promise<MipgGuidelineRequirementClauseDto[]> {
  try {
    const params: Record<string, string | boolean> = { includeInactive };
    if (mipgGuidelineId) params.mipgGuidelineId = mipgGuidelineId;
    if (requirementClauseId) params.requirementClauseId = requirementClauseId;
    
    const { data } = await api.get<MipgGuidelineRequirementClauseDto[]>(BASE, { params });
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    console.error("Error fetching MIPG guideline requirements:", error);
    // toast.error("Error al cargar relaciones MIPG-Requisitos");
    return [];
  }
}

/** GET /api/v1/qualitas/compliance/lineamientos-requisitos/{id} */
export async function getMipgGuidelineRequirementById(id: string): Promise<MipgGuidelineRequirementClauseDto | null> {
  try {
    const { data } = await api.get<MipgGuidelineRequirementClauseDto>(`${BASE}/${id}`);
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error fetching MIPG guideline requirement:", error);
    toast.error("Error al cargar relación MIPG-Requisito");
    return null;
  }
}

/** POST /api/v1/qualitas/compliance/lineamientos-requisitos */
export async function createMipgGuidelineRequirement(
  payload: CreateMipgGuidelineRequirementClauseCommand
): Promise<MipgGuidelineRequirementClauseDto | null> {
  try {
    const { data } = await api.post<MipgGuidelineRequirementClauseDto>(BASE, payload);
    toast.success("Relación creada");
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error creating MIPG guideline requirement:", error);
    toast.error("Error al crear relación MIPG-Requisito");
    return null;
  }
}

/** PUT /api/v1/qualitas/compliance/lineamientos-requisitos/{id} */
export async function updateMipgGuidelineRequirement(
  id: string,
  payload: UpdateMipgGuidelineRequirementClauseCommand
): Promise<boolean> {
  try {
    await api.put(`${BASE}/${id}`, payload);
    toast.success("Relación actualizada");
    return true;
  } catch (error: unknown) {
    console.error("Error updating MIPG guideline requirement:", error);
    toast.error("Error al actualizar relación MIPG-Requisito");
    return false;
  }
}

/** DELETE /api/v1/qualitas/compliance/lineamientos-requisitos/{id} */
export async function deleteMipgGuidelineRequirement(id: string): Promise<boolean> {
  try {
    await api.delete(`${BASE}/${id}`);
    toast.success("Relación eliminada");
    return true;
  } catch (error: unknown) {
    console.error("Error deleting MIPG guideline requirement:", error);
    toast.error("Error al eliminar relación MIPG-Requisito");
    return false;
  }
}
