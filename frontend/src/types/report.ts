// Contrato real de reports/views.py (DashboardViewSet) + reports/services.py.

export type ReportType = 'employees' | 'terminations' | 'evaluations' | 'leave_requests' | 'admissions';

export interface ReportResult {
  report_type: ReportType;
  generated_at: string;
  filters: Record<string, unknown>;
  summary: Record<string, unknown>;
  data: Record<string, unknown>[];
  total_records: number;
}

export const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'employees', label: 'Quadro de Funcionários' },
  { value: 'leave_requests', label: 'Férias e Afastamentos' },
  { value: 'terminations', label: 'Desligamentos' },
  { value: 'evaluations', label: 'Avaliações de Desempenho' },
  { value: 'admissions', label: 'Admissões' },
];
