export interface OrganizationDto {
  id: string;
  code: string;
  entityType: string;
  name: string;
  nit: string;
  sector: string;
  description: string | null;
  isActive?: boolean;
  createdOnUtc?: string | null;
  createdBy?: string | null;
  lastModifiedOnUtc?: string | null;
  lastModifiedBy?: string | null;
}

export interface CreateOrganizationCommand {
  code: string;
  entityType: string;
  name: string;
  nit: string;
  sector: string;
  description?: string | null;
}

export interface UpdateOrganizationCommand {
  code: string;
  entityType: string;
  name: string;
  nit: string;
  sector: string;
  description?: string | null;
}

/** API: organization-units (foundation) */
export interface OrganizationUnitDto {
  id: string;
  code: string;
  name: string;
  organizationId: string;
  description: string | null;
  parentId: string | null;
  isActive?: boolean;
  level?: number;
  createdOnUtc?: string | null;
  createdBy?: string | null;
  lastModifiedOnUtc?: string | null;
  lastModifiedBy?: string | null;
}

export interface CreateOrganizationUnitCommand {
  code: string;
  name: string;
  organizationId: string;
  description?: string | null;
  parentId?: string | null;
}

export interface UpdateOrganizationUnitCommand {
  code: string;
  name: string;
  description?: string | null;
  isActive?: boolean | null;
  parentId?: string | null;
}

/** Legacy / UI: organización con más campos (compatibilidad) */
export interface Organization {
  id: string;
  name: string;
  code?: string | null;
  nit?: string | null;
  entity_type?: string | null;
  entityType?: string | null;
  sector?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  legal_representative?: string | null;
  logo_url?: string | null;
  slogan?: string | null;
  description?: string | null;
}

export interface Sede {
  id: string;
  name: string;
  code?: string | null;
  address?: string | null;
  city?: string | null;
  is_principal?: boolean | null;
  manager_id?: string | null;
  is_active?: boolean;
  organization_id: string;
}

export interface Area {
  id: string;
  name: string;
  code?: string | null;
  parent_id?: string | null;
  hierarchy_level?: number | null;
  sede_id?: string | null;
  manager_id?: string | null;
  is_active?: boolean;
  organization_id: string;
}
