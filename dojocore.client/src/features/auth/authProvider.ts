import type { AuthBindings } from '@refinedev/core';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import type { LoginPayload, CombinedRegistrationPayload } from '@/types/auth';

export const authProvider: AuthBindings = {
  login: async (payload: LoginPayload) => {
    try {
      const response = await authService.login(payload);
      useAuthStore.getState().setUser(response.user);
      return {
        success: true,
        redirectTo: '/',
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          name: 'LoginError',
          message: error?.response?.data?.message || 'Invalid email or password',
        },
      };
    }
  },
  register: async ({ payload, files }: { payload: CombinedRegistrationPayload; files: File[] }) => {
    try {
      const response = await authService.register(payload, files);
      useAuthStore.getState().setUser(response.user);
      return {
        success: true,
        redirectTo: '/',
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          name: 'RegisterError',
          message: error?.response?.data?.message || 'Failed to register',
        },
      };
    }
  },
  logout: async () => {
    useAuthStore.getState().clearUser();
    return {
      success: true,
      redirectTo: '/login',
    };
  },
  check: async () => {
    const user = useAuthStore.getState().user;
    if (user) {
      return {
        authenticated: true,
      };
    }
    return {
      authenticated: false,
      logout: true,
      redirectTo: '/login',
    };
  },
  getIdentity: async () => {
    return useAuthStore.getState().user;
  },
  onError: async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        logout: true,
      };
    }
    return { error };
  },
};
