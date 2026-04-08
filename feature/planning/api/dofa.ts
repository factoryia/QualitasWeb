import { api } from "@/lib/axios";
import toast from "react-hot-toast";

export const DEFAULT_DOFA_PERSPECTIVES = [
  "Financiero",
  "Cliente",
  "ProcesosInternos",
  "AprendizajeYCrecimiento",
  "CruceEstrategico",
] as const;

export const DEFAULT_DOFA_CATEGORIES = [
  "Fortaleza",
  "Debilidad",
  "Oportunidad",
  "Amenaza",
] as const;

export const DEFAULT_DOFA_PRIORITIES = ["Alta", "Media", "Baja"] as const;

export const DEFAULT_DOFA_IMPACT_LEVELS = ["Alto", "Medio", "Bajo"] as const;

export type DofaPerspective = string;
export type DofaCategory = string;
export type DofaPriority = string;
export type DofaImpactLevel = string;

export interface DofaAnalysisListDto {
  id: string;
  title: string;
  description?: string | null;
  analysisDate?: string | null;
  period?: string | null;
  version?: string | null;
  status?: string | null;
  entityType?: string | null;
  entityId?: string | null;
}

export interface DofaItemDto {
  id: string;
  perspective: DofaPerspective;
  category: DofaCategory;
  description: string;
  priority: DofaPriority;
  impactLevel?: DofaImpactLevel | null;
  order: number;
  isActive: boolean;
  responsibleId?: string | null;
}

export interface DofaAnalysisDto {
  id: string;
  title: string;
  description?: string | null;
  analysisDate?: string | null;
  period?: string | null;
  version?: string | null;
  status?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  items: DofaItemDto[];
}

export interface CreateDofaAnalysisCommand {
  title: string;
  entityType: string;
  entityId: string;
  description?: string | null;
  period?: string | null;
}

export interface CreateDofaItemCommand {
  perspective: DofaPerspective;
  category: DofaCategory;
  description: string;
  priority: DofaPriority;
  impactLevel?: DofaImpactLevel | null;
  order: number;
  responsibleId?: string | null;
}

export interface UpdateDofaItemCommand {
  perspective: DofaPerspective;
  category: DofaCategory;
  description: string;
  priority: DofaPriority;
  impactLevel?: DofaImpactLevel | null;
  order: number;
  responsibleId?: string | null;
  isActive?: boolean;
}

const BASE = "/api/v1/qualitas/strategic/dofa";

function extractArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const items = (data as { items?: unknown }).items;
    if (Array.isArray(items)) return items as T[];
  }
  return [];
}

export async function listDofaAnalyses(): Promise<DofaAnalysisListDto[]> {
  try {
    const { data } = await api.get<unknown>(BASE);
    return extractArray<DofaAnalysisListDto>(data);
  } catch (error: unknown) {
    console.error("Error fetching DOFA analyses:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar los análisis DOFA",
    );
    return [];
  }
}

export async function createDofaAnalysis(
  payload: CreateDofaAnalysisCommand,
): Promise<{ id: string } | null> {
  try {
    const { data } = await api.post<{ id: string }>(BASE, payload);
    toast.success("Análisis DOFA creado");
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error creating DOFA analysis:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al crear el análisis DOFA",
    );
    return null;
  }
}

export async function getDofaAnalysisById(
  analysisId: string,
): Promise<DofaAnalysisDto | null> {
  try {
    const { data } = await api.get<DofaAnalysisDto>(`${BASE}/${analysisId}`);
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error fetching DOFA analysis:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar el análisis DOFA",
    );
    return null;
  }
}

export async function deleteDofaAnalysis(analysisId: string): Promise<boolean> {
  try {
    await api.delete(`${BASE}/${analysisId}`);
    toast.success("Análisis DOFA eliminado");
    return true;
  } catch (error: unknown) {
    console.error("Error deleting DOFA analysis:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al eliminar el análisis DOFA",
    );
    return false;
  }
}

export async function createDofaItem(
  analysisId: string,
  payload: CreateDofaItemCommand,
): Promise<{ id: string } | null> {
  try {
    const { data } = await api.post<{ id: string }>(
      `${BASE}/${analysisId}/items`,
      payload,
    );
    toast.success("Ítem DOFA creado");
    return data ?? null;
  } catch (error: unknown) {
    console.error("Error creating DOFA item:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al crear el ítem DOFA",
    );
    return null;
  }
}

export async function updateDofaItem(
  analysisId: string,
  itemId: string,
  payload: UpdateDofaItemCommand,
): Promise<boolean> {
  try {
    await api.put(`${BASE}/${analysisId}/items/${itemId}`, payload);
    toast.success("Ítem DOFA actualizado");
    return true;
  } catch (error: unknown) {
    console.error("Error updating DOFA item:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al actualizar el ítem DOFA",
    );
    return false;
  }
}

export async function deactivateDofaItem(
  analysisId: string,
  itemId: string,
): Promise<boolean> {
  try {
    await api.delete(`${BASE}/${analysisId}/items/${itemId}`);
    toast.success("Ítem DOFA desactivado");
    return true;
  } catch (error: unknown) {
    console.error("Error deactivating DOFA item:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al desactivar el ítem DOFA",
    );
    return false;
  }
}
