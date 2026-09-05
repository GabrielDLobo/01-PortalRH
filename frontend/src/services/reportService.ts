import { apiService } from './api';
import { ReportResult, ReportType } from '../types/report';

// A view do backend usa ?format= para escolher pdf/excel/csv, mas o DRF
// reserva esse mesmo query param para negociação de conteúdo e nunca chega
// a rodar a view nesses casos (404 antes da lógica de negócio). Só ?format=json
// funciona de fato; PDF/Excel são gerados aqui no cliente a partir do JSON.
class ReportService {
  async getReport(type: ReportType, filters?: Record<string, string | number>): Promise<ReportResult> {
    return apiService.get<ReportResult>(`/v1/reports/dashboard/${type}_report/`, {
      ...filters,
      format: 'json',
    });
  }
}

export const reportService = new ReportService();
