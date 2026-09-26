import { isAxiosError } from '@/lib/axios';

/**
 * The server's stable machine-readable code, e.g. `TRIP_ALREADY_ACTIVE`. Needed wherever the app must
 * branch on *which* failure it was — retry-once on TRIP_NOT_FOUND, clear a blocker on
 * TRIP_ALREADY_ACTIVE, offer a disambiguation path on AMBIGUOUS_ACTIVE_TRIP — which a message string
 * cannot safely do.
 */
export const getErrorCode = (error: unknown): string | null => {
  if (isAxiosError(error)) {
    return error.response?.data?.error ?? null;
  }

  return null;
};

export const getErrorMessage = (error: unknown): string => {
  if (isAxiosError(error)) {
    return error.response?.data?.message || error.response?.data?.error || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};
