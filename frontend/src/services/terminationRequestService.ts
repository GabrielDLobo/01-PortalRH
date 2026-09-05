import { apiService } from './api';
import { CreateTerminationRequest, TerminationReason, TerminationRequestListItem } from '../types/terminationRequest';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const BASE = '/v1/termination/requests';

class TerminationRequestService {
  async getRequests(filters?: { status?: string; ordering?: string }): Promise<PaginatedResponse<TerminationRequestListItem>> {
    return apiService.get<PaginatedResponse<TerminationRequestListItem>>(`${BASE}/`, filters);
  }

  async createRequest(data: CreateTerminationRequest) {
    return apiService.post(`${BASE}/`, data);
  }

  async submitForApproval(id: number) {
    return apiService.post(`${BASE}/${id}/submit_for_approval/`);
  }

  async approve(id: number, comentario?: string) {
    return apiService.post(`${BASE}/${id}/approve/`, { action: 'approve', comentario });
  }

  async reject(id: number, comentario: string) {
    return apiService.post(`${BASE}/${id}/reject/`, { action: 'reject', comentario });
  }

  async startProcessing(id: number) {
    return apiService.post(`${BASE}/${id}/start_processing/`);
  }

  async complete(id: number) {
    return apiService.post(`${BASE}/${id}/complete/`);
  }

  async cancel(id: number) {
    return apiService.delete(`${BASE}/${id}/cancel/`);
  }

  async getReasons(): Promise<PaginatedResponse<TerminationReason>> {
    return apiService.get<PaginatedResponse<TerminationReason>>('/v1/termination/reasons/');
  }
}

export const terminationRequestService = new TerminationRequestService();
