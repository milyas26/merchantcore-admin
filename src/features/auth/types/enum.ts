// Auth types/enums
export const AuthErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  USER_INACTIVE: "USER_INACTIVE",
  INVALID_OR_EXPIRED_REFRESH_TOKEN: "INVALID_OR_EXPIRED_REFRESH_TOKEN",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",
} as const;

export type AuthErrorCode = (typeof AuthErrorCode)[keyof typeof AuthErrorCode];

export const AuthStatus = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const;

export type AuthStatus = (typeof AuthStatus)[keyof typeof AuthStatus];

export const UserRole = {
  ADMIN: "admin",
  MERCHANT: "merchant",
  USER: "user",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
