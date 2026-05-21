// src/lib/api/vehicles.ts
import { api } from './client';
import type { Vehicle } from '@/types/admin';

export const vehiclesApi = {
  async listPending(page = 1, limit = 10): Promise<Vehicle[]> {
    const { data } = await api.get('/vehicles/pending', { params: { page, limit } });
    return data;
  },

  async approve(id: number): Promise<{ message: string }> {
    const { data } = await api.post(`/vehicles/${id}/approve`);
    return data;
  },

  async reject(id: number, reason: string): Promise<{ message: string }> {
    const { data } = await api.post(`/vehicles/${id}/reject`, { reason });
    return data;
  }
};
