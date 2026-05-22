// src/lib/api/rides.ts
import { api } from './client';
import type {
  Ride, RideDetail, RideParticipant, RideStatusHistoryEntry,
  RideVerification, IntelligenceRide, RideStatus,
  PaginatedResponse, Message
} from '@/types/admin';

export interface GetRidesParams {
  page?:          number;
  limit?:         number;
  status?:        RideStatus;
  start_date?:    string;
  end_date?:      string;
  company_id?:    number;
  from_lat?:      number;
  from_lng?:      number;
  to_lat?:        number;
  to_lng?:        number;
  radius?:        number;
  min_price?:     number;
  max_price?:     number;
}

export const ridesApi = {
  async list(params: GetRidesParams = {}): Promise<PaginatedResponse<Ride>> {
    const { data } = await api.get('rides', { params });
    return data;
  },

  async getLive(): Promise<Ride[]> {
    const { data } = await api.get('rides/live');
    return data;
  },

  async getIntelligence(risk_level = 'high'): Promise<IntelligenceRide[]> {
    const { data } = await api.get('rides/intelligence', { params: { risk_level } });
    return data;
  },

  async get(rideId: number): Promise<RideDetail> {
    const { data } = await api.get(`rides/${rideId}`);
    return data;
  },

  async getHistory(rideId: number): Promise<RideStatusHistoryEntry[]> {
    const { data } = await api.get(`rides/${rideId}/history`);
    return data;
  },

  async getParticipants(rideId: number): Promise<RideParticipant[]> {
    const { data } = await api.get(`rides/${rideId}/participants`);
    return data;
  },

  async getVerifications(rideId: number): Promise<RideVerification[]> {
    const { data } = await api.get(`rides/${rideId}/verifications`);
    return data;
  },

  async getMessages(rideId: number): Promise<Message[]> {
    const { data } = await api.get(`rides/${rideId}/messages`);
    return data;
  },

  async start(rideId: number, notes?: string): Promise<{ message: string; status: 'ongoing' }> {
    const { data } = await api.post(`rides/${rideId}/start`, { notes });
    return data;
  },

  async complete(rideId: number, notes?: string, resolve_verifications = true): Promise<{ message: string; status: 'completed' }> {
    const { data } = await api.post(`rides/${rideId}/complete`, { notes, resolve_verifications });
    return data;
  },

  async finalize(rideId: number, notes?: string): Promise<{ message: string }> {
    const { data } = await api.post(`rides/${rideId}/finalize`, { notes });
    return data;
  },

  async resolveDispute(rideId: number, resolution: 'complete' | 'refund', notes: string): Promise<{ message: string; resolution: string }> {
    const { data } = await api.post(`rides/${rideId}/resolve-dispute`, { resolution, notes });
    return data;
  },

  async updateStatus(rideId: number, status: RideStatus, notes?: string): Promise<{ message: string; from: RideStatus; to: RideStatus }> {
    const { data } = await api.post(`rides/${rideId}/status`, { status, notes });
    return data;
  },

  async cancel(rideId: number): Promise<{ message: string }> {
    const { data } = await api.post(`rides/${rideId}/cancel`);
    return data;
  },

  async toggleChat(rideId: number, lock: boolean): Promise<{ message: string }> {
    const { data } = await api.post(`rides/${rideId}/toggle-chat`, { lock });
    return data;
  },

  async updateDetails(rideId: number, payload: {
    departure_time?: string;
    total_seats?:    number;
    price_per_seat?: number;
    from_address?:   string;
    to_address?:     string;
    admin_notes?:    string;
  }): Promise<{ message: string }> {
    const { data } = await api.put(`rides/${rideId}/details`, payload);
    return data;
  },

  async addParticipant(rideId: number, payload: {
    userId:        number;
    seats_booked?: number;
    status?:       string;
    notes?:        string;
  }): Promise<{ message: string }> {
    const { data } = await api.post(`rides/${rideId}/participants/add`, payload);
    return data;
  },

  async removeParticipant(rideId: number, userId: number, payload: {
    refund?: boolean;
    reason?: string;
  }): Promise<{ message: string; refund_processed: boolean }> {
    const { data } = await api.post(`rides/${rideId}/participants/${userId}/remove`, payload);
    return data;
  },

  async markNoShow(rideId: number, userId: number, payload: {
    notes?:         string;
    apply_penalty?: boolean;
  }): Promise<{ message: string; penalty_applied: boolean }> {
    const { data } = await api.post(`rides/${rideId}/participants/${userId}/no-show`, payload);
    return data;
  }
};
