/**
 * Safely extracts a user-readable error message string from any API response or error object.
 * Prevents React Minified Error #31 (rendering raw objects as JSX children).
 */
export function getErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  if (!error) return fallback;

  if (typeof error === 'string') {
    return error.trim() || fallback;
  }

  if (typeof error === 'object') {
    const obj = error as Record<string, any>;

    // Case 1: Standard API error payload { error: { message: "..." } }
    if (obj.error && typeof obj.error === 'object' && typeof obj.error.message === 'string') {
      return obj.error.message.trim() || fallback;
    }

    // Case 2: Direct error object { message: "..." }
    if (typeof obj.message === 'string') {
      return obj.message.trim() || fallback;
    }

    // Case 3: Flat error payload { error: "..." }
    if (typeof obj.error === 'string') {
      return obj.error.trim() || fallback;
    }

    // Case 4: Zod or details list
    if (Array.isArray(obj.details) && obj.details.length > 0) {
      const first = obj.details[0];
      if (typeof first === 'string') return first;
      if (first?.message) return first.message;
    }

    // Case 5: Details object with message
    if (obj.details && typeof obj.details.message === 'string') {
      return obj.details.message;
    }
  }

  return fallback;
}
