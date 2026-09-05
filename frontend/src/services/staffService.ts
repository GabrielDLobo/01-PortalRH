import { apiService } from './api';
import {
  Department,
  StaffEmployeeDetail,
  StaffEmployeeDocument,
  StaffEmployeeListItem,
  StaffEmployeeStats,
  StaffEmployeeWriteRequest,
} from '../types/staff';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface StaffEmployeeFilters {
  search?: string;
  status?: string;
  setor?: string;
  cargo?: string;
  ordering?: string;
  page?: number;
}

const BASE = '/v1/staff/employees';

class StaffService {
  async getEmployees(filters?: StaffEmployeeFilters): Promise<PaginatedResponse<StaffEmployeeListItem>> {
    return apiService.get<PaginatedResponse<StaffEmployeeListItem>>(`${BASE}/`, filters);
  }

  async getEmployee(id: number): Promise<StaffEmployeeDetail> {
    return apiService.get<StaffEmployeeDetail>(`${BASE}/${id}/`);
  }

  async createEmployee(userId: number, data: StaffEmployeeWriteRequest): Promise<StaffEmployeeDetail> {
    return apiService.post<StaffEmployeeDetail>(`${BASE}/`, { user: userId, ...data });
  }

  async updateEmployee(id: number, data: Partial<StaffEmployeeWriteRequest>): Promise<StaffEmployeeDetail> {
    return apiService.patch<StaffEmployeeDetail>(`${BASE}/${id}/`, data);
  }

  async deleteEmployee(id: number): Promise<void> {
    return apiService.delete(`${BASE}/${id}/`);
  }

  async getStats(): Promise<StaffEmployeeStats> {
    return apiService.get<StaffEmployeeStats>(`${BASE}/stats/`);
  }

  async updateSalary(id: number, newSalary: number, reason?: string): Promise<{ message: string }> {
    return apiService.post(`${BASE}/${id}/update_salary/`, { new_salary: newSalary, reason });
  }

  async updateStatus(id: number, newStatus: string, reason?: string): Promise<{ message: string }> {
    return apiService.post(`${BASE}/${id}/update_status/`, { new_status: newStatus, reason });
  }

  async getMyInfo(): Promise<StaffEmployeeDetail> {
    return apiService.get<StaffEmployeeDetail>(`${BASE}/my_info/`);
  }

  async getDepartments(): Promise<PaginatedResponse<Department>> {
    return apiService.get<PaginatedResponse<Department>>('/v1/staff/departments/');
  }

  async getDocuments(employeeId: number): Promise<PaginatedResponse<StaffEmployeeDocument>> {
    return apiService.get<PaginatedResponse<StaffEmployeeDocument>>('/v1/staff/documents/', {
      employee: employeeId,
    });
  }

  async uploadDocument(data: {
    employee: number;
    tipo: string;
    nome: string;
    descricao?: string;
    arquivo: File;
  }): Promise<StaffEmployeeDocument> {
    const formData = new FormData();
    formData.append('employee', String(data.employee));
    formData.append('tipo', data.tipo);
    formData.append('nome', data.nome);
    if (data.descricao) formData.append('descricao', data.descricao);
    formData.append('arquivo', data.arquivo);
    return apiService.upload<StaffEmployeeDocument>('/v1/staff/documents/', formData);
  }

  async deleteDocument(id: number): Promise<void> {
    return apiService.delete(`/v1/staff/documents/${id}/`);
  }
}

export const staffService = new StaffService();
