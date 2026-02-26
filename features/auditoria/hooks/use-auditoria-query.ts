// features/auditoria/hooks/use-auditoria-query.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  auditService,
  type AuditSummaryDto,
  type AuditQueryParams,
  type PaginatedResponse,
  type AuditItemDto,
} from "@/features/auditoria/services/auditoria.service";

function useAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const tenant = useAuthStore((s) => s.user?.tenant ?? "root");
  return accessToken ? { accessToken, tenant } : undefined;
}

const auditoriaKeys = {
  summary: ["auditoria", "summary"] as const,
  list: (params: AuditQueryParams) => ["auditoria", "list", params] as const,
};

export function useAuditSummaryQuery() {
  const auth = useAuth();
  return useQuery({
    queryKey: auditoriaKeys.summary,
    queryFn: () => auditService.getAuditSummary(auth),
    enabled: !!auth,
  });
}

export function useAuditsQuery(params: AuditQueryParams) {
  const auth = useAuth();
  return useQuery({
    queryKey: auditoriaKeys.list(params),
    queryFn: () =>
      auditService.getAudits(params, auth) as Promise<
        PaginatedResponse<AuditItemDto> | null
      >,
    enabled: !!auth,
  });
}
