import { api } from "@/lib/axios";
import type {
  PagedResponse,
  RegisterUserPayload,
  UpdateUserAdminPayload,
  UpdateUserRequest,
  UserDto,
  UserSearchParams,
} from "../types";

export const usersApi = {
  getProfile: async (): Promise<UserDto> => {
    const { data } = await api.get<UserDto>("/api/v1/identity/profile");
    return data;
  },

  updateProfile: async (payload: UpdateUserRequest): Promise<void> => {
    await api.put("/api/v1/identity/profile", payload);
  },

  search: async (
    params: UserSearchParams,
  ): Promise<PagedResponse<UserDto>> => {
    const {
      page = 1,
      pageSize = 10,
      sort,
      search,
      isActive,
      emailConfirmed,
      roleId,
    } = params;

    const { data } = await api.get<PagedResponse<UserDto>>(
      "/api/v1/identity/users/search",
      {
        params: {
          PageNumber: page,
          PageSize: pageSize,
          ...(sort && { Sort: sort }),
          ...(search && { Search: search }),
          ...(typeof isActive === "boolean" && { IsActive: isActive }),
          ...(typeof emailConfirmed === "boolean" && {
            EmailConfirmed: emailConfirmed,
          }),
          ...(roleId && { RoleId: roleId }),
        },
      },
    );

    return data;
  },

  register: async (payload: RegisterUserPayload): Promise<string> => {
    const { data } = await api.post<{ userId: string }>(
      "/api/v1/identity/register",
      payload,
    );
    return data.userId;
  },

  updateAsAdmin: async (
    id: string,
    payload: Omit<UpdateUserAdminPayload, "id">,
  ): Promise<void> => {
    await api.put(`/api/v1/identity/users/${id}`, {
      id,
      ...payload,
    });
  },

  toggleStatus: async (id: string, activateUser: boolean): Promise<void> => {
    await api.patch(`/api/v1/identity/users/${id}`, {
      activateUser,
      userId: id,
    });
  },
};

