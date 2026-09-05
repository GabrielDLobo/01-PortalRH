import { apiService } from './api';
import {
  CreateLeaveRequest,
  LeaveBalance,
  LeaveRequestDetail,
  LeaveRequestListItem,
  LeaveType,
} from '../types/leave';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface LeaveRequestFilters {
  status?: string;
  tipo?: number;
  prioridade?: string;
  search?: string;
  ordering?: string;
  page?: number;
}

const BASE = '/v1/leave-requests/requests';

class LeaveService {
  async getLeaveRequests(filters?: LeaveRequestFilters): Promise<PaginatedResponse<LeaveRequestListItem>> {
    return apiService.get<PaginatedResponse<LeaveRequestListItem>>(`${BASE}/`, filters);
  }

  async getMyLeaveRequests(): Promise<LeaveRequestListItem[]> {
    return apiService.get<LeaveRequestListItem[]>(`${BASE}/my_requests/`);
  }

  async getLeaveRequest(id: number): Promise<LeaveRequestDetail> {
    return apiService.get<LeaveRequestDetail>(`${BASE}/${id}/`);
  }

  async createLeaveRequest(data: CreateLeaveRequest): Promise<LeaveRequestDetail> {
    return apiService.post<LeaveRequestDetail>(`${BASE}/`, data);
  }

  async approveLeaveRequest(id: number, comentario?: string): Promise<{ message: string; status: string }> {
    return apiService.post(`${BASE}/${id}/approve/`, { action: 'approve', comentario });
  }

  async rejectLeaveRequest(id: number, comentario?: string): Promise<{ message: string; status: string }> {
    return apiService.post(`${BASE}/${id}/approve/`, { action: 'reject', comentario });
  }

  async cancelLeaveRequest(id: number): Promise<{ message: string }> {
    return apiService.post(`${BASE}/${id}/cancel/`);
  }

  async getLeaveTypes(): Promise<PaginatedResponse<LeaveType>> {
    return apiService.get<PaginatedResponse<LeaveType>>('/v1/leave-requests/types/');
  }

  async getLeaveBalances(filters?: { funcionario?: number; ano?: number }): Promise<PaginatedResponse<LeaveBalance>> {
    return apiService.get<PaginatedResponse<LeaveBalance>>('/v1/leave-requests/balances/', filters);
  }
}

export const leaveService = new LeaveService();
