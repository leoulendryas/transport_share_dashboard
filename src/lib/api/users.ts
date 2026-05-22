// src/lib/api/users.ts
import { api } from './client';
import type {
  AdminUser, UserDetail, MemberLevel,
  PaginatedResponse, AuditLog
} from '@/types/admin';

export interface GetUsersParams {
  page?:                number;
  limit?:               number;
  search?:              string;
  banned?:              boolean;
  is_admin?:            boolean;
  verification_status?: 'pending_id' | 'pending_license';
}

export const usersApi = {
  async list(params: GetUsersParams = {}): Promise<PaginatedResponse<AdminUser>> {
    const { data } = await api.get('users', { params });
    return data;
  },

  async get(userId: number): Promise<UserDetail> {
    const { data } = await api.get(`users/${userId}`);
    return data;
  },

  async getAuditLogs(userId: number): Promise<AuditLog[]> {
    const { data } = await api.get(`users/${userId}/audit-logs`);
    return data;
  },

  async ban(userId: number): Promise<{ message: string }> {
    const { data } = await api.post(`users/${userId}/ban`);
    return data;
  },

  async unban(userId: number): Promise<{ message: string }> {
    const { data } = await api.post(`users/${userId}/unban`);
    return data;
  },

  async suspend(userId: number, days: number, reason?: string): Promise<{
    message: string;
    suspended_until: string;
  }> {
    const { data } = await api.post(`users/${userId}/suspend`, { days, reason });
    return data;
  },

  async unsuspend(userId: number): Promise<{ message: string }> {
    const { data } = await api.post(`users/${userId}/unsuspend`);
    return data;
  },

  async toggleAdmin(userId: number, is_admin: boolean): Promise<{ message: string }> {
    const { data } = await api.post(`users/${userId}/toggle-admin`, { is_admin });
    return data;
  },

  async updateMemberLevel(userId: number, member_level: MemberLevel): Promise<{ message: string }> {
    const { data } = await api.post(`users/${userId}/member-level`, { member_level });
    return data;
  }
};
