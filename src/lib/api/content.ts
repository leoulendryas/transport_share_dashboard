// src/lib/api/content.ts
import { api } from './client';
import type { Review, Message, PaginatedResponse } from '@/types/admin';

export interface GetMessagesParams {
  page?:   number;
  limit?:  number;
  search?: string;
  userId?: number;
  rideId?: number;
}

export const contentApi = {
  async listReviews(page = 1, limit = 10, min_rating?: number): Promise<Review[]> {
    const { data } = await api.get('reviews', { params: { page, limit, min_rating } });
    return data;
  },

  async deleteReview(id: number): Promise<{ message: string }> {
    const { data } = await api.delete(`reviews/${id}`);
    return data;
  },

  async listMessages(params: GetMessagesParams = {}): Promise<PaginatedResponse<Message>> {
    const { data } = await api.get('messages', { params });
    return data;
  },

  async deleteMessage(id: number, reason?: string): Promise<{ message: string }> {
    const { data } = await api.delete(`messages/${id}`, { data: { reason } });
    return data;
  }
};
