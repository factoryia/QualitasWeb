/** Unidad organizativa (sede) - GET /organization-units */
export interface SedeDto {
  id: string;
  organizationId: string;
  parentId?: string | null;
  name: string;
  code: string;
  level?: number;
  isActive: boolean;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  managerId?: string | null;
  isPrincipal: boolean;
}

/** Body POST /organization-units */
export interface CreateSedePayload {
  organizationId: string;
  name: string;
  code: string;
  parentId?: string | null;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  managerId?: string | null;
  isPrincipal?: boolean;
}

/** Body PUT /organization-units/{id} */
export interface UpdateSedePayload {
  name: string;
  code: string;
  parentId?: string | null;
  isActive?: boolean | null;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  managerId?: string | null;
  isPrincipal?: boolean | null;
}

/** Cargo (position) - GET /positions */
export interface CargoDto {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  hierarchyLevel?: number | null;
  identificationColor?: string | null;
  parentPositionId?: string | null;
  parentPositionName?: string | null;
  isActive: boolean;
}

/** Body POST /positions */
export interface CreateCargoPayload {
  name: string;
  code: string;
  description?: string | null;
  hierarchyLevel?: number | null;
  identificationColor?: string | null;
  parentPositionId?: string | null;
}

/** Body PUT /positions/{id} */
export interface UpdateCargoPayload {
  name: string;
  code: string;
  description?: string | null;
  hierarchyLevel?: number | null;
  identificationColor?: string | null;
  parentPositionId?: string | null;
}
