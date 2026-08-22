import { NextResponse } from 'next/server';
import { z } from 'zod';

export type ApiErrorResponse = {
  error: {
    message: string;
    details?: any;
  };
};

export type ApiSuccessResponse<T> = {
  data: T;
};

/**
 * Returns a standardized success response.
 */
export function apiResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

/**
 * Returns a standardized error response.
 */
export function apiError(message: string, status = 500, details?: any) {
  const payload: ApiErrorResponse = {
    error: {
      message,
      ...(details ? { details } : {}),
    },
  };
  return NextResponse.json(payload, { status });
}

/**
 * Helper to handle Zod validation errors easily.
 */
export function apiValidationError(error: z.ZodError) {
  return apiError('Validation failed', 400, error.errors);
}
