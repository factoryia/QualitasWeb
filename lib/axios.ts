import { useAuthStore } from "@/feature/auth/store/auth.store";
import { authSession } from "@/feature/auth/api/logout";
import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || "http://localhost:5030";

export const api = axios.create({
  baseURL: "https://qualitasnexus-web.azurewebsites.net",
  headers: {
    "Content-Type": "application/json",
  },
});

const AUTH_STORAGE_KEY = "auth-storage";

function getAccessToken(): string | null {
  const fromStore = useAuthStore.getState().accessToken;
  if (fromStore) return fromStore;
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { accessToken?: string } };
    return parsed?.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

function getTenant(): string {
  const user = useAuthStore.getState().user;
  if (user?.tenant) return user.tenant;
  if (typeof window === "undefined") return "root";
  try {
    const raw = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return "root";
    const parsed = JSON.parse(raw) as { state?: { user?: { tenant?: string } } };
    return parsed?.state?.user?.tenant ?? "root";
  } catch {
    return "root";
  }
}

// Request interceptor: Authorization + tenant (fallback a sessionStorage si el store no ha rehidratado)
api.interceptors.request.use(
  (config) => {
    const headers = config.headers as Record<string, string | undefined>;
    const hasAuth = headers?.Authorization ?? headers?.authorization;
    if (!hasAuth) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    const tenant = getTenant();
    if (!headers?.tenant && !headers?.Tenant) {
      (config.headers as Record<string, string>)["tenant"] = tenant;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Track redirect to prevent infinite loops
let isRedirecting = false;

// Response interceptor - handle 401/403 errors with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    // Don't retry the refresh endpoint itself (avoid loop)
    const isRefreshRequest =
      originalRequest.url?.includes("/token/refresh") ?? false;

    // Only handle 401 with token refresh (not 403)
    if (
      error.response?.status === 401 &&
      !isRefreshRequest &&
      !originalRequest._retry &&
      !isRedirecting
    ) {
      originalRequest._retry = true;
      isRedirecting = true;

      try {
        // Attempt to refresh token
        useAuthStore.getState().setRefreshingToken(true);
        const { authApi } = await import("@/feature/auth/api/auth");
        const newTokens = await authApi.refreshToken();

        if (newTokens) {
          // Update auth store with new tokens
          useAuthStore
            .getState()
            .login(newTokens.accessToken, newTokens.refreshToken);

          // Update Authorization header for the original request
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;

          // Retry original request with new token
          useAuthStore.getState().setRefreshingToken(false);
          isRedirecting = false;
          return api(originalRequest);
        } else {
          // Token refresh failed - logout user
          useAuthStore.getState().setRefreshingToken(false);
          await authSession.logoutOnAuthError(401);
          isRedirecting = false;
        }
      } catch (refreshError) {
        console.error("[AXIOS] Token refresh error:", refreshError);
        useAuthStore.getState().setRefreshingToken(false);
        await authSession.logoutOnAuthError(401);
        isRedirecting = false;
      }
    } else if (error.response?.status === 403 && !isRedirecting) {
      // 403 Forbidden - no token refresh, just logout
      isRedirecting = true;
      await authSession.logoutOnAuthError(403);

      // Reset redirect flag after 1 second
      setTimeout(() => {
        isRedirecting = false;
      }, 1000);
    }

    return Promise.reject(error);
  },
);
