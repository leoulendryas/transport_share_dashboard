// src/lib/api/dashboard.ts
import { api } from './client';
import type { DashboardStats, GrowthStats } from '@/types/admin';

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await api.get<DashboardStats>('/stats/dashboard');
    return data;
  },

  async getGrowth(): Promise<GrowthStats> {
    const { data } = await api.get<GrowthStats>('/stats/growth');
    return data;
  }
};
