import { apiService } from './api';
import {
  TerminationReason,
  TerminationRequest,
  CreateTerminationRequest,
  UpdateTerminationRequest,
  TerminationApproval,
  TerminationStats,
  TerminationChecklist,
  TerminationDocument
} from '../types/termination';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface TerminationFilters {
  status?: string;
  urgencia?: string;
  motivo?: number;
  solicitante?: number;
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
}

class TerminationService {
  private readonly baseURL = '/api/v1/termination';

  // Termination Reasons
  async getTerminationReasons(): Promise<TerminationReason[]> {
    return await apiService.get<TerminationReason[]>(`${this.baseURL}/reasons/`);
  }

  async getTerminationReason(id: number): Promise<TerminationReason> {
    return await apiService.get<TerminationReason>(`${this.baseURL}/reasons/${id}/`);
  }

  async createTerminationReason(data: Omit<TerminationReason, 'id' | 'created_at' | 'updated_at'>): Promise<TerminationReason> {
    return await apiService.post<TerminationReason>(`${this.baseURL}/reasons/`, data);
  }

  async updateTerminationReason(id: number, data: Partial<TerminationReason>): Promise<TerminationReason> {
    return await apiService.patch<TerminationReason>(`${this.baseURL}/reasons/${id}/`, data);
  }

  async deleteTerminationReason(id: number): Promise<void> {
    await apiService.delete(`${this.baseURL}/reasons/${id}/`);
  }

  // Termination Requests
  async getTerminationRequests(filters?: TerminationFilters): Promise<PaginatedResponse<TerminationRequest>> {
    return await apiService.get<PaginatedResponse<TerminationRequest>>(`${this.baseURL}/requests/`, filters);
  }

  async getTerminationRequest(id: number): Promise<TerminationRequest> {
    return await apiService.get<TerminationRequest>(`${this.baseURL}/requests/${id}/`);
  }

  async createTerminationRequest(data: CreateTerminationRequest): Promise<TerminationRequest> {
    const formData = new FormData();

    // Append all fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'anexo_documentos' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return await apiService.upload<TerminationRequest>(`${this.baseURL}/requests/`, formData);
  }

  async updateTerminationRequest(data: UpdateTerminationRequest): Promise<TerminationRequest> {
    const { id, ...updateData } = data;

    const formData = new FormData();
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'anexo_documentos' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return await apiService.patch<TerminationRequest>(`${this.baseURL}/requests/${id}/`, formData);
  }

  async deleteTerminationRequest(id: number): Promise<void> {
    await apiService.delete(`${this.baseURL}/requests/${id}/`);
  }

  // Workflow Actions
  async submitForApproval(id: number): Promise<TerminationRequest> {
    return await apiService.post<TerminationRequest>(`${this.baseURL}/requests/${id}/submit_for_approval/`);
  }

  async approveTermination(id: number, data: TerminationApproval): Promise<{ message: string; status: string }> {
    return await apiService.post(`${this.baseURL}/requests/${id}/approve/`, data);
  }

  async rejectTermination(id: number, data: TerminationApproval): Promise<{ message: string; status: string }> {
    return await apiService.post(`${this.baseURL}/requests/${id}/reject/`, data);
  }

  async startProcessing(id: number): Promise<{ message: string; status: string }> {
    return await apiService.post(`${this.baseURL}/requests/${id}/start_processing/`);
  }

  async completeTermination(id: number, valor_rescisao?: number): Promise<{ message: string; status: string; valor_rescisao?: number }> {
    const data = valor_rescisao ? { valor_rescisao } : {};
    return await apiService.post(`${this.baseURL}/requests/${id}/complete/`, data);
  }

  async cancelTermination(id: number): Promise<{ message: string; status: string }> {
    return await apiService.delete(`${this.baseURL}/requests/${id}/cancel/`);
  }

  // Statistics
  async getTerminationStats(): Promise<TerminationStats> {
    return await apiService.get<TerminationStats>(`${this.baseURL}/requests/stats/`);
  }

  // My Requests
  async getMyTerminationRequests(filters?: TerminationFilters): Promise<PaginatedResponse<TerminationRequest>> {
    return await apiService.get<PaginatedResponse<TerminationRequest>>(`${this.baseURL}/requests/my_requests/`, filters);
  }

  // Checklist
  async getTerminationChecklist(terminationId: number): Promise<TerminationChecklist[]> {
    return await apiService.get<TerminationChecklist[]>(`${this.baseURL}/checklist/`, { termination_request: terminationId });
  }

  async markChecklistCompleted(checklistId: number, observacoes?: string): Promise<TerminationChecklist> {
    const data = observacoes ? { observacoes } : {};
    return await apiService.post<TerminationChecklist>(`${this.baseURL}/checklist/${checklistId}/mark_completed/`, data);
  }

  // Documents
  async getTerminationDocuments(terminationId: number): Promise<TerminationDocument[]> {
    return await apiService.get<TerminationDocument[]>(`${this.baseURL}/documents/`, { termination_request: terminationId });
  }

  async uploadTerminationDocument(data: {
    termination_request: number;
    tipo_documento: string;
    nome_arquivo: string;
    arquivo: File;
    observacoes?: string;
  }): Promise<TerminationDocument> {
    const formData = new FormData();
    formData.append('termination_request', data.termination_request.toString());
    formData.append('tipo_documento', data.tipo_documento);
    formData.append('nome_arquivo', data.nome_arquivo);
    formData.append('arquivo', data.arquivo);
    if (data.observacoes) {
      formData.append('observacoes', data.observacoes);
    }

    return await apiService.upload<TerminationDocument>(`${this.baseURL}/documents/`, formData);
  }

  async deleteTerminationDocument(id: number): Promise<void> {
    await apiService.delete(`${this.baseURL}/documents/${id}/`);
  }
}

export const terminationService = new TerminationService();