// src/lib/api/payments.ts
import { api } from './client';
import type { Payment, PaymentStatus, PaginatedResponse } from '@/types/admin';

export interface GetPaymentsParams {
  page?:       number;
  limit?:      number;
  status?:     PaymentStatus;
  released?:   boolean;
  start_date?: string;
  end_date?:   string;
}

export const paymentsApi = {
  async list(params: GetPaymentsParams = {}): Promise<PaginatedResponse<Payment>> {
    const { data } = await api.get('payments', { params });
    return data;
  },

  async updateStatus(id: number, payload: {
    status?:             PaymentStatus;
    released_to_driver?: boolean;
  }): Promise<{ message: string }> {
    const { data } = await api.post(`payments/${id}/update-status`, payload);
    return data;
  },

  async refund(paymentId: number, amount_percent = 1.0, reason?: string): Promise<{ message: string }> {
    const { data } = await api.post(`payments/${paymentId}/refund`, { amount_percent, reason });
    return data;
  },

  async verifyManual(tx_ref: string): Promise<{ message: string; already_synced?: boolean; data: unknown }> {
    const { data } = await api.post(`payments/${tx_ref}/verify-manual`);
    return data;
  },

  async releaseManual(paymentId: number): Promise<{ message: string; payment: Payment }> {
    const { data } = await api.post(`payments/${paymentId}/release-manual`);
    return data;
  }
};
