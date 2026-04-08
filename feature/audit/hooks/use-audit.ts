"use client";

import { useQuery } from "@tanstack/react-query";
import { auditApi } from "../api/audit";
import type { GetAuditsQuery } from "../types";

export const auditKeys = {
  all: ["audit"] as const,
  lists: () => [...auditKeys.all, "list"] as const,
  list: (query: GetAuditsQuery) => [...auditKeys.lists(), query] as const,
  details: () => [...auditKeys.all, "detail"] as const,
  detail: (id: string) => [...auditKeys.details(), id] as const,
  summary: (fromUtc?: string, toUtc?: string) => [...auditKeys.all, "summary", { fromUtc, toUtc }] as const,
  security: (pageNumber?: number, pageSize?: number) => [...auditKeys.all, "security", { pageNumber, pageSize }] as const,
  exceptions: (pageNumber?: number, pageSize?: number) => [...auditKeys.all, "exceptions", { pageNumber, pageSize }] as const,
};

export function useAuditList(query: GetAuditsQuery) {
  return useQuery({
    queryKey: auditKeys.list(query),
    queryFn: () => auditApi.list(query),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useAuditDetail(id: string) {
  return useQuery({
    queryKey: auditKeys.detail(id),
    queryFn: () => auditApi.getById(id),
    enabled: !!id,
  });
}

export function useAuditSummary(fromUtc?: string, toUtc?: string) {
  return useQuery({
    queryKey: auditKeys.summary(fromUtc, toUtc),
    queryFn: () => auditApi.getSummary(fromUtc, toUtc),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSecurityAudits(pageNumber?: number, pageSize?: number) {
  return useQuery({
    queryKey: auditKeys.security(pageNumber, pageSize),
    queryFn: () => auditApi.getSecurityAudits(pageNumber, pageSize),
  });
}

export function useExceptionAudits(pageNumber?: number, pageSize?: number) {
  return useQuery({
    queryKey: auditKeys.exceptions(pageNumber, pageSize),
    queryFn: () => auditApi.getExceptionAudits(pageNumber, pageSize),
  });
}
