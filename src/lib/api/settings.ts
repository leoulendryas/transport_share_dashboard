// src/lib/api/settings.ts
import { api } from './client';
import type { SystemSettings } from '@/types/admin';

export const settingsApi = {
  async get(): Promise<SystemSettings> {
    const { data } = await api.get<SystemSettings>('/settings');
    return data;
  },

  async update(settings: Record<string, string>): Promise<{ message: string }> {
    const { data } = await api.put('/settings', { settings });
    return data;
  }
};
