import { useCallback } from "react";
import { useAuthStore } from "../authStore";
import type { LoginRequest, RegisterRequest } from "../types/interface";

export const useAuth = () => {
  const {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  } = useAuthStore();

  const handleLogin = useCallback(
    async (credentials: LoginRequest) => {
      return await login(credentials);
    },
    [login]
  );

  const handleRegister = useCallback(
    async (userData: RegisterRequest) => {
      return await register(userData);
    },
    [register]
  );

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const handleClearError = useCallback(() => {
    clearError();
  }, [clearError]);

  return {
    // State
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError: handleClearError,
  };
};

export default useAuth;
