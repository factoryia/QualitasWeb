export interface UserDto {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  emailConfirmed: boolean;
  phoneNumber: string | null;
  imageUrl: string | null;
}

export interface UpdateUserRequest {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  email: string | null;
  image?: { fileName: string; contentType: string; data: number[] };
  deleteCurrentImage?: boolean;
}

export interface RegisterUserPayload {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
  roleId?: string;
}

export interface UpdateUserAdminPayload {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  roleId: string;
}

export interface PagedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface UserSearchParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
  isActive?: boolean;
  emailConfirmed?: boolean;
  roleId?: string;
}

