import { apiService } from './api';
import {
  CreateEvaluationRequest,
  EvaluationDetail,
  EvaluationListItem,
  EvaluationTemplate,
  UpdateEvaluationRequest,
} from '../types/performanceEvaluation';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface EvaluationFilters {
  status?: string;
  tipo?: string;
  avaliado?: number;
  ordering?: string;
  page?: number;
}

const BASE = '/v1/evaluations/evaluations';

class PerformanceEvaluationService {
  async getEvaluations(filters?: EvaluationFilters): Promise<PaginatedResponse<EvaluationListItem>> {
    return apiService.get<PaginatedResponse<EvaluationListItem>>(`${BASE}/`, filters);
  }

  async getEvaluation(id: number): Promise<EvaluationDetail> {
    return apiService.get<EvaluationDetail>(`${BASE}/${id}/`);
  }

  async createEvaluation(data: CreateEvaluationRequest): Promise<EvaluationDetail> {
    return apiService.post<EvaluationDetail>(`${BASE}/`, data);
  }

  async updateEvaluation(id: number, data: UpdateEvaluationRequest): Promise<EvaluationDetail> {
    return apiService.patch<EvaluationDetail>(`${BASE}/${id}/`, data);
  }

  async addScore(evaluationId: number, criterio: number, nota: number, comentario?: string) {
    return apiService.post(`${BASE}/${evaluationId}/scores/`, { criterio, nota, comentario });
  }

  async finalize(id: number, comentario?: string): Promise<{ message: string; status: string; nota_final: string }> {
    return apiService.post(`${BASE}/${id}/evaluate/`, { action: 'finalize', comentario });
  }

  async approve(id: number, comentario?: string): Promise<{ message: string; status: string }> {
    return apiService.post(`${BASE}/${id}/evaluate/`, { action: 'approve', comentario });
  }

  async reject(id: number, comentario?: string): Promise<{ message: string; status: string }> {
    return apiService.post(`${BASE}/${id}/evaluate/`, { action: 'reject', comentario });
  }

  async getTemplates(): Promise<PaginatedResponse<EvaluationTemplate>> {
    return apiService.get<PaginatedResponse<EvaluationTemplate>>('/v1/evaluations/templates/');
  }
}

export const performanceEvaluationService = new PerformanceEvaluationService();
