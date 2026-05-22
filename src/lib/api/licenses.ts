// src/lib/api/licenses.ts
import { api } from './client';
import type { AdminUser, PaginatedResponse } from '@/types/admin';

export const licensesApi = {
  async list(page = 1, limit = 10): Promise<PaginatedResponse<AdminUser>> {
    const { data } = await api.get('licenses', { params: { page, limit } });
    return data;
  },

  async approve(userId: number): Promise<{ message: string }> {
    const { data } = await api.post(`users/${userId}/license/approve`);
    return data;
  },

  async reject(userId: number, reason: string): Promise<{ message: string }> {
    const { data } = await api.post(`users/${userId}/license/reject`, { reason });
    return data;
  }
};
