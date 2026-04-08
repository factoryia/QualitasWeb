import type {
  OrganizationUnitDto,
  PositionDto,
  UserDto,
  UserWithOrg,
  UserRoleDto,
  UserSessionDto,
} from "../types";
import { positionsApi } from "../api/positions";
import { organizationUnitsApi } from "../api/organization-units";
import { userRolesApi } from "../api/user-roles";
import { userSessionsApi } from "../api/user-sessions";

let positionsCache: PositionDto[] | null = null;
let organizationUnitsCache: OrganizationUnitDto[] | null = null;
const userRolesCache = new Map<string, UserRoleDto[]>();
const userSessionsCache = new Map<string, UserSessionDto[]>();

async function ensureCaches() {
  if (!positionsCache) {
    positionsCache = await positionsApi.list(false);
  }
  if (!organizationUnitsCache) {
    organizationUnitsCache = await organizationUnitsApi.list(false);
  }
}

export async function enrichUsersWithOrg(
  users: UserDto[],
): Promise<UserWithOrg[]> {
  if (!users.length) return [];

  await ensureCaches();

  await Promise.all(
    users.map(async (user) => {
      if (!user.id) return;

      if (!userRolesCache.has(user.id)) {
        try {
          const roles = await userRolesApi.listByUser(user.id);
          userRolesCache.set(user.id, roles);
        } catch {
          userRolesCache.set(user.id, []);
        }
      }

      if (!userSessionsCache.has(user.id)) {
        try {
          const sessions = await userSessionsApi.listByUser(user.id);
          userSessionsCache.set(user.id, sessions);
        } catch {
          userSessionsCache.set(user.id, []);
        }
      }
    }),
  );

  const positionsById = new Map(
    (positionsCache ?? []).map((p) => [p.id, p]),
  );
  const unitsById = new Map(
    (organizationUnitsCache ?? []).map((u) => [u.id, u]),
  );

  return users.map<UserWithOrg>((user) => {
    const position =
      user.positionId != null ? positionsById.get(user.positionId) : undefined;
    const unit =
      user.organizationUnitId != null
        ? unitsById.get(user.organizationUnitId)
        : undefined;
    const roles = userRolesCache.get(user.id) ?? [];
    const primaryRole =
      roles.find((r) => r.enabled) ?? roles[0] ?? undefined;

    const sessions = userSessionsCache.get(user.id) ?? [];
    const lastAccess = sessions.reduce<Date | null>((acc, s) => {
      const d = new Date(s.lastActivityAt);
      if (Number.isNaN(d.getTime())) return acc;
      if (!acc || d > acc) return d;
      return acc;
    }, null);

    return {
      ...user,
      positionName: position?.name ?? null,
      organizationUnitName: unit?.name ?? null,
      roleName: primaryRole?.roleName ?? null,
      lastAccessAt: lastAccess ? lastAccess.toISOString() : null,
    };
  });
}

