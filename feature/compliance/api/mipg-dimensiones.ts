import { api } from "@/lib/axios";
import toast from "react-hot-toast";

const BASE = "/api/v1/qualitas/compliance/dimensiones-mipg";

export interface MipgDimensionDto {
  id: string;
  number: number;
  name: string;
  description?: string;
  colorHex: string;
  isTransversal: boolean;
}

export interface CreateMipgDimensionCommand {
  number: number;
  name: string;
  description?: string;
  colorHex: string;
  isTransversal: boolean;
}

export interface UpdateMipgDimensionCommand {
  number: number;
  name: string;
  description?: string;
  colorHex: string;
  isTransversal: boolean;
}

/** GET /api/v1/qualitas/compliance/dimensiones-mipg */
export async function getAllMipgDimensions(): Promise<MipgDimensionDto[]> {
  try {
    const { data } = await api.get<MipgDimensionDto[]>(BASE);
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    console.error("Error fetching MIPG dimensions:", error);
    toast.error("Error al cargar dimensiones MIPG");
    return [];
  }
}

/** GET /api/v1/qualitas/compliance/dimensiones-mipg/{id} */
export async function getMipgDimensionById(id: string): Promise<MipgDimensionDto | null> {
  try {
    const { data } = await api.get<MipgDimensionDto>(`${BASE}/${id}`);
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error fetching MIPG dimension:", error);
    toast.error("Error al cargar dimensión MIPG");
    return null;
  }
}

/** POST /api/v1/qualitas/compliance/dimensiones-mipg */
export async function createMipgDimension(payload: CreateMipgDimensionCommand): Promise<MipgDimensionDto | null> {
  try {
    const { data } = await api.post<MipgDimensionDto>(BASE, payload);
    toast.success("Dimensión creada");
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error creating MIPG dimension:", error);
    toast.error("Error al crear dimensión MIPG");
    return null;
  }
}

/** PUT /api/v1/qualitas/compliance/dimensiones-mipg/{id} */
export async function updateMipgDimension(id: string, payload: UpdateMipgDimensionCommand): Promise<boolean> {
  try {
    await api.put(`${BASE}/${id}`, payload);
    toast.success("Dimensión actualizada");
    return true;
  } catch (error: unknown) {
    console.error("Error updating MIPG dimension:", error);
    toast.error("Error al actualizar dimensión MIPG");
    return false;
  }
}

/** DELETE /api/v1/qualitas/compliance/dimensiones-mipg/{id} */
export async function deleteMipgDimension(id: string): Promise<boolean> {
  try {
    await api.delete(`${BASE}/${id}`);
    toast.success("Dimensión eliminada");
    return true;
  } catch (error: unknown) {
    console.error("Error deleting MIPG dimension:", error);
    toast.error("Error al eliminar dimensión MIPG");
    return false;
  }
}
