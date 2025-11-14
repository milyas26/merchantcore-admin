import { AuthRepository, authRepository } from '../api/authApi';
import type { LoginRequest, RegisterRequest, User, Tokens, AuthResponse, ErrorResponse } from '../types/interface';
import { AuthErrorCode } from '../types/enum';
import api from '@/interceptors/axiosInterceptor';

export class AuthService {
  private authRepository: AuthRepository;

  constructor(authRepo: AuthRepository = authRepository) {
    this.authRepository = authRepo;
  }

  async register(userData: RegisterRequest): Promise<{ user: User; tokens: Tokens }> {
    try {
      const response: AuthResponse = await this.authRepository.register(userData);
      
      if (!response.success || !response.data) {
        throw new Error('Registration failed: Invalid response format');
      }

      const { user, tokens } = response.data;
      
      // Store tokens in localStorage
      this.storeTokens(tokens);
      
      return { user, tokens };
    } catch (error) {
      if (this.isErrorResponse(error)) {
        throw this.mapErrorResponse(error);
      }
      throw new Error('Registration failed: An unexpected error occurred');
    }
  }

  async login(credentials: LoginRequest): Promise<{ user: User; tokens: Tokens }> {
    try {
      const response: AuthResponse = await this.authRepository.login(credentials);
      
      if (!response.success || !response.data) {
        throw new Error('Login failed: Invalid response format');
      }

      const { user, tokens } = response.data;
      
      // Store tokens in localStorage
      this.storeTokens(tokens);
      
      return { user, tokens };
    } catch (error) {
      if (this.isErrorResponse(error)) {
        throw this.mapErrorResponse(error);
      }
      throw new Error('Login failed: An unexpected error occurred');
    }
  }

  async refreshToken(): Promise<{ user: User; tokens: Tokens } | null> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return null;
    }

    try {
      const response: AuthResponse = await this.authRepository.refreshToken(refreshToken);
      
      if (!response.success || !response.data) {
        throw new Error('Token refresh failed: Invalid response format');
      }

      const { user, tokens } = response.data;
      
      // Store new tokens in localStorage
      this.storeTokens(tokens);
      
      return { user, tokens };
    } catch (error) {
      // If refresh fails, clear tokens and return null
      this.clearTokens();
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    
    if (refreshToken) {
      try {
        await this.authRepository.logout(refreshToken);
      } catch (error) {
        // Silently handle logout errors
        console.error('Logout error:', error);
      }
    }
    
    this.clearTokens();
  }

  // Token management methods
  storeTokens(tokens: Tokens): void {
    localStorage.setItem('access_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);
    
    // Update axios default headers
    this.updateAxiosHeaders(tokens.accessToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Clear axios default headers
    this.updateAxiosHeaders(null);
  }

  updateAxiosHeaders(token: string | null): void {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }

  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    return !!accessToken;
  }

  // Helper methods
  private isErrorResponse(error: any): error is ErrorResponse {
    return error && typeof error === 'object' && 'success' in error && 'error' in error;
  }

  private mapErrorResponse(errorResponse: ErrorResponse): Error {
    const { code, message } = errorResponse.error;
    
    switch (code) {
      case AuthErrorCode.INVALID_CREDENTIALS:
        return new Error('Invalid email or password');
      case AuthErrorCode.USER_INACTIVE:
        return new Error('Your account is inactive. Please contact support.');
      case AuthErrorCode.USER_ALREADY_EXISTS:
        return new Error('An account with this email already exists');
      case AuthErrorCode.VALIDATION_ERROR:
        return new Error('Please check your input and try again');
      default:
        return new Error(message || 'An error occurred. Please try again.');
    }
  }
}

export const authService = new AuthService();