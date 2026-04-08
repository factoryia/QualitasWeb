const TENANT_SLUG_KEY = "qualitas-tenant-slug";

/**
 * Guarda el slug del tenant para prellenar el campo en `/login` tras logout o sesión expirada.
 */
export function rememberTenantSlug(slug: string | null | undefined): void {
  if (typeof window === "undefined") return;
  if (!slug || slug === "root") {
    return;
  }
  try {
    localStorage.setItem(TENANT_SLUG_KEY, slug);
  } catch {
    /* ignore */
  }
}

export function readTenantSlug(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TENANT_SLUG_KEY);
  } catch {
    return null;
  }
}

/** Única ruta de login de la app (multi-tenant vía formulario en `/login`). */
export const LOGIN_PATH = "/login" as const;
