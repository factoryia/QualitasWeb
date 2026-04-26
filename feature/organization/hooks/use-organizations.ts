"use client";

import { useQuery } from "@tanstack/react-query";
import { organizationsApi } from "../api/organizations";

export const organizationKeys = {
  all: ["foundation", "organizations"] as const,
  lists: () => [...organizationKeys.all, "list"] as const,
  list: () => [...organizationKeys.lists()] as const,
};

export function useOrganizationsQuery() {
  return useQuery({
    queryKey: organizationKeys.list(),
    queryFn: () => organizationsApi.list(),
  });
}
