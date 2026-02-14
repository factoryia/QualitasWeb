import { useAuthStore } from '../store/auth.store';

/**
 * Centralized logout service
 * Handles cleanup of all stores and caches when user logs out
 */
export const logoutService = {
  /**
   * Complete logout cleanup
   * Clears all stores, caches, and pending requests
   */
  logout: async (): Promise<void> => {
    try {
      // 1. Clear auth store
      useAuthStore.getState().logout();

      // 2. Clear other stores (can be extended as more stores are added)
      // Example for future stores:
      // useFormStore.getState().reset?.();
      // useApiCacheStore.getState().clear?.();

      // 3. Clear session storage
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }

      console.log('[LOGOUT] Complete cleanup performed');
    } catch (error) {
      console.error('[LOGOUT] Error during cleanup:', error);
      throw error;
    }
  },

  /**
   * Logout on 401/403 error
   * Called from axios interceptor when authentication fails
   */
  logoutOnAuthError: async (status: number): Promise<void> => {
    try {
      await logoutService.logout();

      // Store error message for UI to display
      if (typeof window !== 'undefined') {
        const message = status === 401 ? 'Session expired' : 'Access denied';
        sessionStorage.setItem(
          'auth-error',
          JSON.stringify({
            status,
            timestamp: Date.now(),
            message,
          })
        );
      }

      console.log('[LOGOUT] Logout on auth error completed');
    } catch (error) {
      console.error('[LOGOUT] Error during auth error logout:', error);
      throw error;
    }
  },
};
