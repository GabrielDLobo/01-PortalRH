// Contrato real do app `evaluations` (evaluations/serializers.py).
// types/evaluation.ts (singular) é o arquivo antigo e desatualizado, ainda
// usado por pages/Reports.tsx até sua própria reconstrução na Fase 3.

export type EvaluationStatus = 'rascunho' | 'pendente' | 'em_andamento' | 'concluida' | 'aprovada' | 'rejeitada';
export type EvaluationType = 'auto_avaliacao' | 'avaliacao_superior' | 'avaliacao_360' | 'avaliacao_pares';

export interface EvaluationCriteria {
  id: number;
  template: number;
  nome: string;
  descricao: string;
  peso: string;
  ordem: number;
}

export interface EvaluationTemplate {
  id: number;
  nome: string;
  descricao: string;
  ativo: boolean;
  criteria: EvaluationCriteria[];
  criteria_count: number;
}

export interface EvaluationScore {
  id: number;
  avaliacao: number;
  criterio: number;
  criterio_info: EvaluationCriteria;
  nota: string;
  comentario: string;
  weighted_score: number;
}

export interface EvaluationListItem {
  id: number;
  template: number;
  template_name: string;
  avaliado: number;
  avaliado_name: string;
  avaliador: number;
  avaliador_name: string;
  tipo: EvaluationType;
  tipo_display: string;
  periodo_inicio: string;
  periodo_fim: string;
  status: EvaluationStatus;
  status_display: string;
  nota_final: string | null;
  is_completed: boolean;
  is_pending: boolean;
  data_limite: string | null;
  data_conclusao: string | null;
  created_at: string;
}

export interface EvaluationDetail extends Omit<EvaluationListItem, 'template_name' | 'avaliado_name' | 'avaliador_name'> {
  template_info: EvaluationTemplate;
  avaliado_info: { id: number; first_name: string; last_name: string; email: string };
  avaliador_info: { id: number; first_name: string; last_name: string; email: string };
  scores: EvaluationScore[];
  comentario_geral: string;
  pontos_fortes: string;
  pontos_melhoria: string;
  metas_objetivos: string;
  updated_at: string;
}

export interface CreateEvaluationRequest {
  template: number;
  avaliado: number;
  tipo: EvaluationType;
  periodo_inicio: string;
  periodo_fim: string;
  data_limite?: string;
}

export interface UpdateEvaluationRequest {
  comentario_geral?: string;
  pontos_fortes?: string;
  pontos_melhoria?: string;
  metas_objetivos?: string;
  data_limite?: string;
}
