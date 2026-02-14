import axios from "axios";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { logoutService } from "@/features/auth/services/logout.service";

const baseURL =
  process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL ||
  "http://localhost:5030";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add authorization header
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track redirect to prevent infinite loops
let isRedirecting = false;

// Response interceptor - handle 401/403 errors with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 with token refresh (not 403)
    if (error.response?.status === 401 && !originalRequest._retry && !isRedirecting) {
      originalRequest._retry = true;
      isRedirecting = true;

      try {
        // Attempt to refresh token
        useAuthStore.getState().setRefreshingToken(true);
        const { authService } = await import('@/features/auth/services/auth.service');
        const newTokens = await authService.refreshToken();

        if (newTokens) {
          // Update auth store with new tokens
          useAuthStore.getState().login(newTokens.accessToken, newTokens.refreshToken);

          // Update Authorization header for the original request
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;

          // Retry original request with new token
          useAuthStore.getState().setRefreshingToken(false);
          isRedirecting = false;
          return api(originalRequest);
        } else {
          // Token refresh failed - logout user
          useAuthStore.getState().setRefreshingToken(false);
          await logoutService.logoutOnAuthError(401);
          isRedirecting = false;
        }
      } catch (refreshError) {
        console.error('[AXIOS] Token refresh error:', refreshError);
        useAuthStore.getState().setRefreshingToken(false);
        await logoutService.logoutOnAuthError(401);
        isRedirecting = false;
      }
    } else if (error.response?.status === 403 && !isRedirecting) {
      // 403 Forbidden - no token refresh, just logout
      isRedirecting = true;
      await logoutService.logoutOnAuthError(403);

      // Reset redirect flag after 1 second
      setTimeout(() => {
        isRedirecting = false;
      }, 1000);
    }

    return Promise.reject(error);
  }
);
