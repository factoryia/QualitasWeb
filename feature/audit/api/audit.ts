import { api } from "@/lib/axios";
import type {
  AuditDetailDto,
  AuditSummaryAggregateDto,
  AuditSummaryDto,
  GetAuditsQuery,
  PagedResponse,
} from "../types";

const BASE = "/api/v1/audits";

export const auditApi = {
  /**
   * List and search audit events
   */
  list: async (query: GetAuditsQuery): Promise<PagedResponse<AuditSummaryDto>> => {
    const { data } = await api.get<PagedResponse<AuditSummaryDto>>(BASE, {
      params: query,
    });
    return data;
  },

  /**
   * Get audit event by ID
   */
  getById: async (id: string): Promise<AuditDetailDto | null> => {
    try {
      const { data } = await api.get<AuditDetailDto>(`${BASE}/${id}`);
      return data;
    } catch {
      return null;
    }
  },

  /**
   * Get audit events by correlation id
   */
  getByCorrelationId: async (
    correlationId: string,
    fromUtc?: string,
    toUtc?: string
  ): Promise<AuditSummaryDto[]> => {
    const { data } = await api.get<AuditSummaryDto[]>(`${BASE}/by-correlation/${correlationId}`, {
      params: { fromUtc, toUtc },
    });
    return Array.isArray(data) ? data : [];
  },

  /**
   * Get audit events by trace id
   */
  getByTraceId: async (
    traceId: string,
    fromUtc?: string,
    toUtc?: string
  ): Promise<AuditSummaryDto[]> => {
    const { data } = await api.get<AuditSummaryDto[]>(`${BASE}/by-trace/${traceId}`, {
      params: { fromUtc, toUtc },
    });
    return Array.isArray(data) ? data : [];
  },

  /**
   * Get security-related audit events
   */
  getSecurityAudits: async (
    pageNumber?: number,
    pageSize?: number,
    fromUtc?: string,
    toUtc?: string
  ): Promise<PagedResponse<AuditSummaryDto>> => {
    const { data } = await api.get<PagedResponse<AuditSummaryDto>>(`${BASE}/security`, {
      params: { pageNumber, pageSize, fromUtc, toUtc },
    });
    return data;
  },

  /**
   * Get exception audit events
   */
  getExceptionAudits: async (
    pageNumber?: number,
    pageSize?: number,
    fromUtc?: string,
    toUtc?: string
  ): Promise<PagedResponse<AuditSummaryDto>> => {
    const { data } = await api.get<PagedResponse<AuditSummaryDto>>(`${BASE}/exceptions`, {
      params: { pageNumber, pageSize, fromUtc, toUtc },
    });
    return data;
  },

  /**
   * Get audit summary
   */
  getSummary: async (fromUtc?: string, toUtc?: string): Promise<AuditSummaryAggregateDto> => {
    const { data } = await api.get<AuditSummaryAggregateDto>(`${BASE}/summary`, {
      params: { fromUtc, toUtc },
    });
    return data;
  },
};
