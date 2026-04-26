"use client";

import { useQuery } from "@tanstack/react-query";
import { organizationsApi } from "../api/organizations";

export const organizationKeys = {
  all: ["foundation", "organizations"] as const,
  lists: () => [...organizationKeys.all, "list"] as const,
  list: () => [...organizationKeys.lists()] as const,
  details: () => [...organizationKeys.all, "detail"] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
};

export function useOrganizationsQuery() {
  return useQuery({
    queryKey: organizationKeys.list(),
    queryFn: () => organizationsApi.list(),
  });
}
