// features/audit/services/audit.service.ts
import { api } from "@/services/axios/axios.client";
import toast from "react-hot-toast";
import { useAuthStore } from "@/features/auth/store/auth.store";

export type AuthHeaders = { accessToken: string; tenant?: string };

// Reutilizamos la lógica de headers de tu proyecto
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

// --- Interfaces ---

export interface AuditItemDto {
  id: string;
  occurredAtUtc: string;
  eventType: number;
  severity: number;
  tenantId: string | null;
  userId: string | null;
  userName: string | null;
  traceId: string | null;
  correlationId: string | null;
  requestId: string | null;
  source: string | null;
  tags: number;
}

export interface AuditDetailDto extends AuditItemDto {
  receivedAtUtc: string;
  spanId: string | null;
  payload: any | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface AuditSummaryDto {
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  eventsBySource: Record<string, number>;
  eventsByTenant: Record<string, number>;
}

const BASE = "/api/v1/audits";

class AuditService {
  /** GET /api/v1/audits - Lista paginada de auditorías */
  async getAudits(pageNumber = 1, pageSize = 10, auth?: AuthHeaders): Promise<PaginatedResponse<AuditItemDto> | null> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      const { data } = await api.get<PaginatedResponse<AuditItemDto>>(BASE, {
        params: { pageNumber, pageSize },
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      return data;
    } catch (error: unknown) {
      console.error("Error fetching audits:", error);
      toast.error("Error al cargar el historial de auditoría");
      return null;
    }
  }

  /** GET /api/v1/audits/{id} - Detalle completo con payload */
  async getAuditById(id: string, auth?: AuthHeaders): Promise<AuditDetailDto | null> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      const { data } = await api.get<AuditDetailDto>(`${BASE}/${id}`, {
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      return data;
    } catch (error: unknown) {
      console.error("Error fetching audit detail:", error);
      toast.error("Error al cargar el detalle del evento");
      return null;
    }
  }

  /** GET /api/v1/audits/by-trace/{traceId} */
  async getAuditsByTrace(traceId: string, auth?: AuthHeaders): Promise<AuditItemDto[]> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      const { data } = await api.get<AuditItemDto[]>(`${BASE}/by-trace/${traceId}`, {
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  }

  /** GET /api/v1/audits/by-correlation/{correlationId} */
  async getAuditsByCorrelation(correlationId: string, auth?: AuthHeaders): Promise<AuditItemDto[]> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      const { data } = await api.get<AuditItemDto[]>(`${BASE}/by-correlation/${correlationId}`, {
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  }

  /** GET /api/v1/audits/security - Eventos de seguridad */
  async getSecurityAudits(auth?: AuthHeaders): Promise<AuditItemDto[]> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      const { data } = await api.get<AuditItemDto[]>(`${BASE}/security`, {
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching security audits:", error);
      return [];
    }
  }

  /** GET /api/v1/audits/exceptions - Logs de errores/excepciones */
  async getExceptionAudits(auth?: AuthHeaders): Promise<AuditItemDto[]> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      const { data } = await api.get<AuditItemDto[]>(`${BASE}/exceptions`, {
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  }

  /** GET /api/v1/audits/summary - Resumen estadístico para Dashboards */
  async getAuditSummary(auth?: AuthHeaders): Promise<AuditSummaryDto | null> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      const { data } = await api.get<AuditSummaryDto>(`${BASE}/summary`, {
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      return data;
    } catch (error) {
      console.error("Error fetching audit summary:", error);
      return null;
    }
  }
}

export const auditService = new AuditService();