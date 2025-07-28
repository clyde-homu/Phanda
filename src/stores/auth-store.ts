import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '../boot/axios';

export interface User {
  id: string;
  email: string;
  username: string;
  totalGems: number;
  totalHintsUsed: number;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    tokens: AuthTokens;
  };
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const isAuthenticated = computed(() => !!user.value && !!accessToken.value);
  const isGuest = computed(() => !isAuthenticated.value);

  // Actions
  const setTokens = (tokens: AuthTokens) => {
    accessToken.value = tokens.accessToken;
    refreshToken.value = tokens.refreshToken;

    // Store tokens in localStorage for persistence
    localStorage.setItem('phanda-access-token', tokens.accessToken);
    localStorage.setItem('phanda-refresh-token', tokens.refreshToken);
  };

  const setUser = (userData: User) => {
    user.value = userData;
    localStorage.setItem('phanda-user', JSON.stringify(userData));
  };

  const clearAuth = () => {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    error.value = null;

    // Clear localStorage
    localStorage.removeItem('phanda-access-token');
    localStorage.removeItem('phanda-refresh-token');
    localStorage.removeItem('phanda-user');
  };

  const login = async (credentials: LoginCredentials): Promise<User> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);

      if (response.data.success) {
        setTokens(response.data.data.tokens);
        setUser(response.data.data.user);
        return response.data.data.user;
      } else {
        throw new Error('Login failed');
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
            'Login failed';

      error.value = errorMessage;
      throw new Error(errorMessage);
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (registerData: RegisterData): Promise<User> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await api.post<AuthResponse>('/auth/register', registerData);

      if (response.data.success) {
        setTokens(response.data.data.tokens);
        setUser(response.data.data.user);
        return response.data.data.user;
      } else {
        throw new Error('Registration failed');
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
            'Registration failed';

      error.value = errorMessage;
      throw new Error(errorMessage);
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (accessToken.value) {
        await api.post('/auth/logout');
      }
    } catch (err) {
      console.warn('Logout request failed:', err);
    } finally {
      clearAuth();
    }
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    if (!refreshToken.value) {
      clearAuth();
      return null;
    }

    try {
      const response = await api.post<{ success: boolean; data: { tokens: AuthTokens } }>(
        '/auth/refresh',
        {
          refreshToken: refreshToken.value,
        }
      );

      if (response.data.success) {
        setTokens(response.data.data.tokens);
        return response.data.data.tokens.accessToken;
      } else {
        clearAuth();
        return null;
      }
    } catch (err) {
      console.error('Token refresh failed:', err);
      clearAuth();
      return null;
    }
  };

  const loadStoredAuth = (): void => {
    try {
      const storedAccessToken = localStorage.getItem('phanda-access-token');
      const storedRefreshToken = localStorage.getItem('phanda-refresh-token');
      const storedUser = localStorage.getItem('phanda-user');

      if (storedAccessToken && storedRefreshToken && storedUser) {
        accessToken.value = storedAccessToken;
        refreshToken.value = storedRefreshToken;
        user.value = JSON.parse(storedUser);
      }
    } catch (err) {
      console.error('Failed to load stored auth:', err);
      clearAuth();
    }
  };

  const updateUser = (userData: Partial<User>): void => {
    const currentUser = user.value;
    if (currentUser) {
      user.value = { ...currentUser, ...userData };
      localStorage.setItem('phanda-user', JSON.stringify(user.value));
    }
  };

  const clearError = (): void => {
    error.value = null;
  };

  // Initialize auth from localStorage on store creation
  loadStoredAuth();

  return {
    // State
    user,
    accessToken,
    refreshToken,
    isLoading,
    error,

    // Computed
    isAuthenticated,
    isGuest,

    // Actions
    login,
    register,
    logout,
    refreshAccessToken,
    loadStoredAuth,
    updateUser,
    clearAuth,
    clearError,
    setTokens,
    setUser,
  };
});
