import { api } from "@/lib/axios";
import toast from "react-hot-toast";

const BASE = "/api/v1/qualitas/compliance/lineamientos-mipg";

export interface MipgGuidelineDto {
  id: string;
  policyId: string;
  code: string;
  description: string;
  guidelineType: string;
}

export interface CreateMipgGuidelineCommand {
  policyId: string;
  code: string;
  description: string;
  guidelineType: string;
}

export interface UpdateMipgGuidelineCommand {
  policyId: string;
  code: string;
  description: string;
  guidelineType: string;
}

const isValidGuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

/** GET /api/v1/qualitas/compliance/lineamientos-mipg */
export async function getAllMipgGuidelines(policyId?: string, includeInactive: boolean = false): Promise<MipgGuidelineDto[]> {
  try {
    if (policyId && !isValidGuid(policyId)) {
      console.warn("Invalid policyId format:", policyId);
      return [];
    }
    const params: Record<string, string | boolean> = { includeInactive };
    if (policyId) params.policyId = policyId;
    
    const { data } = await api.get<MipgGuidelineDto[]>(BASE, { params });
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    console.error("Error fetching MIPG guidelines:", error);
    // toast.error("Error al cargar lineamientos MIPG");
    return [];
  }
}

/** GET /api/v1/qualitas/compliance/lineamientos-mipg/{id} */
export async function getMipgGuidelineById(id: string): Promise<MipgGuidelineDto | null> {
  try {
    const { data } = await api.get<MipgGuidelineDto>(`${BASE}/${id}`);
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error fetching MIPG guideline:", error);
    toast.error("Error al cargar lineamiento MIPG");
    return null;
  }
}

/** POST /api/v1/qualitas/compliance/lineamientos-mipg */
export async function createMipgGuideline(payload: CreateMipgGuidelineCommand): Promise<MipgGuidelineDto | null> {
  try {
    const { data } = await api.post<MipgGuidelineDto>(BASE, payload);
    toast.success("Lineamiento creado");
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error creating MIPG guideline:", error);
    toast.error("Error al crear lineamiento MIPG");
    return null;
  }
}

/** PUT /api/v1/qualitas/compliance/lineamientos-mipg/{id} */
export async function updateMipgGuideline(id: string, payload: UpdateMipgGuidelineCommand): Promise<boolean> {
  try {
    await api.put(`${BASE}/${id}`, payload);
    toast.success("Lineamiento actualizado");
    return true;
  } catch (error: unknown) {
    console.error("Error updating MIPG guideline:", error);
    toast.error("Error al actualizar lineamiento MIPG");
    return false;
  }
}

/** DELETE /api/v1/qualitas/compliance/lineamientos-mipg/{id} */
export async function deleteMipgGuideline(id: string): Promise<boolean> {
  try {
    await api.delete(`${BASE}/${id}`);
    toast.success("Lineamiento eliminado");
    return true;
  } catch (error: unknown) {
    console.error("Error deleting MIPG guideline:", error);
    toast.error("Error al eliminar lineamiento MIPG");
    return false;
  }
}
