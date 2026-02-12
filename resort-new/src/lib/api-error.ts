export type ApiError = Error & {
  status?: number;
  detail?: unknown;
};

export function createApiError(message: string, status?: number, detail?: unknown): ApiError {
  const error = new Error(message) as ApiError;
  error.name = 'ApiError';
  error.status = status;
  error.detail = detail;
  return error;
}

export function isApiError(error: unknown): error is ApiError {
  return Boolean(
    error &&
      typeof error === 'object' &&
      (error as ApiError).name === 'ApiError'
  );
}

export function getApiErrorMessage(error: unknown, fallback = 'Request failed'): string {
  if (isApiError(error)) {
    return error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
}
