import { api } from "@/lib/axios";
import toast from "react-hot-toast";

const BASE = "/api/v1/qualitas/strategic/stakeholder-types";

export interface StakeholderTypeDto {
  id: string;
  code: string;
  name: string;
  description: string | null;
  classification: string;
  order: number;
  isActive: boolean;
  createdOnUtc: string;
  createdBy: string | null;
  lastModifiedOnUtc: string | null;
  lastModifiedBy: string | null;
}

export interface CreateStakeholderTypeRequest {
  code: string;
  name: string;
  description?: string | null;
  classification: string;
  order: number;
}

export interface UpdateStakeholderTypeRequest {
  name: string;
  description?: string | null;
  classification: string;
  order: number;
}

export async function getStakeholderTypes(): Promise<StakeholderTypeDto[]> {
  try {
    const { data } = await api.get<StakeholderTypeDto[]>(BASE);
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    console.error("Error fetching stakeholder types:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar tipos de parte interesada",
    );
    return [];
  }
}

export async function getStakeholderTypeById(
  id: string,
): Promise<StakeholderTypeDto | null> {
  try {
    const { data } = await api.get<StakeholderTypeDto>(`${BASE}/${id}`);
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error fetching stakeholder type:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar tipo de parte interesada",
    );
    return null;
  }
}

export async function createStakeholderType(
  payload: CreateStakeholderTypeRequest,
): Promise<StakeholderTypeDto | null> {
  try {
    const { data } = await api.post<StakeholderTypeDto>(BASE, payload);
    toast.success("Tipo creado");
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error creating stakeholder type:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al crear tipo",
    );
    return null;
  }
}

export async function updateStakeholderTypeById(
  id: string,
  payload: UpdateStakeholderTypeRequest,
): Promise<StakeholderTypeDto | null> {
  try {
    const { data } = await api.put<StakeholderTypeDto>(`${BASE}/${id}`, payload);
    toast.success("Tipo actualizado");
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error updating stakeholder type:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al actualizar tipo",
    );
    return null;
  }
}

export async function deleteStakeholderTypeById(id: string): Promise<boolean> {
  try {
    await api.delete(`${BASE}/${id}`);
    toast.success("Tipo eliminado");
    return true;
  } catch (error: unknown) {
    console.error("Error deleting stakeholder type:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al eliminar tipo",
    );
    return false;
  }
}

