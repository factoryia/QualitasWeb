import { api } from "@/services/axios/axios.client";
import toast from "react-hot-toast";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  Area,
  CreateOrganizationCommand,
  CreateOrganizationUnitCommand,
  Organization,
  OrganizationDto,
  OrganizationUnitDto,
  Sede,
  UpdateOrganizationCommand,
  UpdateOrganizationUnitCommand,
} from "../types";

export type { Organization };

export type AuthHeaders = { accessToken: string; tenant?: string };

function authHeaders(auth?: AuthHeaders): Record<string, string> | undefined {
  if (!auth?.accessToken) return undefined;
  const h: Record<string, string> = {
    Authorization: `Bearer ${auth.accessToken}`,
  };
  if (auth.tenant) h.tenant = auth.tenant;
  return h;
}

const authFromStore = (): AuthHeaders | undefined => {
  const token = useAuthStore.getState().accessToken;
  const tenant = useAuthStore.getState().user?.tenant ?? "root";
  return token ? { accessToken: token, tenant } : undefined;
};

/** API: organizaciones (foundation) - respuesta de GET /organizations y GET /organizations/{id} */

const BASE = "/api/v1/qualitas/foundation";

class OrganizationService {
  // --- Organizations (foundation API) ---

  /** GET /api/v1/qualitas/foundation/organizations - Lista de organizaciones activas */
  async getAllOrganizations(auth?: AuthHeaders): Promise<OrganizationDto[]> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      const { data } = await api.get<OrganizationDto[]>(
        `${BASE}/organizations`,
        {
          ...(authHeaders_ && { headers: authHeaders_ }),
        },
      );
      return Array.isArray(data) ? data : [];
    } catch (error: unknown) {
      console.error("Error fetching organizations:", error);
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Error al cargar organizaciones",
      );
      return [];
    }
  }

  /** POST /api/v1/qualitas/foundation/organizations */
  async createOrganization(
    payload: CreateOrganizationCommand,
    auth?: AuthHeaders,
  ): Promise<OrganizationDto | null> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      const { data } = await api.post<OrganizationDto>(
        `${BASE}/organizations`,
        payload,
        {
          ...(authHeaders_ && { headers: authHeaders_ }),
        },
      );
      toast.success("Organización creada");
      return data ?? null;
    } catch (error: unknown) {
      console.error("Error creating organization:", error);
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Error al crear organización",
      );
      return null;
    }
  }

  /** GET /api/v1/qualitas/foundation/organizations/{id} */
  async getOrganizationById(
    id: string,
    auth?: AuthHeaders,
  ): Promise<OrganizationDto | null> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      const { data } = await api.get<OrganizationDto>(
        `${BASE}/organizations/${id}`,
        {
          ...(authHeaders_ && { headers: authHeaders_ }),
        },
      );
      return data ?? null;
    } catch (error: unknown) {
      console.error("Error fetching organization:", error);
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Error al cargar organización",
      );
      return null;
    }
  }

  /** PUT /api/v1/qualitas/foundation/organizations/{id} */
  async updateOrganizationById(
    id: string,
    payload: UpdateOrganizationCommand,
    auth?: AuthHeaders,
  ): Promise<boolean> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      await api.put(`${BASE}/organizations/${id}`, payload, {
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      toast.success("Organización actualizada");
      return true;
    } catch (error: unknown) {
      console.error("Error updating organization:", error);
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Error al actualizar organización",
      );
      return false;
    }
  }

  /** DELETE /api/v1/qualitas/foundation/organizations/{id} (soft delete) */
  async deleteOrganization(id: string, auth?: AuthHeaders): Promise<boolean> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      await api.delete(`${BASE}/organizations/${id}`, {
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      toast.success("Organización desactivada");
      return true;
    } catch (error: unknown) {
      console.error("Error deleting organization:", error);
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Error al desactivar organización",
      );
      return false;
    }
  }

  // --- Organization units (foundation API) ---

  /** GET /api/v1/qualitas/foundation/organization-units?includeInactive= */
  async getAllOrganizationUnits(
    includeInactive: boolean,
    auth?: AuthHeaders,
  ): Promise<OrganizationUnitDto[]> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      const { data } = await api.get<OrganizationUnitDto[]>(
        `${BASE}/organization-units`,
        {
          params: { includeInactive },
          ...(authHeaders_ && { headers: authHeaders_ }),
        },
      );
      return Array.isArray(data) ? data : [];
    } catch (error: unknown) {
      console.error("Error fetching organization units:", error);
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Error al cargar unidades organizativas",
      );
      return [];
    }
  }

  /** POST /api/v1/qualitas/foundation/organization-units */
  async createOrganizationUnit(
    payload: CreateOrganizationUnitCommand,
    auth?: AuthHeaders,
  ): Promise<OrganizationUnitDto | null> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      const { data } = await api.post<OrganizationUnitDto>(
        `${BASE}/organization-units`,
        payload,
        {
          ...(authHeaders_ && { headers: authHeaders_ }),
        },
      );
      toast.success("Unidad organizativa creada");
      return data ?? null;
    } catch (error: unknown) {
      console.error("Error creating organization unit:", error);
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Error al crear unidad organizativa",
      );
      return null;
    }
  }

  /** GET /api/v1/qualitas/foundation/organization-units/{id} */
  async getOrganizationUnitById(
    id: string,
    auth?: AuthHeaders,
  ): Promise<OrganizationUnitDto | null> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      const { data } = await api.get<OrganizationUnitDto>(
        `${BASE}/organization-units/${id}`,
        {
          ...(authHeaders_ && { headers: authHeaders_ }),
        },
      );
      return data ?? null;
    } catch (error: unknown) {
      console.error("Error fetching organization unit:", error);
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Error al cargar unidad organizativa",
      );
      return null;
    }
  }

  /** PUT /api/v1/qualitas/foundation/organization-units/{id} */
  async updateOrganizationUnitById(
    id: string,
    payload: UpdateOrganizationUnitCommand,
    auth?: AuthHeaders,
  ): Promise<boolean> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      await api.put(`${BASE}/organization-units/${id}`, payload, {
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      toast.success("Unidad organizativa actualizada");
      return true;
    } catch (error: unknown) {
      console.error("Error updating organization unit:", error);
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Error al actualizar unidad organizativa",
      );
      return false;
    }
  }

  /** DELETE /api/v1/qualitas/foundation/organization-units/{id} (soft delete) */
  async deleteOrganizationUnit(
    id: string,
    auth?: AuthHeaders,
  ): Promise<boolean> {
    try {
      const authHeaders_ = authHeaders(auth ?? authFromStore());
      await api.delete(`${BASE}/organization-units/${id}`, {
        ...(authHeaders_ && { headers: authHeaders_ }),
      });
      toast.success("Unidad organizativa eliminada");
      return true;
    } catch (error: unknown) {
      console.error("Error deleting organization unit:", error);
      toast.error(
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Error al eliminar unidad organizativa",
      );
      return false;
    }
  }

  // --- Legacy: organización por id (compatibilidad con OrgEntityInfo, etc.) ---

  async getOrganization(orgId: string): Promise<Organization | null> {
    try {
      const auth = authFromStore();
      const dto = await this.getOrganizationById(orgId, auth);
      if (!dto) return null;
      return {
        id: dto.id,
        name: dto.name,
        code: dto.code,
        nit: dto.nit,
        entity_type: dto.entityType,
        entityType: dto.entityType,
        sector: dto.sector,
        description: dto.description ?? null,
      };
    } catch {
      return null;
    }
  }

  async updateOrganization(
    orgId: string,
    data: Partial<Organization>,
  ): Promise<boolean> {
    const auth = authFromStore();
    // Si no hay código en data, obtenerlo de la organización actual
    let code = data.code;
    if (!code || code.trim() === "") {
      const current = await this.getOrganizationById(orgId, auth);
      if (!current) {
        toast.error("No se pudo obtener la organización actual");
        return false;
      }
      code = current.code;
    }
    const entityType = (data.entityType ?? data.entity_type ?? "") as string;
    const name = data.name ?? "";
    const nit = (data.nit ?? "") as string;
    const sector = (data.sector ?? "") as string;
    const description = data.description ?? null;
    return this.updateOrganizationById(
      orgId,
      { code, entityType, name, nit, sector, description },
      auth,
    );
  }

  async getSedes(orgId: string): Promise<Sede[]> {
    try {
      const response = await api.get(
        `/api/v1/qualitas/foundation/organizations/${orgId}/sedes`,
      );
      return response.data || [];
    } catch (error: any) {
      console.error("Error fetching sedes:", error);
      toast.error(error.response?.data?.message || "Error al cargar sedes");
      return [];
    }
  }

  async createSede(orgId: string, data: Partial<Sede>): Promise<Sede | null> {
    try {
      const response = await api.post(
        `/api/v1/qualitas/foundation/organizations/${orgId}/sedes`,
        data,
      );
      toast.success("Sede creada");
      return response.data;
    } catch (error: any) {
      console.error("Error creating sede:", error);
      toast.error(error.response?.data?.message || "Error al crear sede");
      return null;
    }
  }

  async updateSede(
    orgId: string,
    sedeId: string,
    data: Partial<Sede>,
  ): Promise<boolean> {
    try {
      await api.put(
        `/api/v1/qualitas/foundation/organizations/${orgId}/sedes/${sedeId}`,
        data,
      );
      toast.success("Sede actualizada");
      return true;
    } catch (error: any) {
      console.error("Error updating sede:", error);
      toast.error(error.response?.data?.message || "Error al actualizar sede");
      return false;
    }
  }

  async getAreas(orgId: string): Promise<Area[]> {
    try {
      const response = await api.get(
        `/api/v1/qualitas/foundation/organizations/${orgId}/areas`,
      );
      return response.data || [];
    } catch (error: any) {
      console.error("Error fetching areas:", error);
      toast.error(error.response?.data?.message || "Error al cargar áreas");
      return [];
    }
  }

  async createArea(orgId: string, data: Partial<Area>): Promise<Area | null> {
    try {
      const response = await api.post(
        `/api/v1/qualitas/foundation/organizations/${orgId}/areas`,
        data,
      );
      toast.success("Área creada");
      return response.data;
    } catch (error: any) {
      console.error("Error creating area:", error);
      toast.error(error.response?.data?.message || "Error al crear área");
      return null;
    }
  }

  async updateArea(
    orgId: string,
    areaId: string,
    data: Partial<Area>,
  ): Promise<boolean> {
    try {
      await api.put(
        `/api/v1/qualitas/foundation/organizations/${orgId}/areas/${areaId}`,
        data,
      );
      toast.success("Área actualizada");
      return true;
    } catch (error: any) {
      console.error("Error updating area:", error);
      toast.error(error.response?.data?.message || "Error al actualizar área");
      return false;
    }
  }

  async getMembers(
    orgId: string,
  ): Promise<Array<{ user_id: string; full_name: string | null }>> {
    try {
      const response = await api.get(
        `/api/v1/qualitas/foundation/organizations/${orgId}/members`,
      );
      return response.data || [];
    } catch (error: any) {
      console.error("Error fetching members:", error);
      return [];
    }
  }

  async getEmployeeCount(sedeId: string): Promise<number> {
    try {
      const response = await api.get(
        `/api/v1/qualitas/foundation/sedes/${sedeId}/employees/count`,
      );
      return response.data?.count || 0;
    } catch (error: any) {
      return 0;
    }
  }

  async getUserCount(areaId: string): Promise<number> {
    try {
      const response = await api.get(
        `/api/v1/qualitas/foundation/areas/${areaId}/users/count`,
      );
      return response.data?.count || 0;
    } catch (error: any) {
      return 0;
    }
  }
}

export const organizationService = new OrganizationService();
