import { api } from "@/services/axios";

export interface UserImage {
  fileName: string;
  contentType: string;
  data: number[];
}

export interface UserDto {
  id: string | null;
  userName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  isActive: boolean;
  emailConfirmed: boolean;
  phoneNumber: string | null;
  imageUrl: string | null;
}

export interface PagedResponseOfUserDto {
  items: UserDto[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  email: string | null;
  image?: UserImage;
}

export interface UpdateUserRequest {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  email: string | null;
  image?: UserImage;
  deleteCurrentImage: boolean;
}

export interface ToggleUserStatusRequest {
  activateUser: boolean;
  userId: string | null;
}

export interface RegisterUserCommand {
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string | null;
}

export interface RegisterUserResponse {
  userId: string;
}

export interface UserRoleDto {
  roleId: string | null;
  roleName: string | null;
  description: string | null;
  enabled: boolean;
}

export interface AssignUserRolesCommand {
  userId: string;
  userRoles: UserRoleDto[];
}

export type AuthHeaders = { accessToken: string; tenant?: string };

function authHeaders(auth?: AuthHeaders): Record<string, string> | undefined {
  if (!auth?.accessToken) return undefined;
  const h: Record<string, string> = { Authorization: `Bearer ${auth.accessToken}` };
  if (auth.tenant) h.tenant = auth.tenant;
  return h;
}

export const usersService = {
  /**
   * Obtener lista de todos los usuarios
   * GET /api/v1/identity/users
   */
  getUsers: async (): Promise<UserDto[]> => {
    const { data } = await api.get<UserDto[]>("/api/v1/identity/users");
    return data || [];
  },

  searchUsers: async (
    params?: {
      PageNumber?: number;
      PageSize?: number;
      Sort?: string;
      Search?: string;
      IsActive?: boolean;
      EmailConfirmed?: boolean;
      RoleId?: string;
    },
    /** Pasar token y tenant para evitar 401 si el interceptor no los inyecta (p. ej. por CORS o rehidratación) */
    auth?: { accessToken: string; tenant?: string }
  ): Promise<PagedResponseOfUserDto> => {
    const headers: Record<string, string> = {};
    if (auth?.accessToken) {
      headers.Authorization = `Bearer ${auth.accessToken}`;
    }
    if (auth?.tenant) {
      headers.tenant = auth.tenant;
    }
    const { data } = await api.get<PagedResponseOfUserDto>(
      "/api/v1/identity/users/search",
      { params, ...(Object.keys(headers).length ? { headers } : {}) }
    );
    return data!;
  },

  /**
   * Obtener usuario por ID
   * GET /api/v1/identity/users/{id}
   */
  getUserById: async (userId: string): Promise<UserDto> => {
    const { data } = await api.get<UserDto>(`/api/v1/identity/users/${userId}`);
    return data!;
  },

  /**
   * Actualizar usuario
   * PUT /api/v1/identity/users/{id}
   */
  updateUser: async (userId: string, userData: UpdateUserRequest): Promise<UserDto> => {
    const { data } = await api.put<UserDto>(
      `/api/v1/identity/users/${userId}`,
      userData
    );
    return data ?? ({
      id: userId,
      userName: null,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      isActive: true,
      emailConfirmed: true,
      phoneNumber: userData.phoneNumber,
      imageUrl: null,
    } as UserDto);
  },

  /**
   * Cambiar estado del usuario (activar/desactivar)
   * PATCH /api/v1/identity/users/{id}
   */
  toggleUserStatus: async (
    userId: string,
    activate: boolean,
    auth?: AuthHeaders
  ): Promise<void> => {
    await api.patch(
      `/api/v1/identity/users/${userId}`,
      {
        activateUser: activate,
        userId: null,
      } as ToggleUserStatusRequest,
      { ...(authHeaders(auth) && { headers: authHeaders(auth) }) }
    );
  },

  deleteUser: async (userId: string, auth?: AuthHeaders): Promise<void> => {
    await api.delete(`/api/v1/identity/users/${userId}`, {
      ...(authHeaders(auth) && { headers: authHeaders(auth) }),
    });
  },

  /**
   * Crear usuario (registro por admin)
   * POST /api/v1/identity/register
   */
  registerUser: async (
    payload: RegisterUserCommand,
    auth?: AuthHeaders
  ): Promise<RegisterUserResponse> => {
    const { data } = await api.post<RegisterUserResponse>(
      "/api/v1/identity/register",
      payload,
      { ...(authHeaders(auth) && { headers: authHeaders(auth) }) }
    );
    return data!;
  },

  /** GET /api/v1/identity/users/{id}/roles */
  getUserRoles: async (userId: string, auth?: AuthHeaders): Promise<UserRoleDto[]> => {
    const { data } = await api.get<UserRoleDto[]>(
      `/api/v1/identity/users/${userId}/roles`,
      { ...(authHeaders(auth) && { headers: authHeaders(auth) }) }
    );
    return data ?? [];
  },

  /** POST /api/v1/identity/users/{id}/roles */
  assignUserRoles: async (
    userId: string,
    payload: AssignUserRolesCommand,
    auth?: AuthHeaders
  ): Promise<void> => {
    await api.post(
      `/api/v1/identity/users/${userId}/roles`,
      payload,
      { ...(authHeaders(auth) && { headers: authHeaders(auth) }) }
    );
  },

  /**
   * Obtener perfil del usuario autenticado
   * GET /api/v1/identity/profile
   */
  getProfile: async (auth?: AuthHeaders): Promise<UserDto> => {
    const { data } = await api.get<UserDto>("/api/v1/identity/profile", {
      ...(authHeaders(auth) && { headers: authHeaders(auth) }),
    });
    return data!;
  },

  /**
   * Actualizar perfil del usuario autenticado
   * PUT /api/v1/identity/profile
   */
  updateProfile: async (userData: UpdateUserRequest, auth?: AuthHeaders): Promise<void> => {
    await api.put(
      "/api/v1/identity/profile",
      userData,
      { ...(authHeaders(auth) && { headers: authHeaders(auth) }) }
    );
  },
};
