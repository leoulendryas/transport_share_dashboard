// src/lib/api/verifications.ts
import { api } from './client';
import type { AdminUser, PaginatedResponse } from '@/types/admin';

export const verificationsApi = {
  async list(page = 1, limit = 10): Promise<PaginatedResponse<AdminUser>> {
    const { data } = await api.get('verifications', { params: { page, limit } });
    return data;
  },

  async approve(userId: number): Promise<{ message: string }> {
    const { data } = await api.post(`users/${userId}/verify-id/approve`);
    return data;
  },

  async reject(userId: number, reason: string): Promise<{ message: string }> {
    const { data } = await api.post(`users/${userId}/verify-id/reject`, { reason });
    return data;
  }
};
