// src/lib/api/moderation.ts
import { api } from './client';
import type { Report, SOSAlert, PaginatedResponse } from '@/types/admin';

export const moderationApi = {
  async listReports(page = 1, limit = 10, status?: 'pending' | 'resolved' | 'dismissed'): Promise<PaginatedResponse<Report>> {
    const { data } = await api.get('reports', { params: { page, limit, status } });
    return data;
  },

  async resolveReport(id: number, payload: {
    status?:  'resolved' | 'dismissed';
    notes?:   string;
    penalty?: number;
  }): Promise<{ message: string; penalty_applied: number }> {
    const { data } = await api.post(`reports/${id}/resolve`, payload);
    return data;
  },

  async listSOS(page = 1, limit = 10, status?: 'active' | 'resolved'): Promise<SOSAlert[]> {
    const { data } = await api.get('sos', { params: { page, limit, status } });
    return data;
  },

  async resolveSOS(id: number, payload: {
    notes?:              string;
    authority_dispatch?: boolean;
  }): Promise<{ message: string }> {
    const { data } = await api.post(`sos/${id}/resolve`, payload);
    return data;
  }
};
