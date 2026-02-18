import { api } from "@/services/axios/axios.client";
import toast from "react-hot-toast";
import { useAuthStore } from "@/features/auth/store/auth.store";

export type AuthHeaders = { accessToken: string; tenant?: string };

function authHeaders(auth?: AuthHeaders): Record<string, string> | undefined {
  if (!auth?.accessToken) return undefined;
  const h: Record<string, string> = { Authorization: `Bearer ${auth.accessToken}` };
  if (auth.tenant) h.tenant = auth.tenant;
  return h;
}

const authFromStore = (): AuthHeaders | undefined => {
  const token = useAuthStore.getState().accessToken;
  const tenant = useAuthStore.getState().user?.tenant ?? "root";
  return token ? { accessToken: token, tenant } : undefined;
};

// --- Marcos Normativos ---

export interface MarcoNormativoDto {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  fechaVigencia: string;
  esObligatorio: boolean;
  version: string | null;
  descripcion: string | null;
  isActive?: boolean;
  createdOnUtc?: string | null;
  createdBy?: string | null;
  lastModifiedOnUtc?: string | null;
  lastModifiedBy?: string | null;
}

export interface CreateMarcoNormativoCommand {
  codigo: string;
  nombre: string;
  tipo: string;
  fechaVigencia: string;
  esObligatorio: boolean;
  version?: string | null;
  descripcion?: string | null;
}

export interface UpdateMarcoNormativoCommand {
  nombre: string;
  tipo: string;
  fechaVigencia: string;
  esObligatorio: boolean;
  version?: string | null;
  descripcion?: string | null;
}

// --- Cláusulas/Requisitos ---

export interface ClausulaRequisitoDto {
  id: string;
  marcoNormativoId: string;
  numeroClausula: string;
  titulo: string;
  tipoRequisito: string;
  esAuditable: boolean;
  clausulaPadreId: string | null;
  descripcion: string | null;
  isActive?: boolean;
  createdOnUtc?: string | null;
  createdBy?: string | null;
  lastModifiedOnUtc?: string | null;
  lastModifiedBy?: string | null;
}

export interface CreateClausulaRequisitoCommand {
  marcoNormativoId: string;
  numeroClausula: string;
  titulo: string;
  tipoRequisito: string;
  esAuditable: boolean;
  clausulaPadreId?: string | null;
  descripcion?: string | null;
}

export interface UpdateClausulaRequisitoCommand {
  titulo: string;
  tipoRequisito: string;
  esAuditable: boolean;
  clausulaPadreId?: string | null;
  descripcion?: string | null;
}

// --- Criterios de Cumplimiento ---

export interface CriterioCumplimientoDto {
  id: string;
  clausulaRequisitoId: string;
  codigo: string;
  descripcion: string;
  tipoEvidencia: string;
  frecuenciaVerificacion: string;
  pesoPonderacion: number;
  isActive?: boolean;
  createdOnUtc?: string | null;
  createdBy?: string | null;
  lastModifiedOnUtc?: string | null;
  lastModifiedBy?: string | null;
}

export interface CreateCriterioCumplimientoCommand {
  clausulaRequisitoId: string;
  codigo: string;
  descripcion: string;
  tipoEvidencia: string;
  frecuenciaVerificacion: string;
  pesoPonderacion: number;
}

export interface UpdateCriterioCumplimientoCommand {
  descripcion: string;
  tipoEvidencia: string;
  frecuenciaVerificacion: string;
  pesoPonderacion: number;
}

const BASE = "/api/v1/qualitas/compliance";

class ComplianceService {
  // --- Marcos Normativos ---

  /** GET /api/v1/qualitas/compliance/marcos-normativos */
  async getAllMarcosNormativos(includeInactive: boolean, auth?: AuthHeaders): Promise<MarcoNormativoDto[]> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      const { data } = await api.get<MarcoNormativoDto[]>(`${BASE}/marcos-normativos`, {
        params: { includeInactive },
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      return Array.isArray(data) ? data : [];
    } catch (error: unknown) {
      console.error("Error fetching marcos normativos:", error);
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al cargar marcos normativos");
      return [];
    }
  }

