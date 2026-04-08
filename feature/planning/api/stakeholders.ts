import { api } from "@/lib/axios";
import toast from "react-hot-toast";
import type { StakeholderTypeDto } from "./stakeholder-types";

const BASE = "/api/v1/qualitas/strategic/stakeholders";

export interface StakeholderDto {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  organization: string | null;
  stakeholderTypeId: string;
  stakeholderType: StakeholderTypeDto | null;
  ownerOrganizationUnitId: string | null;
  relatedUserId: string | null;
  influenceLevel: string;
  interestLevel: string;
  communicationFrequency: string;
  preferredChannel: string | null;
  status: string;
  isActive: boolean;
  notes: string | null;
  riskAssessment: string | null;
  createdOnUtc: string;
  createdBy: string | null;
  lastModifiedOnUtc: string | null;
  lastModifiedBy: string | null;
}

export interface CreateStakeholderRequest {
  name: string;
  stakeholderTypeId: string;
  email?: string | null;
  phone?: string | null;
  organization?: string | null;
  ownerOrganizationUnitId?: string | null;
  relatedUserId?: string | null;
  influenceLevel: string;
  interestLevel: string;
  communicationFrequency: string;
  preferredChannel?: string | null;
  notes?: string | null;
  riskAssessment?: string | null;
}

export interface UpdateStakeholderRequest {
  name: string;
  email?: string | null;
  phone?: string | null;
  organization?: string | null;
  influenceLevel: string;
  interestLevel: string;
  communicationFrequency: string;
  preferredChannel?: string | null;
  ownerOrganizationUnitId?: string | null;
  notes?: string | null;
  riskAssessment?: string | null;
}

export async function getStakeholders(): Promise<StakeholderDto[]> {
  try {
    const { data } = await api.get<StakeholderDto[]>(BASE);
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    console.error("Error fetching stakeholders:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar partes interesadas",
    );
    return [];
  }
}

export async function getStakeholderById(
  id: string,
): Promise<StakeholderDto | null> {
  try {
    const { data } = await api.get<StakeholderDto>(`${BASE}/${id}`);
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error fetching stakeholder:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar parte interesada",
    );
    return null;
  }
}

export async function createStakeholder(
  payload: CreateStakeholderRequest,
): Promise<StakeholderDto | null> {
  try {
    const { data } = await api.post<StakeholderDto>(BASE, payload);
    toast.success("Parte interesada creada");
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error creating stakeholder:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al crear parte interesada",
    );
    return null;
  }
}

export async function updateStakeholderById(
  id: string,
  payload: UpdateStakeholderRequest,
): Promise<StakeholderDto | null> {
  try {
    const { data } = await api.put<StakeholderDto>(`${BASE}/${id}`, payload);
    toast.success("Parte interesada actualizada");
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error updating stakeholder:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al actualizar parte interesada",
    );
    return null;
  }
}

export async function deleteStakeholderById(id: string): Promise<boolean> {
  try {
    await api.delete(`${BASE}/${id}`);
    toast.success("Parte interesada eliminada");
    return true;
  } catch (error: unknown) {
    console.error("Error deleting stakeholder:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al eliminar parte interesada",
    );
    return false;
  }
}

