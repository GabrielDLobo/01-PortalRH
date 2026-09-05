// Contrato real do app `termination` (termination/serializers.py).
// types/termination.ts é o arquivo antigo e desatualizado (campos que não
// existem no model real), ainda usado por pages/Reports.tsx até sua própria
// reconstrução na Fase 3. Dashboard.tsx só usa TerminationStats de lá, que já
// bate com a API real, então ficou como está.

export type TerminationStatus =
  | 'rascunho'
  | 'pendente_rh'
  | 'aprovada_rh'
  | 'rejeitada_rh'
  | 'processando'
  | 'concluida'
  | 'cancelada';

export interface TerminationReason {
  id: number;
  nome: string;
  codigo: string;
  descricao: string;
  ativo: boolean;
}

export interface TerminationRequestListItem {
  id: number;
  funcionario: number;
  funcionario_name: string;
  funcionario_email: string;
  solicitante: number;
  solicitante_name: string;
  motivo: number;
  motivo_nome: string;
  motivo_codigo: string;
  data_ultimo_dia: string;
  data_desligamento: string;
  justificativa: string;
  status: TerminationStatus;
  status_display: string;
  aprovador_rh: number | null;
  aprovador_rh_name: string | null;
  data_aprovacao_rh: string | null;
  is_draft: boolean;
  is_pending_hr: boolean;
  is_approved: boolean;
  is_completed: boolean;
  can_be_edited: boolean;
  created_at: string;
}

export interface CreateTerminationRequest {
  funcionario: number;
  motivo: number;
  data_ultimo_dia: string;
  data_desligamento: string;
  justificativa: string;
}
