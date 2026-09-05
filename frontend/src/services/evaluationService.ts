import { apiService } from './api';
import { PerformanceEvaluation, CreateEvaluationRequest, UpdateEvaluationRequest } from '../types/evaluation';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface EvaluationFilters {
  employee?: number;
  evaluator?: number;
  status?: string;
  period_start?: string;
  period_end?: string;
  page?: number;
  page_size?: number;
}

class EvaluationService {
  async getEvaluations(filters?: EvaluationFilters): Promise<PaginatedResponse<PerformanceEvaluation>> {
    return await apiService.get<PaginatedResponse<PerformanceEvaluation>>('/evaluations/', filters);
  }

  async getMyEvaluations(filters?: EvaluationFilters): Promise<PaginatedResponse<PerformanceEvaluation>> {
    return await apiService.get<PaginatedResponse<PerformanceEvaluation>>('/evaluations/my-evaluations/', filters);
  }

  async getEvaluation(id: number): Promise<PerformanceEvaluation> {
    return await apiService.get<PerformanceEvaluation>(`/evaluations/${id}/`);
  }

  async createEvaluation(data: CreateEvaluationRequest): Promise<PerformanceEvaluation> {
    return await apiService.post<PerformanceEvaluation>('/evaluations/', data);
  }

  async updateEvaluation(data: UpdateEvaluationRequest): Promise<PerformanceEvaluation> {
    const { id, ...updateData } = data;
    return await apiService.patch<PerformanceEvaluation>(`/evaluations/${id}/`, updateData);
  }

  async deleteEvaluation(id: number): Promise<void> {
    await apiService.delete(`/evaluations/${id}/`);
  }

  async submitEvaluation(id: number): Promise<PerformanceEvaluation> {
    return await apiService.patch<PerformanceEvaluation>(`/evaluations/${id}/`, {
      status: 'submitted',
    });
  }

  async completeEvaluation(id: number): Promise<PerformanceEvaluation> {
    return await apiService.patch<PerformanceEvaluation>(`/evaluations/${id}/`, {
      status: 'completed',
    });
  }

  async getEvaluationStats(): Promise<{
    total: number;
    draft: number;
    submitted: number;
    completed: number;
    average_rating: number;
  }> {
    return await apiService.get('/evaluations/stats/');
  }
}

export const evaluationService = new EvaluationService();