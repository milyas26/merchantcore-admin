// Shared interfaces untuk frontend merchantcore-admin

export interface ErrorResponse {
  success: boolean;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}