  /** POST /api/v1/qualitas/compliance/marcos-normativos */
  async createMarcoNormativo(payload: CreateMarcoNormativoCommand, auth?: AuthHeaders): Promise<MarcoNormativoDto | null> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      const { data } = await api.post<MarcoNormativoDto>(`${BASE}/marcos-normativos`, payload, {
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      toast.success("Marco normativo creado");
      return data ?? null;
    } catch (error: unknown) {
      console.error("Error creating marco normativo:", error);
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al crear marco normativo");
      return null;
    }
  }

  /** GET /api/v1/qualitas/compliance/marcos-normativos/{id} */
  async getMarcoNormativoById(id: string, auth?: AuthHeaders): Promise<MarcoNormativoDto | null> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      const { data } = await api.get<MarcoNormativoDto>(`${BASE}/marcos-normativos/${id}`, {
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      return data ?? null;
    } catch (error: unknown) {
      console.error("Error fetching marco normativo:", error);
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al cargar marco normativo");
      return null;
    }
  }

  /** PUT /api/v1/qualitas/compliance/marcos-normativos/{id} */
  async updateMarcoNormativoById(id: string, payload: UpdateMarcoNormativoCommand, auth?: AuthHeaders): Promise<boolean> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      await api.put(`${BASE}/marcos-normativos/${id}`, payload, {
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      toast.success("Marco normativo actualizado");
      return true;
    } catch (error: unknown) {
      console.error("Error updating marco normativo:", error);
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al actualizar marco normativo");
      return false;
    }
  }

  /** DELETE /api/v1/qualitas/compliance/marcos-normativos/{id} */
  async deleteMarcoNormativo(id: string, auth?: AuthHeaders): Promise<boolean> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      await api.delete(`${BASE}/marcos-normativos/${id}`, {
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      toast.success("Marco normativo eliminado");
      return true;
    } catch (error: unknown) {
      console.error("Error deleting marco normativo:", error);
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al eliminar marco normativo");
      return false;
    }
  }

  // --- Cláusulas/Requisitos ---

  /** GET /api/v1/qualitas/compliance/clausulas-requisitos */
  async getAllClausulasRequisitos(
    includeInactive: boolean,
    marcoNormativoId?: string,
    auth?: AuthHeaders
  ): Promise<ClausulaRequisitoDto[]> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      const params: Record<string, string | boolean> = { includeInactive };
      if (marcoNormativoId) params.marcoNormativoId = marcoNormativoId;
      const { data } = await api.get<ClausulaRequisitoDto[]>(`${BASE}/clausulas-requisitos`, {
        params,
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      return Array.isArray(data) ? data : [];
    } catch (error: unknown) {
      console.error("Error fetching cláusulas/requisitos:", error);
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al cargar cláusulas/requisitos");
      return [];
    }
  }

  /** POST /api/v1/qualitas/compliance/clausulas-requisitos */
  async createClausulaRequisito(payload: CreateClausulaRequisitoCommand, auth?: AuthHeaders): Promise<ClausulaRequisitoDto | null> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      const { data } = await api.post<ClausulaRequisitoDto>(`${BASE}/clausulas-requisitos`, payload, {
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      toast.success("Cláusula/requisito creado");
      return data ?? null;
    } catch (error: unknown) {
      console.error("Error creating cláusula/requisito:", error);
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al crear cláusula/requisito");
      return null;
    }
  }

  /** GET /api/v1/qualitas/compliance/clausulas-requisitos/{id} */
  async getClausulaRequisitoById(id: string, auth?: AuthHeaders): Promise<ClausulaRequisitoDto | null> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      const { data } = await api.get<ClausulaRequisitoDto>(`${BASE}/clausulas-requisitos/${id}`, {
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      return data ?? null;
    } catch (error: unknown) {
      console.error("Error fetching cláusula/requisito:", error);
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al cargar cláusula/requisito");
      return null;
    }
  }

