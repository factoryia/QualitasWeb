"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usersApi } from "../api/users";
import type {
  PagedResponse,
  UserSearchParams,
  UserWithOrg,
} from "../types";
import { enrichUsersWithOrg } from "../services/enrich-users.service";

export function useUserSearch(params: UserSearchParams) {
  return useQuery<PagedResponse<UserWithOrg>, Error>({
    queryKey: [
      "users",
      params.page ?? 1,
      params.pageSize ?? 10,
      params.sort ?? "",
      params.search ?? "",
      params.isActive ?? null,
      params.emailConfirmed ?? null,
      params.roleId ?? "",
    ],
    queryFn: async () => {
      const page = await usersApi.search(params);
      const enrichedItems = await enrichUsersWithOrg(page.items);
      return {
        ...page,
        items: enrichedItems,
      } as PagedResponse<UserWithOrg>;
    },
    placeholderData: keepPreviousData,
  });
}

