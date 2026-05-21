// src/lib/api/errors.ts
import { AxiosError } from 'axios';
import type { ApiError } from '@/types/admin';

export function extractError(err: unknown): string {
  const axErr = err as AxiosError<ApiError>;
  if (axErr.response?.data?.error)  return axErr.response.data.error;
  if (axErr.response?.data?.errors) return axErr.response.data.errors.map(e => e.msg).join(', ');
  if (axErr.message) return axErr.message;
  return 'An unexpected error occurred';
}
