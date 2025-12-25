/**
 * Custom API error class
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errorCode?: string,
    public requestId?: string,
    public fields?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Typed fetch wrapper with error handling
 */
export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        response.status,
        data.error || 'An error occurred',
        data.errorCode,
        data.requestId,
        data.fields
      );
    }

    return data;
  } catch (error) {
    // If it's already an ApiError, rethrow it
    if (error instanceof ApiError) {
      throw error;
    }

    // Network errors or JSON parsing errors
    throw new ApiError(
      0,
      error instanceof Error ? error.message : 'Network error occurred'
    );
  }
}

/**
 * Helper to display user-friendly error messages
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    // Handle validation errors with fields
    if (error.fields) {
      const fieldErrors = Object.entries(error.fields)
        .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
        .join('; ');
      return fieldErrors || error.message;
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
