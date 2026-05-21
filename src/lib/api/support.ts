// src/lib/api/support.ts
import { api } from './client';
import type { PaginatedResponse } from '@/types/admin';

export const supportApi = {
  async list(page = 1, limit = 20): Promise<PaginatedResponse<any>> {
    const { data } = await api.get('/support', { params: { page, limit } });
    return data;
  },

  async reply(messageId: number, reply: string): Promise<{ message: string }> {
    const { data } = await api.post(`/support/${messageId}/reply`, { reply });
    return data;
  }
};
