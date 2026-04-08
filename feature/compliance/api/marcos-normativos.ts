import { api } from "@/lib/axios";
import toast from "react-hot-toast";
import type { ClausulaRequisitoDto } from "./clausulas-requisitos";

const BASE = "/api/v1/qualitas/compliance/marcos-normativos";

export interface MarcoNormativoDto {
  id: string;
  code: string;
  name: string;
  type: string;
  effectiveDate: string;
  isObligatory: boolean;
  version: string | null;
  description: string | null;
  isActive?: boolean;
  createdOnUtc?: string | null;
  createdBy?: string | null;
  lastModifiedOnUtc?: string | null;
  lastModifiedBy?: string | null;
}

export interface CreateMarcoNormativoCommand {
  code: string;
  name: string;
  type: string;
  effectiveDate: string;
  isObligatory: boolean;
  version?: string | null;
  description?: string | null;
}

export interface UpdateMarcoNormativoCommand {
  name: string;
  type: string;
  effectiveDate: string;
  isObligatory: boolean;
  version?: string | null;
  description?: string | null;
}

/** GET /api/v1/qualitas/compliance/marcos-normativos */
export async function getAllMarcosNormativos(includeInactive: boolean): Promise<MarcoNormativoDto[]> {
  try {
    const { data } = await api.get<MarcoNormativoDto[]>(BASE, {
      params: { includeInactive },
    });
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    console.error("Error fetching marcos normativos:", error);
    toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al cargar marcos normativos");
    return [];
  }
}

/** POST /api/v1/qualitas/compliance/marcos-normativos */
export async function createMarcoNormativo(payload: CreateMarcoNormativoCommand): Promise<MarcoNormativoDto | null> {
  try {
    const { data } = await api.post<MarcoNormativoDto>(BASE, payload);
    toast.success("Marco normativo creado");
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error creating marco normativo:", error);
    toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al crear marco normativo");
    return null;
  }
}

/** GET /api/v1/qualitas/compliance/marcos-normativos/{id} */
export async function getMarcoNormativoById(id: string): Promise<MarcoNormativoDto | null> {
  try {
    const { data } = await api.get<MarcoNormativoDto>(`${BASE}/${id}`);
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error fetching marco normativo:", error);
    toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al cargar marco normativo");
    return null;
  }
}

/** PUT /api/v1/qualitas/compliance/marcos-normativos/{id} */
export async function updateMarcoNormativoById(id: string, payload: UpdateMarcoNormativoCommand): Promise<boolean> {
  try {
    await api.put(`${BASE}/${id}`, payload);
    toast.success("Marco normativo actualizado");
    return true;
  } catch (error: unknown) {
    console.error("Error updating marco normativo:", error);
    toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al actualizar marco normativo");
    return false;
  }
}

/** DELETE /api/v1/qualitas/compliance/marcos-normativos/{id} */
export async function deleteMarcoNormativo(id: string): Promise<boolean> {
  try {
    await api.delete(`${BASE}/${id}`);
    toast.success("Marco normativo eliminado");
    return true;
  } catch (error: unknown) {
    console.error("Error deleting marco normativo:", error);
    toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al eliminar marco normativo");
    return false;
  }
}

/** GET /api/v1/qualitas/compliance/marcos-normativos/{frameworkId}/requirements */
export async function getRequirementsByFramework(
  frameworkId: string,
  includeInactive: boolean = false
): Promise<ClausulaRequisitoDto[]> {
  try {
    const { data } = await api.get<ClausulaRequisitoDto[]>(`${BASE}/${frameworkId}/requirements`, {
      params: { includeInactive },
    });
    return Array.isArray(data) ? data : [];
  } catch (error: unknown) {
    console.error("Error fetching requirements by framework:", error);
    toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al cargar requisitos del marco");
    return [];
  }
}
