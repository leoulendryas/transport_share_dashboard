// src/lib/api/companies.ts
import { api } from './client';
import type { Company, CompanyStat } from '@/types/admin';

export const companiesApi = {
  async list(): Promise<Company[]> {
    const { data } = await api.get('companies');
    return data;
  },

  async getStats(): Promise<CompanyStat[]> {
    const { data } = await api.get('companies/stats');
    return data;
  },

  async create(name: string): Promise<Company> {
    const { data } = await api.post('companies', { name });
    return data;
  },

  async update(id: number, payload: { name?: string; is_active?: boolean }): Promise<Company> {
    const { data } = await api.put(`companies/${id}`, payload);
    return data;
  },

  async delete(id: number): Promise<{ message: string }> {
    const { data } = await api.delete(`companies/${id}`);
    return data;
  }
};
