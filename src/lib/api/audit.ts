// src/lib/api/audit.ts
import { api } from './client';
import type { PaginatedResponse, AuditLog } from '@/types/admin';

export interface GetAuditLogsParams {
  page?:        number;
  limit?:       number;
  admin_id?:    number;
  action?:      string;
  target_type?: string;
  start_date?:  string;
  end_date?:    string;
}

export const auditApi = {
  async list(params: GetAuditLogsParams = {}): Promise<PaginatedResponse<AuditLog>> {
    const { data } = await api.get('/admin-logs', { params });
    return data;
  }
};
