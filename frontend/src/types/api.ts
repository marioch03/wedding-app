export interface ApiErrorResponse {
  timestamp?: string;
  status: number;
  error: string;
  message: string;
  path?: string;
  fieldErrors?: Record<string, string>;
}

export class AppApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number = 500, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'AppApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export class ApiError extends AppApiError {
  constructor(message: string, status: number = 500, fieldErrors?: Record<string, string>) {
    super(message, status, fieldErrors);
    this.name = 'ApiError';
  }
}

