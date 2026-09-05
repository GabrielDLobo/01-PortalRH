import { apiService } from './api';
import { LeaveRequest, CreateLeaveRequest, UpdateLeaveRequest } from '../types/leave';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface LeaveFilters {
  status?: string;
  leave_type?: string;
  employee?: number;
  start_date_from?: string;
  start_date_to?: string;
  page?: number;
  page_size?: number;
}

class LeaveService {
  async getLeaveRequests(filters?: LeaveFilters): Promise<PaginatedResponse<LeaveRequest>> {
    return await apiService.get<PaginatedResponse<LeaveRequest>>('/leaves/', filters);
  }

  async getMyLeaveRequests(filters?: LeaveFilters): Promise<PaginatedResponse<LeaveRequest>> {
    return await apiService.get<PaginatedResponse<LeaveRequest>>('/leaves/my-requests/', filters);
  }

  async getLeaveRequest(id: number): Promise<LeaveRequest> {
    return await apiService.get<LeaveRequest>(`/leaves/${id}/`);
  }

  async createLeaveRequest(data: CreateLeaveRequest): Promise<LeaveRequest> {
    return await apiService.post<LeaveRequest>('/leaves/', data);
  }

  async updateLeaveRequest(data: UpdateLeaveRequest): Promise<LeaveRequest> {
    const { id, ...updateData } = data;
    return await apiService.patch<LeaveRequest>(`/leaves/${id}/`, updateData);
  }

  async approveLeaveRequest(id: number, adminNotes?: string): Promise<LeaveRequest> {
    return await apiService.patch<LeaveRequest>(`/leaves/${id}/`, {
      status: 'approved',
      admin_notes: adminNotes,
    });
  }

  async rejectLeaveRequest(id: number, adminNotes?: string): Promise<LeaveRequest> {
    return await apiService.patch<LeaveRequest>(`/leaves/${id}/`, {
      status: 'rejected',
      admin_notes: adminNotes,
    });
  }

  async deleteLeaveRequest(id: number): Promise<void> {
    await apiService.delete(`/leaves/${id}/`);
  }

  async getLeaveStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    by_type: Record<string, number>;
  }> {
    return await apiService.get('/leaves/stats/');
  }

  async getLeaveBalance(employeeId?: number): Promise<{
    annual_leave: number;
    sick_leave: number;
    personal_leave: number;
  }> {
    const endpoint = employeeId 
      ? `/leaves/balance/${employeeId}/`
      : '/leaves/balance/';
    return await apiService.get(endpoint);
  }
}

export const leaveService = new LeaveService();