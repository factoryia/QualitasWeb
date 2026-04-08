import { api } from "@/lib/axios";
import toast from "react-hot-toast";

const BASE = "/api/v1/qualitas/compliance/politicas-mipg";

export interface MipgPolicyDto {
  id: string;
  dimensionId: string;
  number: number;
  name: string;
  description?: string;
  rectorEntity: string;
}

export interface CreateMipgPolicyCommand {
  dimensionId: string;
  number: number;
  name: string;
  description?: string;
  rectorEntity: string;
}

export interface UpdateMipgPolicyCommand {
  dimensionId: string;
  number: number;
  name: string;
  description?: string;
  rectorEntity: string;
}

/** GET /api/v1/qualitas/compliance/politicas-mipg */
export async function getAllMipgPolicies(dimensionId?: string): Promise<MipgPolicyDto[]> {
  try {
    const params = dimensionId ? { dimensionId } : undefined;
    const { data } = await api.get<MipgPolicyDto[]>(BASE, { params });
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    console.error("Error fetching MIPG policies:", error);
    toast.error("Error al cargar políticas MIPG");
    return [];
  }
}

/** GET /api/v1/qualitas/compliance/politicas-mipg/{id} */
export async function getMipgPolicyById(id: string): Promise<MipgPolicyDto | null> {
  try {
    const { data } = await api.get<MipgPolicyDto>(`${BASE}/${id}`);
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error fetching MIPG policy:", error);
    toast.error("Error al cargar política MIPG");
    return null;
  }
}

/** POST /api/v1/qualitas/compliance/politicas-mipg */
export async function createMipgPolicy(payload: CreateMipgPolicyCommand): Promise<MipgPolicyDto | null> {
  try {
    const { data } = await api.post<MipgPolicyDto>(BASE, payload);
    toast.success("Política creada");
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error creating MIPG policy:", error);
    toast.error("Error al crear política MIPG");
    return null;
  }
}

/** PUT /api/v1/qualitas/compliance/politicas-mipg/{id} */
export async function updateMipgPolicy(id: string, payload: UpdateMipgPolicyCommand): Promise<boolean> {
  try {
    await api.put(`${BASE}/${id}`, payload);
    toast.success("Política actualizada");
    return true;
  } catch (error: unknown) {
    console.error("Error updating MIPG policy:", error);
    toast.error("Error al actualizar política MIPG");
    return false;
  }
}

/** DELETE /api/v1/qualitas/compliance/politicas-mipg/{id} */
export async function deleteMipgPolicy(id: string): Promise<boolean> {
  try {
    await api.delete(`${BASE}/${id}`);
    toast.success("Política eliminada");
    return true;
  } catch (error: unknown) {
    console.error("Error deleting MIPG policy:", error);
    toast.error("Error al eliminar política MIPG");
    return false;
  }
}