  /** PUT /api/v1/qualitas/compliance/clausulas-requisitos/{id} */
  async updateClausulaRequisitoById(id: string, payload: UpdateClausulaRequisitoCommand, auth?: AuthHeaders): Promise<boolean> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      await api.put(`${BASE}/clausulas-requisitos/${id}`, payload, {
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      toast.success("Cláusula/requisito actualizado");
      return true;
    } catch (error: unknown) {
      console.error("Error updating cláusula/requisito:", error);
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al actualizar cláusula/requisito");
      return false;
    }
  }

  /** DELETE /api/v1/qualitas/compliance/clausulas-requisitos/{id} */
  async deleteClausulaRequisito(id: string, auth?: AuthHeaders): Promise<boolean> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      await api.delete(`${BASE}/clausulas-requisitos/${id}`, {
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      toast.success("Cláusula/requisito eliminado");
      return true;
    } catch (error: unknown) {
      console.error("Error deleting cláusula/requisito:", error);
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al eliminar cláusula/requisito");
      return false;
    }
  }

  // --- Criterios de Cumplimiento ---

  /** GET /api/v1/qualitas/compliance/criterios-cumplimiento */
  async getAllCriteriosCumplimiento(
    includeInactive: boolean,
    clausulaRequisitoId?: string,
    auth?: AuthHeaders
  ): Promise<CriterioCumplimientoDto[]> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      const params: Record<string, string | boolean> = { includeInactive };
      if (clausulaRequisitoId) params.clausulaRequisitoId = clausulaRequisitoId;
      const { data } = await api.get<CriterioCumplimientoDto[]>(`${BASE}/criterios-cumplimiento`, {
        params,
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      return Array.isArray(data) ? data : [];
    } catch (error: unknown) {
      console.error("Error fetching criterios de cumplimiento:", error);
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al cargar criterios de cumplimiento");
      return [];
    }
  }

  /** POST /api/v1/qualitas/compliance/criterios-cumplimiento */
  async createCriterioCumplimiento(payload: CreateCriterioCumplimientoCommand, auth?: AuthHeaders): Promise<CriterioCumplimientoDto | null> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      const { data } = await api.post<CriterioCumplimientoDto>(`${BASE}/criterios-cumplimiento`, payload, {
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      toast.success("Criterio de cumplimiento creado");
      return data ?? null;
    } catch (error: unknown) {
      console.error("Error creating criterio de cumplimiento:", error);
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al crear criterio de cumplimiento");
      return null;
    }
  }

  /** GET /api/v1/qualitas/compliance/criterios-cumplimiento/{id} */
  async getCriterioCumplimientoById(id: string, auth?: AuthHeaders): Promise<CriterioCumplimientoDto | null> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      const { data } = await api.get<CriterioCumplimientoDto>(`${BASE}/criterios-cumplimiento/${id}`, {
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      return data ?? null;
    } catch (error: unknown) {
      console.error("Error fetching criterio de cumplimiento:", error);
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al cargar criterio de cumplimiento");
      return null;
    }
  }

  /** PUT /api/v1/qualitas/compliance/criterios-cumplimiento/{id} */
  async updateCriterioCumplimientoById(id: string, payload: UpdateCriterioCumplimientoCommand, auth?: AuthHeaders): Promise<boolean> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      await api.put(`${BASE}/criterios-cumplimiento/${id}`, payload, {
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      toast.success("Criterio de cumplimiento actualizado");
      return true;
    } catch (error: unknown) {
      console.error("Error updating criterio de cumplimiento:", error);
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al actualizar criterio de cumplimiento");
      return false;
    }
  }

  /** DELETE /api/v1/qualitas/compliance/criterios-cumplimiento/{id} */
  async deleteCriterioCumplimiento(id: string, auth?: AuthHeaders): Promise<boolean> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      await api.delete(`${BASE}/criterios-cumplimiento/${id}`, {
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      toast.success("Criterio de cumplimiento eliminado");
      return true;
    } catch (error: unknown) {
      console.error("Error deleting criterio de cumplimiento:", error);
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Error al eliminar criterio de cumplimiento");
      return false;
    }
  }
}

export const complianceService = new ComplianceService();
