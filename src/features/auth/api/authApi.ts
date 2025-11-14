import api from "@/interceptors/axiosInterceptor";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/interface";
import type { ErrorResponse } from "@/shared/types/interface";

export class AuthRepository {
  private static instance: AuthRepository;

  private constructor() {}

  public static getInstance(): AuthRepository {
    if (!AuthRepository.instance) {
      AuthRepository.instance = new AuthRepository();
    }
    return AuthRepository.instance;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/register", userData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ErrorResponse;
      }
      throw {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred during registration",
        },
      } as ErrorResponse;
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ErrorResponse;
      }
      throw {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred during login",
        },
      } as ErrorResponse;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/refresh-token", {
        refresh_token: refreshToken,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ErrorResponse;
      }
      throw {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred during token refresh",
        },
      } as ErrorResponse;
    }
  }

  async logout(): Promise<void> {
    try {
      await api.delete("/auth/logout");
    } catch (error: any) {
      console.error("Logout error:", error);
    }
  }
}

export const authRepository = AuthRepository.getInstance();
